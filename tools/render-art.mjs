// 开发用：把像素猫画稿渲染成 PNG，方便肉眼检查（不参与网站运行）
import fs from 'node:fs';
import zlib from 'node:zlib';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');

const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/pet-art.js'), 'utf8'), sandbox, { filename: 'pet-art.js' });
const A = sandbox.CC.PetArt;

// ---- 极简 PNG 编码 ----
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function writePNG(file, w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const out = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
  fs.writeFileSync(file, out);
}

function makeCanvas(w, h, bg) {
  const buf = Buffer.alloc(w * h * 4, 0);
  if (bg) fill(0, 0, w, h, bg);
  function parse(c) {
    if (c[0] === '#') {
      const v = c.slice(1);
      return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16), 255];
    }
    return [0, 0, 0, 255];
  }
  function fill(x, y, ww, hh, c) {
    const [r, g, b, a] = parse(c);
    for (let yy = y; yy < y + hh; yy++) {
      if (yy < 0 || yy >= h) continue;
      for (let xx = x; xx < x + ww; xx++) {
        if (xx < 0 || xx >= w) continue;
        const i = (yy * w + xx) * 4;
        buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
      }
    }
  }
  return {
    buf, fillStyle: '#000000',
    fillRect(x, y, ww, hh) { fill(Math.round(x), Math.round(y), Math.round(ww), Math.round(hh), this.fillStyle); }
  };
}

const names = Object.keys(A.FRAMES);
const scale = 8;
const cell = A.WIDTH * scale;
const pad = 12;
const cols = 4;
const rows = Math.ceil(names.length / cols);
const w = cols * (cell + pad) + pad;
const h = rows * (cell + pad) + pad;
const canvas = makeCanvas(w, h, '#efe0e6');
names.forEach((n, i) => {
  const cx = pad + (i % cols) * (cell + pad);
  const cy = pad + Math.floor(i / cols) * (cell + pad);
  A.drawFrame(canvas, n, scale, cx, cy);
});
writePNG(path.join(ROOT, 'tools/preview-cat-frames.png'), w, h, canvas.buf);

// 小图标一起看
const spriteNames = Object.keys(A.SPRITES);
let sw = 0, sh = 0;
for (const s of spriteNames) { sh += A.SPRITES[s].length * 4 + 6; }
const sheet2 = makeCanvas(220, Math.max(120, sh), '#efe0e6');
let y = 4;
for (const s of spriteNames) {
  A.drawSprite(sheet2, s, 4, 6, y);
  y += A.SPRITES[s].length * 4 + 6;
}
writePNG(path.join(ROOT, 'tools/preview-cat-sprites.png'), 220, Math.max(120, sh), sheet2.buf);

console.log('frames ->', names.join(', '));
console.log('wrote tools/preview-cat-frames.png and tools/preview-cat-sprites.png');