// 一次跑完所有自检：解释器单元测试 + 课程内容校验
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const files = ['interpreter.test.mjs', 'content.test.mjs', 'drills-gcc.test.mjs'];
let failed = 0;

for (const f of files) {
  console.log('\n===== ' + f + ' =====');
  const r = spawnSync(process.execPath, [path.join(here, f)], { stdio: 'inherit' });
  if (r.status !== 0) failed++;
}

console.log('\n' + (failed === 0 ? '全部自检通过 ✅' : '有 ' + failed + ' 个测试文件失败 ❌'));
process.exit(failed === 0 ? 0 : 1);
