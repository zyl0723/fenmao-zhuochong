// 开发用：API 模块 + 函数闯关的浏览器自检
// 用法：node tools/e2e-api-drills.mjs [http://localhost:5173]
import { spawn } from 'node:child_process';
import path from 'node:path';

const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.argv[2] || 'http://localhost:5173';
const port = 9200 + Math.floor(Math.random() * 300);
const udd = path.join(process.env.TEMP || '.', 'edge-ad-' + Date.now());
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

console.log('\n▸ API 设置模块');
await js('CC.UI.showView("api")');
await sleep(500);
const api0 = JSON.parse(await js('JSON.stringify({ errors: window.__bootErrors||[], presets: document.querySelectorAll(".api-preset").length, inputs: document.querySelectorAll(".api-input").length, view: CC.UI.currentView })'));
check('API 页面加载无错误', api0.errors.length === 0, JSON.stringify(api0.errors));
check('内置了 7 个服务商预设', api0.presets === 7);
check('有接口地址 / Key / 模型三个输入框', api0.inputs === 3);
await js('(function(){ var i=document.querySelectorAll(".api-input"); i[0].value="https://example.com/v1"; i[1].value="sk-test-123"; i[2].value="test-model"; })()');
await js('(function(){ var b=[].slice.call(document.querySelectorAll(".api-actions .btn")); b.filter(function(x){return x.textContent.indexOf("保存")>=0;})[0].click(); })()');
await sleep(400);
const api1 = JSON.parse(await js('JSON.stringify({ cfg: CC.AI.load(), configured: CC.AI.configured(), status: document.querySelector(".api-status").textContent })'));
check('保存后配置生效', api1.cfg.baseUrl === 'https://example.com/v1' && api1.cfg.apiKey === 'sk-test-123' && api1.configured === true);
check('页面给出保存反馈', api1.status.indexOf('已保存') >= 0);
await js('CC.AI.chat = function(){ return Promise.resolve("这是一段测试回答。"); };');
await js('CC.ApiView.ask({ title: "测试", prompt: "hi" })');
await sleep(500);
check('AI 弹窗能显示回答', (await js('document.querySelector(".api-answer").textContent')) === '这是一段测试回答。');
await js('(function(){ var b=[].slice.call(document.querySelectorAll(".api-ask-card .btn")); b.filter(function(x){return x.textContent.indexOf("关闭")>=0;})[0].click(); })()');
await sleep(200);
await js('CC.AI.clear();');
await js('CC.ApiView.enter();');
await sleep(300);
check('清除 Key 后恢复未配置状态', (await js('CC.AI.configured()')) === false);
await js('(function(){ CC.ApiView.ensure(); })()');
await sleep(300);
check('未配置时点 AI 会跳到 API 页', (await js('CC.UI.currentView')) === 'api');
const aiWired = JSON.parse(await js('JSON.stringify({ think: typeof CC.ThinkView.askAIOutline === "function", tasks: typeof CC.UI.taskRunner === "function" })'));
check('三处 AI 入口已接好', aiWired.think === true && aiWired.tasks === true);

console.log('\n▸ 函数闯关（题海）');
await js('CC.UI.showView("drills")');
await sleep(600);
const d0 = JSON.parse(await js('JSON.stringify({ errors: window.__bootErrors||[], total: (CC.DRILLS||[]).length, outputs: (CC.DRILLS||[]).filter(function(d){return d.kind==="output";}).length, options: document.querySelectorAll(".drills-option").length, q: (document.querySelector(".drills-q")||{}).textContent })'));
check('题目库有 89 道题', d0.total === 89, d0.total + ' 题');
check('其中 41 道是 gcc 复核过的输出题', d0.outputs === 41, d0.outputs + ' 题');
check('题目卡片正常渲染（4 个选项）', d0.options === 4, d0.q.slice(0, 24));
const firstAnswer = await js('(function(){ var d = CC.DrillsView.current(); return d.answer; })()');
await js('(function(){ var i=' + firstAnswer + '; document.querySelectorAll(".drills-option")[i].click(); })()');
await sleep(400);
const d1 = JSON.parse(await js('JSON.stringify({ ok: !!document.querySelector(".drills-feedback.ok"), streak: CC.App.state.drills.streak, answered: CC.App.state.drills.answered[CC.DrillsView.current().id] })'));
check('答对会显示正确反馈', d1.ok === true);
check('答对会计入连对', d1.streak === 1 && d1.answered && d1.answered.ok === true);
await js('(function(){ var b=[].slice.call(document.querySelectorAll(".drills-question .btn")); b.filter(function(x){return x.textContent.indexOf("下一题")>=0;})[0].click(); })()');
await sleep(300);
const wrongIdx = await js('(function(){ var d = CC.DrillsView.current(); return (d.answer + 1) % 4; })()');
await js('(function(){ document.querySelectorAll(".drills-option")[' + wrongIdx + '].click(); })()');
await sleep(400);
const d2 = JSON.parse(await js('JSON.stringify({ bad: !!document.querySelector(".drills-feedback.bad"), streak: CC.App.state.drills.streak, wrong: Object.keys(CC.App.state.drills.wrong).length, wrongItems: document.querySelectorAll(".drills-wrong-item").length })'));
check('答错会显示解析和正确答案', d2.bad === true);
check('答错后连对清零并进入错题本', d2.streak === 0 && d2.wrong >= 1 && d2.wrongItems >= 1, d2.wrong + ' 道错题');
await js('(function(){ var b=[].slice.call(document.querySelectorAll(".drills-mode .btn")); b.filter(function(x){return x.textContent.indexOf("随机 10 题")>=0;})[0].click(); })()');
await sleep(300);
check('随机 10 题模式有效', (await js('CC.DrillsView.queue.length')) === 10);
await js('(function(){ var b=[].slice.call(document.querySelectorAll(".drills-chip")); b.filter(function(x){return x.getAttribute("data-header")==="math.h";})[0].click(); })()');
await sleep(300);
check('按 math.h 筛选有效', await js('CC.DrillsView.queue.every(function(d){return d.header==="math.h";})'));
await js('CC.App.state.drills = { answered: {}, wrong: {}, streak: 0, best: 0, total: 0 }; CC.App.save(); CC.DrillsView.header = "all"; CC.DrillsView.startQueue(false); CC.DrillsView.renderStats();');
await sleep(300);
const d3 = JSON.parse(await js('JSON.stringify({ total: CC.App.state.drills.total, wrong: Object.keys(CC.App.state.drills.wrong).length })'));
check('重置答题记录有效', d3.total === 0 && d3.wrong === 0);

console.log('\n' + (results.every(r => r) ? '✅ API 模块 + 函数闯关自检全部通过' : '❌ 有 ' + results.filter(r => !r).length + ' 项失败'));
ws.close(); proc.kill();
process.exit(results.every(r => r) ? 0 : 1);