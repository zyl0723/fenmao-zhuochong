// 开发用截图工具：用 DevTools 协议抓整页截图（不参与网站运行）
// 用法：node tools/shot.mjs <url> <输出png> [宽] [高] [等待毫秒]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const url = process.argv[2];
const out = process.argv[3];
const width = Number(process.argv[4] || 1440);
const height = Number(process.argv[5] || 1200);
const waitMs = Number(process.argv[6] || 2500);
const port = 9300 + Math.floor(Math.random() * 400);

const udd = path.join(process.env.TEMP || process.env.TMP || '.', 'edge-shot-' + Date.now());
const proc = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  '--user-data-dir=' + udd, '--remote-debugging-port=' + port, 'about:blank'
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));

let list = null;
for (let i = 0; i < 80; i++) {
  try {
    const res = await fetch('http://127.0.0.1:' + port + '/json/list');
    list = await res.json();
    if (list && list.length) break;
  } catch (e) { }
  await sleep(250);
}
if (!list) { console.error('devtools not reachable'); proc.kill(); process.exit(1); }
const page = list.find(t => t.type === 'page') || list[0];

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.addEventListener('message', ev => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
    else p.resolve(msg.result);
  }
});
function send(method, params) {
  return new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params: params || {} }));
  });
}
await new Promise(r => ws.addEventListener('open', r));
const dsf = Number(process.argv[9] || 1);
await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dsf, mobile: false });
await send('Page.enable');
await send('Page.navigate', { url });
await sleep(waitMs);
const scrollY = Number(process.argv[7] || 0);
const viewportOnly = process.argv[8] === 'viewport';
if (scrollY) {
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, ' + scrollY + ')' });
  await sleep(400);
}
const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !viewportOnly });
fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
ws.close();
proc.kill();
console.log('ok ' + out);
