// 开发用端到端自检：用 DevTools 协议模拟「学生做题」（不参与网站运行）
// 用法：node tools/e2e-check.mjs [http://localhost:5173]
import { spawn } from 'node:child_process';
import path from 'node:path';

const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.argv[2] || 'http://localhost:5173';
const port = 9800 + Math.floor(Math.random() * 200);
const udd = path.join(process.env.TEMP || '.', 'edge-e2e-' + Date.now());
const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  '--user-data-dir=' + udd, '--remote-debugging-port=' + port, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

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
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); if (m.error) p.reject(new Error(JSON.stringify(m.error))); else p.resolve(m.result); }
});
const send = (method, params) => new Promise((resolve, reject) => { const msgId = ++id; pending.set(msgId, { resolve, reject }); ws.send(JSON.stringify({ id: msgId, method, params: params || {} })); });
await new Promise(r => ws.addEventListener('open', r));
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.enable');
await send('Page.navigate', { url: BASE + '/index.html' });
await sleep(2500);

async function evalJs(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('页面里抛错：' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description));
  return r.result.value;
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok: !!ok, detail: detail === undefined ? '' : detail });
  console.log((ok ? '  \u2713 ' : '  \u2717 ') + name + (detail ? '  (' + detail + ')' : ''));
}

// 1. 页面基本状态
const boot = await evalJs('JSON.stringify({ lessons: (CC.LESSONS||[]).length, bugs: (CC.BUGS||[]).length, fish: CC.App.state.fish, errors: (window.__bootErrors||[]).length })');
const b = JSON.parse(boot);
check('页面启动无脚本错误', b.errors === 0, 'errors=' + b.errors);
check('课程与关卡已加载', b.lessons === 16 && b.bugs === 12, 'lessons=' + b.lessons + ' bugs=' + b.bugs);

// 2. 打开第一课，提交正确答案
await evalJs('CC.UI.openLesson("L1")');
await sleep(300);
const solution = '#include <stdio.h>\n\nint main() {\n    printf("你好，我是小明！\\n");\n    return 0;\n}\n';
await evalJs('CC.UI.editors["L1-T1"].setValue(' + JSON.stringify(solution) + ')');
await evalJs('[...document.querySelectorAll("#task-L1-T1 button")].find(b => b.textContent.includes("交给捉虫看看")).click()');
await sleep(1200);
const afterPass = JSON.parse(await evalJs('JSON.stringify({ fb: [...document.querySelectorAll("#task-L1-T1 .feedback")].filter(function(e){return !e.classList.contains("hidden");}).map(function(e){return e.textContent;}).join(" "), fish: CC.App.state.fish, done: !!CC.App.state.completedTasks["L1-T1"], xp: CC.App.state.xp })'));
check('正确答案能通过判题', afterPass.fb.includes('过啦'), afterPass.fb.slice(0, 60).replace(/\n/g, ' '));
check('通过后记录了完成状态', afterPass.done === true);
check('通过后拿到了小鱼干和经验', afterPass.fish > b.fish && afterPass.xp > 0, 'fish=' + afterPass.fish + ' xp=' + afterPass.xp);

// 2.5 通关应该撒花 + 一堆夸夸弹窗，还能一键收起
await sleep(600);
const fx = JSON.parse(await evalJs('JSON.stringify({ bubbles: document.querySelectorAll(".fx-bubble").length, confetti: document.querySelectorAll(".fx-confetti").length, exit: !!document.querySelector(".fx-exit"), banner: (document.querySelector(".fx-banner")||{}).textContent || "" })'));
check('通关后出现夸夸弹窗雨', fx.bubbles >= 8, fx.bubbles + ' 个夸夸弹窗');
check('通关后有撒花特效', fx.confetti > 10, fx.confetti + ' 片花瓣');
check('夸夸屏幕上有退出按钮', fx.exit === true, fx.banner.slice(0, 20));
await evalJs('document.querySelector(".fx-exit").click()');
await sleep(900);
const fxAfter = JSON.parse(await evalJs('JSON.stringify({ bubbles: document.querySelectorAll(".fx-bubble").length, layer: !!document.getElementById("fx-layer") })'));
check('点退出按钮后夸夸弹窗收起来了', fxAfter.bubbles === 0 && fxAfter.layer === false);

// 3. 错误答案会被指出问题
await evalJs('CC.UI.editors["L1-T2"].setValue("#include <stdio.h>\\n\\nint main() {\\n    printf(\\"错的答案\\n\\");\\n    return 0;\\n}\\n")');
await evalJs('[...document.querySelectorAll("#task-L1-T2 button")].find(b => b.textContent.includes("交给捉虫看看")).click()');
await sleep(900);
const afterFail = JSON.parse(await evalJs('JSON.stringify({ fb: [...document.querySelectorAll("#task-L1-T2 .feedback")].filter(function(e){return !e.classList.contains("hidden");}).map(function(e){return e.textContent;}).join(" "), done: !!CC.App.state.completedTasks["L1-T2"] })'));
check('错误答案不会通过', afterFail.fb.includes('歪着头') && afterFail.done === false);

// 3.5 连错 5 次，小猫应该来安慰（而且每次 5 句都不重复）
await evalJs('CC.UI.editors["L1-T2"].setValue("#include <stdio.h>\\n\\nint main() {\\n    printf(\\"还是错的\\n\\");\\n    return 0;\\n}\\n")');
for (let i = 0; i < 5; i++) {
  await evalJs('[...document.querySelectorAll("#task-L1-T2 button")].find(b => b.textContent.includes("交给捉虫看看")).click()');
  await sleep(500);
}
await sleep(2200);
const comfort = JSON.parse(await evalJs('JSON.stringify({ open: !!document.querySelector(".fx-comfort-card"), lines: [...document.querySelectorAll(".fx-comfort-line")].map(e => e.textContent), unique: new Set([...document.querySelectorAll(".fx-comfort-line")].map(e => e.textContent)).size, face: !!document.querySelector(".fx-comfort-face") })'));
check('连错 5 次后弹出小猫安慰', comfort.open === true, comfort.lines.length + ' 句安慰');
check('安慰至少 5 句且互不重复', comfort.lines.length >= 5 && comfort.unique === comfort.lines.length, JSON.stringify(comfort.lines.slice(0, 1)));
check('安慰弹窗里有小猫的脸', comfort.face === true);
await evalJs('[...document.querySelectorAll(".fx-comfort-actions button")].find(b => b.textContent.includes("我再试一次")).click()');
await sleep(400);
check('安慰弹窗可以关掉继续做题', await evalJs('!document.querySelector(".fx-comfort-card")'));

// 4. 捉虫关卡：修好 B1
await evalJs('CC.UI.showView("bugs"); CC.UI.openBug("B1")');
await sleep(400);
const fixed = '#include <stdio.h>\n\nint main() {\n    printf("第一行\\n");\n    printf("第二行\\n");\n    printf("第三行\\n");\n    return 0;\n}\n';
await evalJs('CC.UI.editors["B1"].setValue(' + JSON.stringify(fixed) + ')');
await evalJs('[...document.querySelectorAll("#task-B1 button")].find(b => b.textContent.includes("交给捉虫看看")).click()');
await sleep(1000);
const bug = JSON.parse(await evalJs('JSON.stringify({ fb: [...document.querySelectorAll("#task-B1 .feedback")].filter(function(e){return !e.classList.contains("hidden");}).map(function(e){return e.textContent;}).join(" "), fixed: !!CC.App.state.bugsFixed["B1"], fish: CC.App.state.fish })'));
check('捉虫关卡修好后通过', bug.fb.includes('修好啦') && bug.fixed === true, 'fish=' + bug.fish);

// 5. 喂猫 & 存档
const beforeFeed = JSON.parse(await evalJs('JSON.stringify({ fish: CC.App.state.fish, hunger: CC.App.state.hunger })'));
const feedRes = JSON.parse(await evalJs('JSON.stringify(CC.App.feed("dryfish"))'));
const afterFeed = JSON.parse(await evalJs('JSON.stringify({ fish: CC.App.state.fish, hunger: CC.App.state.hunger })'));
check('喂猫会消耗小鱼干并回复饱食度', feedRes.ok && afterFeed.fish < beforeFeed.fish && afterFeed.hunger > beforeFeed.hunger, 'hunger ' + Math.round(beforeFeed.hunger) + ' -> ' + Math.round(afterFeed.hunger));

const saved = await evalJs('localStorage.getItem("fenmao-zhuochong-save-v1") ? "yes" : "no"');
check('进度写进了 localStorage', saved === 'yes');

// 6. 自由练习场运行代码
await evalJs('CC.UI.showView("playground")');
await sleep(400);
const pgCode = '#include <stdio.h>\nint main() { printf("自由练习\\n"); return 0; }\n';
await evalJs('CC.UI.pgEditor.setValue(' + JSON.stringify(pgCode) + ')');
await evalJs('CC.UI.runPlayground()');
await sleep(600);
const pg = await evalJs('document.getElementById("pg-output").textContent');
check('自由练习场能运行并显示输出', pg.includes('自由练习'), pg.replace(/\n/g, ' '));

// 7. 视图切换 + 猫窝渲染
const views = await evalJs('(function(){ var out = {}; ["map","lesson","bugs","playground","room","about"].forEach(function(v){ CC.UI.showView(v); out[v] = document.querySelector("#view-" + v).classList.contains("on"); }); return JSON.stringify(out); })()');
const vv = JSON.parse(views);
check('六个视图都能切换', Object.keys(vv).every(k => vv[k]), JSON.stringify(vv));

const roomCards = await evalJs('document.querySelectorAll("#room-body .card").length');
check('猫窝渲染出卡片', roomCards >= 4, 'cards=' + roomCards);

console.log('\n' + (results.every(r => r.ok) ? '✅ 端到端自检全部通过' : '❌ 有 ' + results.filter(r => !r.ok).length + ' 项失败'));
ws.close();
proc.kill();
process.exit(results.every(r => r.ok) ? 0 : 1);
