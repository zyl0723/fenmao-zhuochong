// 开发用：把「大世界」从头玩一遍的自检（不参与网站运行）
// 用法：node tools/e2e-world.mjs [http://localhost:5173]
import { spawn } from 'node:child_process';
import path from 'node:path';

const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.argv[2] || 'http://localhost:5173';
const port = 9500 + Math.floor(Math.random() * 300);
const udd = path.join(process.env.TEMP || '.', 'edge-world-' + Date.now());
const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  '--user-data-dir=' + udd, '--remote-debugging-port=' + port, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let list = null;
for (let i = 0; i < 80; i++) {
  try { const res = await fetch('http://127.0.0.1:' + port + '/json/list'); list = await res.json(); if (list && list.length) break; } catch (e) { }
  await sleep(250);
}
const page = list.find(t => t.type === 'page') || list[0];
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); } });
const send = (method, params) => new Promise((resolve, reject) => { const msgId = ++id; pending.set(msgId, { resolve, reject }); ws.send(JSON.stringify({ id: msgId, method, params: params || {} })); });
await new Promise(r => ws.addEventListener('open', r));
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.enable');
await send('Page.navigate', { url: BASE + '/index.html#world' });
await sleep(2600);

async function js(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('页面抛错：' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description).slice(0, 300));
  return r.result.value;
}
async function key(k, ms) {
  const codes = { ArrowDown: 40, ArrowUp: 38, ArrowLeft: 37, ArrowRight: 39, ' ': 32 };
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, windowsVirtualKeyCode: codes[k] || 0 });
  if (ms) await sleep(ms);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, windowsVirtualKeyCode: codes[k] || 0 });
}
const results = [];
function check(name, ok, detail) {
  results.push(!!ok);
  console.log((ok ? '  ✓ ' : '  ✗ ') + name + (detail ? '  (' + detail + ')' : ''));
}
async function clickAll(sel, index) {
  return js('(function(){ var n = document.querySelectorAll(' + JSON.stringify(sel) + '); if (!n[' + index + ']) return "missing"; n[' + index + '].click(); return "ok"; })()');
}
async function clickExact(sel, text) {
  return js('(function(){ var list = Array.prototype.slice.call(document.querySelectorAll(' + JSON.stringify(sel) + ')); var b = list.filter(function(x){ return x.textContent.trim() === ' + JSON.stringify(text) + '; })[0]; if (!b) return "missing"; b.click(); return "ok"; })()');
}
async function clickByText(sel, text) {
  return js('(function(){ var list = Array.prototype.slice.call(document.querySelectorAll(' + JSON.stringify(sel) + ')); var b = list.filter(function(x){ return x.textContent.indexOf(' + JSON.stringify(text) + ') >= 0; })[0]; if (!b) return "missing"; b.click(); return "ok"; })()');
}

console.log('\n▸ 大世界基本状态');
const boot = JSON.parse(await js('JSON.stringify({ errors: window.__bootErrors||[], area: CC.World.area.name, obj: CC.World.objects.length, view: CC.UI.currentView, running: CC.World.running })'));
check('页面没有脚本错误', boot.errors.length === 0, JSON.stringify(boot.errors));
check('默认落在大世界里', boot.view === 'world' && boot.area === '小猫的家', boot.area);
check('世界在跑（动画循环已启动）', boot.running === true);
check('房间里放着东西', boot.obj >= 6, boot.obj + ' 个物件');

console.log('\n▸ 走路（真的按方向键）');
const before = JSON.parse(await js('JSON.stringify({x: CC.World.player.x, y: CC.World.player.y})'));
await key('ArrowRight', 450);
const after = JSON.parse(await js('JSON.stringify({x: CC.World.player.x, y: CC.World.player.y, dir: CC.World.player.dir})'));
check('方向键能让小猫移动', Math.abs(after.x - before.x) > 10, 'x: ' + before.x.toFixed(0) + ' → ' + after.x.toFixed(0) + '，朝向 ' + after.dir);
await key('ArrowDown', 1000);
const after2 = JSON.parse(await js('JSON.stringify({y: CC.World.player.y})'));
check('向下走也能动', after2.y > after.y, 'y: ' + after.y.toFixed(0) + ' → ' + after2.y.toFixed(0));

console.log('\n▸ 走到门口，出门去大门口');
await js('CC.World.load("home", {x: 10.5, y: 10.6})');
await sleep(400);
await key(' ');
await sleep(700);
const outArea = await js('CC.World.area.name + "|" + CC.World.areaId');
check('按空格能从家里走到门外', outArea.indexOf('门口') >= 0, outArea);
const hasWorld = await js('JSON.stringify({garden: CC.World.objects.filter(function(o){return o.flower;}).length, robot: !!CC.World.objects.filter(function(o){return o.id==="robot";}).length, caveSign: !!CC.World.objects.filter(function(o){return o.id==="gate";}).length})');
const w = JSON.parse(hasWorld);
check('大门口有花园、机器人、森林大门', w.garden === 5 && w.robot && w.caveSign, JSON.stringify(w));

console.log('\n▸ 谜题 1：贴标签的罐子（变量）');
await js('CC.WorldView.openPanel("jars")');
await sleep(300);
check('罐子面板打开了', await js('!document.getElementById("world-panel").classList.contains("hidden") && CC.WorldView.panelOpen === "jars"'));
// 第一个罐子：苹果数 + 3 个苹果
await clickByText('.pz-item', '苹果数'); await clickAll('.pz-jar', 0);
await clickByText('.pz-item', '3 个苹果'); await clickAll('.pz-jar', 0);
await clickByText('.pz-item', '猫的名字'); await clickAll('.pz-jar', 1);
await clickByText('.pz-item', '捉虫'); await clickAll('.pz-jar', 1);
await clickByText('.pz-item', '身高'); await clickAll('.pz-jar', 2);
await clickByText('.pz-item', '30 厘米'); await clickAll('.pz-jar', 2);
await clickByText('.pz-btn', '让捉虫看看');
await sleep(500);
const jars = JSON.parse(await js('JSON.stringify({ done: !!CC.App.state.puzzlesDone.jars, gems: CC.App.state.gems, fish: CC.App.state.fish, code: !!document.querySelector(".pz-code") })'));
check('罐子配对成功', jars.done === true);
check('拿到宝石和小鱼干', jars.gems === 1 && jars.fish > 3, 'gem=' + jars.gems + ' fish=' + jars.fish);
check('通关后能看到对应的 C 代码', jars.code === true);

console.log('\n▸ 谜题 2：浇水机器人（循环）');
await js('CC.WorldView.openPanel("robot")');
await sleep(300);
await clickExact('.pz-round', '+'); await clickExact('.pz-round', '+');   // 重复 3 → 5
await clickByText('.pz-cmd', '往前走');
await clickByText('.pz-cmd', '浇水');
await clickByText('.pz-btn', '让机器人跑一遍');
await sleep(5000);
const robot = JSON.parse(await js('JSON.stringify({ done: !!CC.App.state.puzzlesDone.robot, flag: !!CC.App.state.worldFlags.robotDone })'));
check('机器人把 5 朵花都浇到了', robot.done === true, 'flag=' + robot.flag);
check('世界里的花园真的开花了（世界旗标）', robot.flag === true);

console.log('\n▸ 谜题 3：箱子、绳子和篮子（指针）');
await js('CC.WorldView.openPanel("rope")');
await sleep(250);
for (const label of ['绳子拴到 A', '篮子 ← 绳子', '绳子拴到 B', 'A ← 绳子', '绳子 ← 篮子']) await clickByText('.pz-action', label);
await clickByText('.pz-btn', '收工');
await sleep(400);
check('用绳子把两个箱子的东西换过来了', await js('!!CC.App.state.puzzlesDone.rope'));
check('操作过程变成了代码（代码日志）', await js('document.querySelector(".pz-codelog").textContent.indexOf("temp = *p") >= 0'));

console.log('\n▸ 谜题 4：断桥 + 宝石');
await js('CC.WorldView.openPanel("bridge")');
await sleep(200);
await clickByText('.pz-btn', '修好木桥');
await sleep(400);
check('宝石不够时修不了桥（需要 3 颗）', await js('!CC.App.state.worldFlags.bridgeFixed'));
await js('CC.App.addGem(2); CC.App.save();');   // 假装又找到两颗
await js('CC.WorldView.openPanel("bridge")');
await sleep(200);
await clickByText('.pz-btn', '修好木桥');
await sleep(400);
check('集齐 3 颗宝石后桥修好了', await js('!!CC.App.state.worldFlags.bridgeFixed'));

console.log('\n▸ 谜题 5：门卫猫（条件判断）');
await js('CC.WorldView.openPanel("gate")');
await sleep(250);
await clickByText('.pz-card', '苹果 > 3');
await clickExact('.pz-round', '+');
await clickExact('.pz-round', '+');
await clickByText('.pz-btn', '试一次');
await sleep(300);
await clickExact('.pz-round', '−');
await clickExact('.pz-round', '−');
await clickByText('.pz-btn', '试一次');
await sleep(400);
const gate = JSON.parse(await js('JSON.stringify({ done: !!CC.App.state.puzzlesDone.gate, open: !!CC.App.state.worldFlags.gateOpen })'));
check('挑对了条件卡（多于 3 个才开门）', gate.done === true);
check('森林大门在世界里打开了', gate.open === true);

console.log('\n▸ 谜题 6：珠子项链（字符串）');
await js('CC.WorldView.openPanel("beads")');
await sleep(250);
for (const c of ['粉珠', '蓝珠', '黄珠', '粉珠']) await clickByText('.pz-bead', c);
await clickByText('.pz-btn', '让机器读一读');
await sleep(400);
check('按顺序串好珠子并留出了 \\0 的位置', await js('!!CC.App.state.puzzlesDone.beads'));

console.log('\n▸ 谜题 7：蛋糕机（函数）');
await js('CC.WorldView.openPanel("machine")');
await sleep(250);
const orders = [['面粉', '鸡蛋'], ['牛奶', '茶包'], ['面包', '火腿']];
for (const pair of orders) {
  await clickByText('.pz-food', pair[0]);
  await clickByText('.pz-food', pair[1]);
  await clickByText('.pz-btn', '按下开关');
  await sleep(1300);
}
check('三个订单都做对了', await js('!!CC.App.state.puzzlesDone.machine'));

console.log('\n▸ 进度与成就');
const finalState = JSON.parse(await js('JSON.stringify({ puzzles: CC.Store.count(CC.App.state.puzzlesDone), fish: CC.App.state.fish, xp: CC.App.state.xp, ach: CC.Store.count(CC.App.state.achievements), gems: CC.App.state.gems })'));
check('解开了 7 个谜题', finalState.puzzles >= 7, JSON.stringify(finalState));
check('成就解锁了（会动脑的小猫 / 花开满园 / 修桥小能手…）', finalState.ach >= 3, finalState.ach + ' 个成就');
const panel = await js('JSON.stringify({ open: !document.getElementById("world-panel").classList.contains("hidden"), reward: (document.querySelector(".pz-reward")||{}).textContent || "" })');
const pv = JSON.parse(panel);
check('面板里显示了奖励，还能继续冒险', pv.open && pv.reward.length > 0);

console.log('\n' + (results.every(r => r) ? '✅ 大世界自检全部通过' : '❌ 有 ' + results.filter(r => !r).length + ' 项失败'));
ws.close(); proc.kill();
process.exit(results.every(r => r) ? 0 : 1);
