// 在线编程题：结构、内置解释器参考答案、真实 gcc 三重复核。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { ROOT, describe, test, ok, eq, summary } from './harness.mjs';

const GCC_CANDIDATES = [
  process.env.GCC_PATH, 'gcc', 'C:/msys64/ucrt64/bin/gcc.exe',
  'C:/MinGW/bin/gcc.exe', 'E:/DevTools/MinGW/bin/gcc.exe'
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
for (const f of ['assets/js/interpreter.js', 'assets/js/grader.js', 'assets/js/content-drills-code.js', 'assets/js/content-drills-ladder-1.js', 'assets/js/content-drills-ladder-2.js', 'assets/js/content-drills-ladder-3.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
}
const CC = sandbox.CC;
const PROBLEMS = CC.CODE_DRILLS || [];
const Grade = CC.Grade;
const HEADERS = ['stdio.h', 'string.h', 'stdlib.h', 'ctype.h', 'math.h', '综合'];
const SINGLE_FUNCTIONS = ['printf','scanf','sprintf','strlen','strcpy','strcat','strcmp','strchr','strstr','strncmp','strncpy','atoi','atof','abs','isalpha','isdigit','isspace','isupper','islower','toupper','tolower','sqrt','pow','fabs','floor','ceil','round','fmin','fmax','hypot'];
const gcc = findGcc();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fenmao-code-drills-'));

describe('在线编程题：题库结构', () => {
  test('训练路线数量正确', () => {
    ok(PROBLEMS.filter(p => p.stage === 'single').length >= 90, '单函数题不足');
    ok(PROBLEMS.filter(p => p.stage === 'bridge').length >= 12, '组合过渡题不足');
    ok(PROBLEMS.filter(p => p.stage === 'mixed').length >= 20, '综合题不足');
  });
  test('30 个函数每个都有至少 3 道独立专练', () => {
    SINGLE_FUNCTIONS.forEach(fn => {
      const list = PROBLEMS.filter(p => p.stage === 'single' && p.target === fn);
      ok(list.length >= 3, fn + ' 只有 ' + list.length + ' 道专练');
      list.forEach(p => ok(p.functions.length === 1 && p.functions[0] === fn, p.id + ' 必须只标记一个目标函数'));
    });
  });
  test('起始代码不预写 #include 或 main', () => {
    PROBLEMS.forEach(p => {
      ok(!p.starter.includes('#include'), p.id + ' 的起始代码泄露了 #include');
      ok(!/\bmain\s*\(/.test(p.starter), p.id + ' 的起始代码预写了 main');
      ok(p.starter.trim() === '', p.id + ' 应该是完全空白的起始代码');
    });
  });
  test('至少 120 道完整编程题', () => ok(PROBLEMS.length >= 120, '只有 ' + PROBLEMS.length + ' 道'));
  test('题目 id 唯一', () => {
    const seen = new Set();
    PROBLEMS.forEach(p => { ok(!seen.has(p.id), '重复 id：' + p.id); seen.add(p.id); });
  });
  test('每个分类都有编程题', () => {
    HEADERS.forEach(h => ok(PROBLEMS.some(p => p.header === h), h + ' 没有编程题'));
  });
  test('题面、格式、样例、测试点、提示、答案都完整', () => {
    PROBLEMS.forEach(p => {
      ok(p.kind === 'code', p.id + ' kind 必须是 code');
      ok(HEADERS.includes(p.header), p.id + ' header 不合法');
      ok([1, 2, 3].includes(p.level), p.id + ' level 不合法');
      ok(p.title && p.title.length >= 2, p.id + ' 缺少标题');
      ok(p.story && p.story.length >= 10, p.id + ' 缺少故事化题面');
      ok(p.goal && p.goal.length >= 5, p.id + ' 缺少目标');
      ok(p.inputFormat && p.outputFormat, p.id + ' 缺少输入/输出格式');
      ok(Array.isArray(p.functions) && p.functions.length >= 1, p.id + ' 缺少函数标签');
      ok(Array.isArray(p.examples) && p.examples.length >= 1, p.id + ' 缺少公开样例');
      ok(Array.isArray(p.tests) && p.tests.length >= 4, p.id + ' 测试点少于 4 个');
      ok(Array.isArray(p.hints) && p.hints.length >= 2, p.id + ' 提示少于 2 条');
      ok(typeof p.starter === 'string', p.id + ' 缺少起始代码字段');
      ok(typeof p.solution === 'string' && p.solution.includes('main'), p.id + ' 缺少参考答案');
      p.tests.forEach((t, i) => {
        ok(typeof t.stdin === 'string', p.id + ' 测试点 ' + i + ' 缺少 stdin');
        ok(typeof t.expect === 'string', p.id + ' 测试点 ' + i + ' 缺少期望输出');
      });
    });
  });
});

describe('在线编程题：内置解释器复核对答案', () => {
  PROBLEMS.forEach(p => {
    test(p.id + ' 参考答案通过全部测试点', () => {
      const r = Grade.gradeTask({ id: p.id, tests: p.tests }, p.solution);
      if (!r.pass) throw new Error(r.message + '\n' + JSON.stringify(r.results, null, 1));
    });
    test(p.id + ' 起始代码不会直接通过', () => {
      const r = Grade.gradeTask({ id: p.id, tests: p.tests }, p.starter);
      ok(!r.pass, '起始代码直接通过了，题目缺少待完成内容');
    });
  });
});

if (!gcc) {
  describe('在线编程题：gcc 复核', () => {
    test('跳过（没有找到 gcc）', () => { console.log('    未找到 gcc，跳过编译复核'); });
  });
} else {
  describe('在线编程题：真实 gcc 复核参考答案', () => {
    PROBLEMS.forEach(p => {
      test(p.id + ' ' + p.header, () => {
        const base = path.join(tmp, p.id);
        const src = base + '.c';
        const exe = base + '.exe';
        fs.writeFileSync(src, p.solution, 'utf8');
        const comp = spawnSync(gcc, ['-std=c11', '-O0', '-w', src, '-o', exe, '-lm'], { encoding: 'utf8' });
        if (comp.status !== 0) throw new Error('gcc 编译失败：' + (comp.stderr || comp.error));
        p.tests.forEach((t, i) => {
          const run = spawnSync(exe, [], { input: t.stdin, encoding: 'utf8', timeout: 5000 });
          if (run.error) throw new Error('运行失败：' + run.error.message);
          const actual = String(run.stdout || '').replace(/\r\n/g, '\n');
          const expected = String(t.expect).replace(/\r\n/g, '\n');
          if (actual !== expected) {
            throw new Error('测试点 ' + (i + 1) + ' 不一致\n输入：' + JSON.stringify(t.stdin) +
              '\n期望：' + JSON.stringify(expected) + '\n实际：' + JSON.stringify(actual) +
              '\nstderr：' + String(run.stderr || ''));
          }
        });
      });
    });
  });
}

fs.rmSync(tmp, { recursive: true, force: true });
summary();
