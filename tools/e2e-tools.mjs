// 开发用：函数手册 + 思维训练（题目 + 流程图）的浏览器自检
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
await send('Emulation.setDeviceMetricsOverride', { width: 1500, height: 1000, deviceScaleFactor: 1, mobile: false });
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
const f1 = JSON.parse(await js('JSON.stringify({ errors: window.__bootErrors||[], count: (CC.FUNCS||[]).length, headers: document.querySelectorAll(".func-header-item").length, detail: (document.querySelector(".func-detail")||{}).textContent || "" })'));
check('函数手册加载无错误', f1.errors.length === 0, JSON.stringify(f1.errors));
check('函数条目 >= 100', f1.count >= 100, f1.count + ' 条');
check('默认选中函数并显示详情', f1.detail.indexOf('printf') >= 0 || f1.detail.indexOf('size_t strlen') >= 0, f1.detail.slice(0, 26).replace(/\n/g, ' '));
check('头文件分类都在', f1.headers >= 12, f1.headers + ' 个');
await js('(function(){ var i=document.querySelector(".func-search"); i.value="strlen"; i.dispatchEvent(new Event("input",{bubbles:true})); })()');
await sleep(300);
const searched = JSON.parse(await js('JSON.stringify({ cards: document.querySelectorAll(".func-card").length, names: [].slice.call(document.querySelectorAll(".func-card b")).map(function(b){return b.textContent;}) })'));
check('搜索 strlen 能找到', searched.names.indexOf('strlen') >= 0 && searched.cards < 6, JSON.stringify(searched.names));
await clickText('.func-card', 'strlen');
await sleep(300);
const detail = await js('document.querySelector(".func-detail").textContent');
check('详情里有原型和示例', detail.indexOf('size_t strlen') >= 0 && detail.indexOf('int main') >= 0);
await clickText('.func-actions .btn', '在练习场打开');
await sleep(700);
const pg = JSON.parse(await js('JSON.stringify({ view: CC.UI.currentView, code: CC.UI.pgEditor ? CC.UI.pgEditor.getValue() : "" })'));
check('一键打开到练习场', pg.view === 'playground' && pg.code.indexOf('strlen') >= 0, pg.view);
await js('CC.UI.showView("funcs")');
await sleep(300);
await js('(function(){ var i=document.querySelector(".func-search"); i.value=""; i.dispatchEvent(new Event("input",{bubbles:true})); })()');
await sleep(300);
await clickText('.func-chip', '需要真编译器');
await sleep(400);
const warn = JSON.parse(await js('JSON.stringify({ total: document.querySelectorAll(".func-card").length, warns: [].slice.call(document.querySelectorAll(".func-badge")).filter(function(b){return b.textContent.indexOf("真编译器")>=0;}).length })'));
check('筛选「需要真编译器」只显示 ⚠️', warn.total > 0 && warn.warns >= warn.total, warn.warns + '/' + warn.total);

console.log('\n▸ 思维训练（题目 + 流程图 + 代码）');
await js('CC.UI.showView("flow")');
await sleep(700);
const th = JSON.parse(await js('JSON.stringify({ errors: window.__bootErrors||[], count: document.querySelectorAll(".think-item").length, title: (document.querySelector(".think-problem-head h2")||{}).textContent || "", nodes: CC.ThinkView.nodes.length, edges: CC.ThinkView.edges.length, hasTask: !!document.querySelector(".think-problem .tag") })'));
check('思维训练加载无错误', th.errors.length === 0, JSON.stringify(th.errors));
check('题目列表有 8 道题', th.count === 8, th.count + ' 道');
check('打开题目时画布是「从开始画起」，不是预填答案', th.title === '成绩等级' && th.nodes === 1 && th.edges === 0, th.title + ' / ' + th.nodes + ' 个框');
check('题目里写着对应的代码练习', th.hasTask === true);

await clickText('.think-side .btn', '检查我的思路');
await sleep(400);
const r1 = JSON.parse(await js('JSON.stringify({ bad: !!document.querySelector(".think-check.bad"), issues: document.querySelectorAll(".think-issue").length, passed: !!(CC.App.state.thinkPassed || {}).T1 })'));
check('只画一个「开始」会被指出问题', r1.bad === true && r1.issues >= 2, r1.issues + ' 条问题');
check('没通过时不会记成完成', r1.passed === false);

// 按照参考流程图补齐，再检查
await js('(function(){ var p = CC.ThinkView.problemById("T1"); var ref = CC.ThinkView.referenceOf(p); CC.ThinkView.nodes = JSON.parse(JSON.stringify(ref.nodes)); CC.ThinkView.edges = JSON.parse(JSON.stringify(ref.edges)); CC.ThinkView.render(); })()');
await sleep(300);
await clickText('.think-side .btn', '检查我的思路');
await sleep(500);
const r2 = JSON.parse(await js('JSON.stringify({ ok: !!document.querySelector(".think-check.ok"), passed: !!(CC.App.state.thinkPassed || {}).T1, good: document.querySelectorAll(".think-good").length })'));
check('画完整后思路检查通过', r2.ok === true, r2.good + ' 条肯定');
check('思路通过会记录下来', r2.passed === true);
check('通过后弹出夸夸（情绪价值）', (await js('document.querySelectorAll(".fx-bubble").length')) > 3);
await js('document.querySelector(".fx-exit") && document.querySelector(".fx-exit").click()');
await sleep(400);

await clickText('.think-side .btn', '看参考流程图');
await sleep(400);
check('能打开参考流程图', await js('!!document.querySelector(".think-ref-card") && !!document.querySelector(".think-ref-canvas")'));
await clickText('.think-ref-card .btn', '关闭');
await sleep(300);

await clickText('.think-side .btn', '去写代码');
await sleep(500);
const codePanel = JSON.parse(await js('JSON.stringify({ open: !!document.querySelector(".think-code-card"), editor: !!document.querySelector(".think-code-card textarea") })'));
check('「去写代码」会打开对应练习', codePanel.open === true && codePanel.editor === true);
await clickText('.think-code-card .btn', '关闭');
await sleep(300);

await clickText('.think-item', '1 到 100 求和');
await sleep(400);
const t2 = JSON.parse(await js('JSON.stringify({ title: (document.querySelector(".think-problem-head h2")||{}).textContent || "", nodes: CC.ThinkView.nodes.length, edges: CC.ThinkView.edges.length })'));
check('切换题目后是一张新的空白图', t2.title === '1 到 100 求和' && t2.nodes === 1 && t2.edges === 0, t2.title);

// T2 的参考流程图（带循环）也能通过检查
await js('(function(){ var p = CC.ThinkView.problemById("T2"); var ref = CC.ThinkView.referenceOf(p); CC.ThinkView.nodes = JSON.parse(JSON.stringify(ref.nodes)); CC.ThinkView.edges = JSON.parse(JSON.stringify(ref.edges)); CC.ThinkView.render(); })()');
await clickText('.think-side .btn', '检查我的思路');
await sleep(500);
check('带循环的题也能通过思路检查', await js('!!document.querySelector(".think-check.ok")'));

console.log('\n' + (results.every(r => r) ? '✅ 函数手册 + 思维训练自检全部通过' : '❌ 有 ' + results.filter(r => !r).length + ' 项失败'));
ws.close(); proc.kill();
process.exit(results.every(r => r) ? 0 : 1);