// 开发用：函数手册 + 流程图工坊的浏览器自检
// 用法：node tools/e2e-tools.mjs [http://localhost:5173]
import { spawn } from 'node:child_process';
import path from 'node:path';

const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.argv[2] || 'http://localhost:5173';
const port = 9400 + Math.floor(Math.random() * 300);
const udd = path.join(process.env.TEMP || '.', 'edge-tools-' + Date.now());
const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  '--user-data-dir=' + udd, '--remote-debugging-port=' + port, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let list = null;
for (let i = 0; i < 80; i++) {
  try { const res = await fetch('http://127.0.0.1:' + port + '/json/list'); list = await res.json(); if (list && list.length) break; } catch (e) { }
  await sleep(250);
}
if (!list) { console.error('devtools 不可用'); proc.kill(); process.exit(1); }
const page = list.find(t => t.type === 'page') || list[0];
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); } });
const send = (m, p) => new Promise((res, rej) => { const i = ++id; pending.set(i, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
await new Promise(r => ws.addEventListener('open', r));
await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.enable');
await send('Page.navigate', { url: BASE + '/index.html' });
await sleep(2600);
async function js(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (r.exceptionDetails) throw new Error('页面抛错：' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description).slice(0, 400));
  return r.result.value;
}
const results = [];
function check(name, ok, detail) {
  results.push(!!ok);
  console.log((ok ? '  ✓ ' : '  ✗ ') + name + (detail ? '  (' + detail + ')' : ''));
}
async function clickText(sel, text) {
  return js('(function(){ var l=[].slice.call(document.querySelectorAll(' + JSON.stringify(sel) + ')); var b=l.filter(function(x){return x.textContent.indexOf(' + JSON.stringify(text) + ')>=0;})[0]; if(!b) return "missing"; b.click(); return "ok"; })()');
}

console.log('\n▸ C 函数手册');
await js('CC.UI.showView("funcs")');
await sleep(500);
const f1 = JSON.parse(await js('JSON.stringify({ errors: window.__bootErrors||[], count: (CC.FUNCS||[]).length, cards: document.querySelectorAll(".func-card").length, headers: document.querySelectorAll(".func-header-item").length, detail: (document.querySelector(".func-detail")||{}).textContent || "" })'));
check('函数手册加载无错误', f1.errors.length === 0, JSON.stringify(f1.errors));
check('函数条目 >= 100', f1.count >= 100, f1.count + ' 条');
check('默认选中一个函数并显示详情', f1.detail.indexOf('size_t strlen') >= 0 || f1.detail.indexOf('printf') >= 0, f1.detail.slice(0, 30).replace(/\n/g, ' '));
check('头文件分类都在', f1.headers >= 12, f1.headers + ' 个头文件');

await js('(function(){ var i=document.querySelector(".func-search"); i.value="strlen"; i.dispatchEvent(new Event("input",{bubbles:true})); })()');
await sleep(300);
const searched = JSON.parse(await js('JSON.stringify({ cards: document.querySelectorAll(".func-card").length, names: [].slice.call(document.querySelectorAll(".func-card b")).map(function(b){return b.textContent;}) })'));
check('搜索 strlen 能找到它', searched.names.indexOf('strlen') >= 0 && searched.cards < 6, JSON.stringify(searched.names));
await clickText('.func-card', 'strlen');
await sleep(300);
const detail = await js('document.querySelector(".func-detail").textContent');
check('点开后显示原型和示例', detail.indexOf('size_t strlen') >= 0 && detail.indexOf('int main') >= 0);
check('标出了「本站可直接运行」', detail.indexOf('可直接运行') >= 0);
await clickText('.func-actions .btn', '在练习场打开');
await sleep(700);
const pg = JSON.parse(await js('JSON.stringify({ view: CC.UI.currentView, code: CC.UI.pgEditor ? CC.UI.pgEditor.getValue() : "" })'));
check('一键打开到练习场并填入示例', pg.view === 'playground' && pg.code.indexOf('strlen') >= 0, pg.view);

await js('CC.UI.showView("funcs")');
await sleep(300);
await js('(function(){ var i=document.querySelector(".func-search"); i.value=""; i.dispatchEvent(new Event("input",{bubbles:true})); })()');
await sleep(300);
await js('(function(){ var l=[].slice.call(document.querySelectorAll(".func-chip")); var b=l.filter(function(x){return x.textContent.indexOf("需要真编译器")>=0;})[0]; b.click(); })()');
await sleep(400);
const warn = JSON.parse(await js('JSON.stringify({ total: document.querySelectorAll(".func-card").length, warns: [].slice.call(document.querySelectorAll(".func-badge")).filter(function(b){return b.textContent.indexOf("真编译器")>=0;}).length })'));
check('筛选「需要真编译器」只显示 ⚠️ 条目', warn.total > 0 && warn.warns >= warn.total, warn.warns + '/' + warn.total);
await js('(function(){ var l=[].slice.call(document.querySelectorAll(".func-chip")); l.filter(function(x){return x.textContent.indexOf("全部")>=0;})[0].click(); })()');

console.log('\n▸ 流程图工坊');
await js('CC.UI.showView("flow")');
await sleep(600);
const fl = JSON.parse(await js('JSON.stringify({ errors: window.__bootErrors||[], nodes: CC.FlowView.nodes.length, edges: CC.FlowView.edges.length, name: CC.FlowView.name, canvas: !!document.querySelector(".flow-canvas") })'));
check('流程图工坊加载无错误', fl.errors.length === 0, JSON.stringify(fl.errors));
check('默认载入了一个模板', fl.nodes >= 6 && fl.edges >= 5, fl.name + '：' + fl.nodes + ' 个图形 / ' + fl.edges + ' 条箭头');
check('画布已就绪', fl.canvas === true);

await clickText('.flow-side .btn', '从我的流程图生成');
await sleep(300);
const outline = await js('document.querySelector(".flow-outline").textContent');
check('能生成思路提纲', outline.indexOf('思路提纲') >= 0 && outline.indexOf('判断') >= 0);
check('能生成 C 代码骨架', outline.indexOf('int main()') >= 0);

const before = await js('CC.FlowView.nodes.length');
await clickText('.flow-tool', '处理');
await sleep(200);
const added = await js('CC.FlowView.nodes.length');
check('点工具栏能加图形', added === before + 1, before + ' → ' + added);
await clickText('.flow-ops .btn', '撤销');
await sleep(200);
check('撤销能回到上一步', (await js('CC.FlowView.nodes.length')) === before);
await js('CC.FlowView.redo()');
await sleep(150);
check('重做能恢复', (await js('CC.FlowView.nodes.length')) === before + 1);

const e0 = await js('CC.FlowView.edges.length');
await js('(function(){ var n = CC.FlowView.nodes; CC.FlowView.connect(n[0].id, n[n.length-1].id); })()');
await sleep(200);
check('能建立连线（箭头）', (await js('CC.FlowView.edges.length')) === e0 + 1);

await clickText('.flow-template', '1 到 100 求和');
await sleep(300);
const sum = JSON.parse(await js('JSON.stringify({ name: CC.FlowView.name, nodes: CC.FlowView.nodes.length, hasDecision: CC.FlowView.nodes.some(function(n){return n.type==="decision";}) })'));
check('换模板正常', sum.name.indexOf('求和') >= 0 && sum.nodes >= 6 && sum.hasDecision, sum.name);

console.log('\n' + (results.every(r => r) ? '✅ 函数手册 + 流程图自检全部通过' : '❌ 有 ' + results.filter(r => !r).length + ' 项失败'));
ws.close(); proc.kill();
process.exit(results.every(r => r) ? 0 : 1);