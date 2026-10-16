// 本地预览用的极简静态服务器：node tools/dev-server.mjs [端口]
// 只在开发时使用，网站本身是纯静态的，不需要它也能跑。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');
const PORT = Number(process.argv[2] || 5173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(String(req.url || '/').split('?')[0].split('#')[0]);
  let target = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
  if (!path.resolve(target).startsWith(ROOT)) {
    res.writeHead(403); res.end('403'); return;
  }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  if (!fs.existsSync(target)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found: ' + urlPath);
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(target).pipe(res);
});

server.listen(PORT, () => {
  console.log('粉猫捉虫 · 本地预览： http://localhost:' + PORT + '/');
  console.log('按 Ctrl + C 结束。');
});