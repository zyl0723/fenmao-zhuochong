// 开发用：验证「多打空行」会被判错（复现用户报的那个 bug）
// 用法：node tools/e2e-strict.mjs [http://localhost:5173]
import { spawn } from 'node:child_process';
import path from 'node:path';

const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.argv[2] || 'http://localhost:5173';
const port = 9700 + Math.floor(Math.random() * 200);
const udd = path.join(process.env.TEMP || '.', 'edge-strict-' + Date.now());
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
let id = 0;
const pending = new Map();
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id); pending.delete(m.id);
    m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
  }
});
const send = (method, params) => new Promise((resolve, reject) => {
  const msgId = ++id; pending.set(msgId, { resolve, reject });
  ws.send(JSON.stringify({ id: msgId, method, params: params || {} }));
});
await new Promise(r => ws.addEventListener('open', r));
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.enable');
await send('Page.navigate', { url: BASE + '/index.html' });
await sleep(2600);
async function js(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (r.exceptionDetails) throw new Error('页面抛错：' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description).slice(0, 300));
  return r.result.value;
}
const results = [];
function check(name, ok, detail) {
  results.push(!!ok);
  console.log((ok ? '  ✓ ' : '  ✗ ') + name + (detail ? '  (' + detail + ')' : ''));
}
async function submit(taskId) {
  await js('(function(){ var l=[].slice.call(document.querySelectorAll("#task-' + taskId + ' button")); var b=l.filter(function(x){return x.textContent.indexOf("交给捉虫看看")>=0;})[0]; if(!b) return "missing"; b.click(); return "ok"; })()');
  await sleep(900);
}
async function feedback(taskId) {
  return js('(function(){ var l=[].slice.call(document.querySelectorAll("#task-' + taskId + ' .feedback")); var b=l.filter(function(x){return !x.classList.contains("hidden");})[0]; return b ? b.textContent : ""; })()');
}

console.log('\n▸ 第一课任务 2：打印三行诗（用户报的那个场景）');
await js('CC.UI.openLesson("L1")');
await sleep(400);
const wrong = '#include <stdio.h>\n\nint main() {\n    printf("C 语言，很酷\\n\\n");\n    printf("我要学会它\\n\\n");\n    printf("从今天开始\\n\\n");\n    return 0;\n}\n';
await js('CC.UI.editors["L1-T2"].setValue(' + JSON.stringify(wrong) + ')');
await submit('L1-T2');
const fb1 = await feedback('L1-T2');
check('每行多打空行 → 判错', (await js('!CC.App.state.completedTasks["L1-T2"]')) === true, fb1.split('\n')[0]);
check('报错里明确指出「空行」', fb1.indexOf('空行') >= 0);
check('报错里给出了逐行对比', fb1.indexOf('题目要的输出（3 行）') >= 0 && fb1.indexOf('你的输出（6 行）') >= 0);
check('对比里把空行标出来了', fb1.indexOf('（空行）') >= 0);
check('没有误触发夸夸弹窗', (await js('document.querySelectorAll(".fx-bubble").length')) === 0);

const right = '#include <stdio.h>\n\nint main() {\n    printf("C 语言，很酷\\n");\n    printf("我要学会它\\n");\n    printf("从今天开始\\n");\n    return 0;\n}\n';
await js('CC.UI.editors["L1-T2"].setValue(' + JSON.stringify(right) + ')');
await submit('L1-T2');
const ok1 = await js('!!CC.App.state.completedTasks["L1-T2"]');
check('改成正确的三行 → 通过', ok1 === true);
check('通过后照常撒花 + 夸夸', (await js('document.querySelectorAll(".fx-bubble").length')) >= 5);

console.log('\n▸ 第二课任务 3：学生证（4 行）');
await js('CC.FX.celebrating && document.querySelector(".fx-exit") && document.querySelector(".fx-exit").click()');
await sleep(500);
await js('CC.UI.openLesson("L2")');
await sleep(400);
const wrong2 = '#include <stdio.h>\n\nint main() {\n    printf("===== 学生证 =====\\n\\n");\n    printf("姓名：小粉猫\\n\\n");\n    printf("等级：Lv.1\\n\\n");\n    printf("=================\\n\\n");\n    return 0;\n}\n';
await js('CC.UI.editors["L2-T3"].setValue(' + JSON.stringify(wrong2) + ')');
await submit('L2-T3');
const fb2 = await feedback('L2-T3');
check('4 行的任务多空行 → 判错', (await js('!CC.App.state.completedTasks["L2-T3"]')) === true, fb2.split('\n')[0]);
check('提示了正确写法示例', fb2.indexOf('\\n') >= 0 && fb2.indexOf('空行') >= 0);

console.log('\n' + (results.every(r => r) ? '✅ 空行判题修复验证通过' : '❌ 有 ' + results.filter(r => !r).length + ' 项失败'));
ws.close(); proc.kill();
process.exit(results.every(r => r) ? 0 : 1);
