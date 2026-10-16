// 开发用：把大世界的像素素材渲染成 PNG 检查（不参与网站运行）
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeCanvas, writePNG, upscale } from './mini-canvas.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');

const sandbox = { console };
vm.createContext(sandbox);
for (const f of ['assets/js/world-art.js', 'assets/js/pet-art.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
}
const A = sandbox.CC.WorldArt;
const T = A.TILE;
const F = 4; // 放大倍数，只是为了肉眼看清

// ---- 1. 地形 ----
const terrain = A.terrainNames();
let c1 = makeCanvas(terrain.length * (T + 4) + 4, T + 8, '#2b2228');
terrain.forEach((name, i) => A.drawTerrain(c1, name, 4 + i * (T + 4), 4, 700, i, i));
c1 = upscale(c1, F);
writePNG(path.join(ROOT, 'tools/preview-tiles.png'), c1.width, c1.height, c1.buf);
console.log('地形：' + terrain.join(', '));

// ---- 2. 物体 ----
const objs = A.objectNames();
const perRow = 6;
const cell = T * 3;
let c2 = makeCanvas(perRow * cell + 8, Math.ceil(objs.length / perRow) * cell + 8, '#cfe6bd');
objs.forEach((name, i) => {
  const ox = 4 + (i % perRow) * cell;
  const oy = 4 + Math.floor(i / perRow) * cell;
  for (let gy = 0; gy < 3; gy++) {
    for (let gx = 0; gx < 3; gx++) A.drawTerrain(c2, 'grass', ox + gx * T, oy + gy * T, 0, gx, gy);
  }
  A.drawObject(c2, name, ox + 6, oy + 6, {});
});
c2 = upscale(c2, F);
writePNG(path.join(ROOT, 'tools/preview-objects.png'), c2.width, c2.height, c2.buf);
console.log('物体顺序（每行 ' + perRow + ' 个）：');
objs.forEach((o, i) => process.stdout.write((i + 1) + '.' + o + (((i + 1) % perRow === 0) ? ' | ' : ' ')));
console.log('');

// ---- 3. 猫在小路上的样子 + 各种表情 ----
const p = sandbox.CC.PetArt;
let c3 = makeCanvas(6 * 60 + 8, 5 * T + 8, '#cfe6bd');
for (let gy = 0; gy < 5; gy++) {
  for (let gx = 0; gx < 8; gx++) A.drawTerrain(c3, 'grass', 4 + gx * T, 4 + gy * T, 0, gx, gy);
}
['idle', 'walk', 'happy', 'back', 'eat', 'sleep'].forEach((f, i) => {
  if (!p.FRAMES[f]) return;
  p.drawFrame(c3, f, 1, 16 + i * 60, 40);
});
c3 = upscale(c3, F);
writePNG(path.join(ROOT, 'tools/preview-cat-world.png'), c3.width, c3.height, c3.buf);
console.log('写好了 preview-tiles.png / preview-objects.png / preview-cat-world.png');
