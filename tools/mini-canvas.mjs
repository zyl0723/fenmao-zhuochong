// 开发用：极简 canvas + PNG 编码器（不参与网站运行）
import fs from 'node:fs';
import zlib from 'node:zlib';

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

export function writePNG(file, w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]));
}

export function makeCanvas(w, h, bg) {
  const buf = Buffer.alloc(w * h * 4, 0);
  function parse(c) {
    if (typeof c !== 'string') return [0, 0, 0, 255];
    if (c[0] === '#') {
      const v = c.slice(1);
      if (v.length === 3) return [parseInt(v[0] + v[0], 16), parseInt(v[1] + v[1], 16), parseInt(v[2] + v[2], 16), 255];
      return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16), 255];
    }
    const m = /rgba?\(([^)]+)\)/.exec(c);
    if (m) {
      const p = m[1].split(',').map(s => parseFloat(s.trim()));
      return [p[0] | 0, p[1] | 0, p[2] | 0, p.length > 3 ? Math.round(p[3] * 255) : 255];
    }
    return [0, 0, 0, 255];
  }
  function blend(i, r, g, b, a) {
    if (a >= 255) { buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255; return; }
    const aa = a / 255;
    buf[i] = Math.round(buf[i] * (1 - aa) + r * aa);
    buf[i + 1] = Math.round(buf[i + 1] * (1 - aa) + g * aa);
    buf[i + 2] = Math.round(buf[i + 2] * (1 - aa) + b * aa);
    buf[i + 3] = Math.max(buf[i + 3], a);
  }
  const canvas = {
    buf, width: w, height: h, fillStyle: '#000000',
    globalAlpha: 1,
    fillRect(x, y, ww, hh) {
      const [r, g, b, a0] = parse(canvas.fillStyle);
      const a = Math.round(a0 * canvas.globalAlpha);
      x = Math.round(x); y = Math.round(y); ww = Math.round(ww); hh = Math.round(hh);
      for (let yy = y; yy < y + hh; yy++) {
        if (yy < 0 || yy >= h) continue;
        for (let xx = x; xx < x + ww; xx++) {
          if (xx < 0 || xx >= w) continue;
          blend((yy * w + xx) * 4, r, g, b, a);
        }
      }
    },
    clearRect(x, y, ww, hh) {
      for (let yy = y; yy < y + hh; yy++) {
        if (yy < 0 || yy >= h) continue;
        for (let xx = x; xx < x + ww; xx++) {
          if (xx < 0 || xx >= w) continue;
          const i = (yy * w + xx) * 4;
          buf[i] = 0; buf[i + 1] = 0; buf[i + 2] = 0; buf[i + 3] = 0;
        }
      }
    }
  };
  if (bg) { canvas.fillStyle = bg; canvas.fillRect(0, 0, w, h); }
  return canvas;
}

export function loadScripts(files) {
  return files;
}

// 最近邻放大（预览用，保证像素不糊）
export function upscale(canvas, factor) {
  const out = makeCanvas(canvas.width * factor, canvas.height * factor);
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const a = canvas.buf[i + 3];
      if (!a) continue;
      for (let dy = 0; dy < factor; dy++) {
        for (let dx = 0; dx < factor; dx++) {
          const j = ((y * factor + dy) * out.width + (x * factor + dx)) * 4;
          out.buf[j] = canvas.buf[i];
          out.buf[j + 1] = canvas.buf[i + 1];
          out.buf[j + 2] = canvas.buf[i + 2];
          out.buf[j + 3] = a;
        }
      }
    }
  }
  return out;
}
