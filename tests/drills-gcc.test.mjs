// 用真实 gcc 编译运行每道「输出题」，核对选项里的答案。
// 找不到 gcc 时会跳过并提示（但本机已配置 gcc，CI/本地都建议安装）。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ROOT, describe, test, ok, eq, summary } from './harness.mjs';

const GCC_CANDIDATES = [
  process.env.GCC_PATH,
  'gcc',
  'C:/msys64/ucrt64/bin/gcc.exe',
  'C:/MinGW/bin/gcc.exe',
  'E:/DevTools/MinGW/bin/gcc.exe'
].filter(Boolean);

function findGcc() {
  for (const c of GCC_CANDIDATES) {
    const r = spawnSync(c, ['--version'], { encoding: 'utf8' });
    if (!r.error && r.status === 0) return c;
  }
  return null;
}

const sandbox = { console };
vm.createContext(sandbox);
for (const f of ['assets/js/content-drills-1.js', 'assets/js/content-drills-2.js', 'assets/js/content-drills-3.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
}
const DRILLS = sandbox.CC.DRILLS || [];
const HEADERS = ['stdio.h', 'string.h', 'stdlib.h', 'ctype.h', 'math.h', '综合'];
const gcc = findGcc();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fenmao-drills-'));

function runWithGcc(item) {
  const base = path.join(tmp, item.id);
  fs.writeFileSync(base + '.c', item.code, 'utf8');
  const comp = spawnSync(gcc, ['-std=c11', '-O0', '-w', base + '.c', '-o', base + '.exe', '-lm'], { encoding: 'utf8' });
  if (comp.status !== 0) throw new Error('gcc 编译失败：' + (comp.stderr || comp.error));
  const run = spawnSync(base + '.exe', [], { encoding: 'utf8', timeout: 5000 });
  if (run.error) throw new Error('运行失败：' + run.error.message);
  return String(run.stdout || '').replace(/\r\n/g, '\n');
}

describe('函数题海：题库结构', () => {
  test('题目总数 >= 80', () => ok(DRILLS.length >= 80, '只有 ' + DRILLS.length + ' 题'));
  test('题目 id 唯一', () => {
    const seen = new Set();
    DRILLS.forEach(d => { ok(!seen.has(d.id), '重复 id：' + d.id); seen.add(d.id); });
  });
  test('每道题都有 4 个选项、合法答案、解析', () => {
    DRILLS.forEach(d => {
      ok(HEADERS.indexOf(d.header) >= 0, d.id + ' 头文件不合法：' + d.header);
      ok([1, 2, 3].indexOf(d.level) >= 0, d.id + ' 难度不合法');
      ok(d.kind === 'concept' || d.kind === 'output', d.id + ' 类型不合法');
      ok(d.q && d.q.length >= 5, d.id + ' 缺少题干');
      ok(Array.isArray(d.options) && d.options.length === 4, d.id + ' 选项不是 4 个');
      ok(Number.isInteger(d.answer) && d.answer >= 0 && d.answer < 4, d.id + ' 答案下标不合法');
      ok(d.explain && d.explain.length >= 15, d.id + ' 解析太短');
      if (d.kind === 'output') ok(d.code && d.code.indexOf('int main') >= 0, d.id + ' 输出题缺少完整代码');
    });
  });
  test('每个分类都有题，且难度分布合理', () => {
    HEADERS.forEach(h => {
      const n = DRILLS.filter(d => d.header === h).length;
      ok(n >= 8, h + ' 只有 ' + n + ' 题');
    });
    [1, 2, 3].forEach(lv => ok(DRILLS.filter(d => d.level === lv).length >= 10, '难度 ' + lv + ' 题目太少'));
  });
});

if (!gcc) {
  describe('函数题海：gcc 复核', () => {
    test('跳过（没有找到 gcc）', () => { console.log('    未找到 gcc，跳过编译复核'); });
  });
} else {
  describe('函数题海：用真实 gcc 复核每道输出题', () => {
    DRILLS.filter(d => d.kind === 'output').forEach(d => {
      test(d.id + ' ' + d.header, () => {
        const actual = runWithGcc(d);
        const expected = d.options[d.answer];
        if (actual !== expected) {
          throw new Error('gcc 输出与答案不一致\n期望：' + JSON.stringify(expected) + '\n实际：' + JSON.stringify(actual) + '\n代码：\n' + d.code);
        }
      });
    });
  });
}

fs.rmSync(tmp, { recursive: true, force: true });
summary();