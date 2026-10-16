import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { ROOT, describe, test, ok, eq, contains, summary } from './harness.mjs';

// 把所有内容文件加载进同一个沙箱
const FILES = [
  'assets/js/interpreter.js',
  'assets/js/grader.js',
  'assets/js/content-lessons-1.js',
  'assets/js/content-lessons-2.js',
  'assets/js/content-lessons-3.js',
  'assets/js/content-lessons-4.js',
  'assets/js/content-bugs.js'
].filter(f => fs.existsSync(path.join(ROOT, f)));

const sandbox = { console };
vm.createContext(sandbox);
for (const f of FILES) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
}
const CC = sandbox.CC;
const LESSONS = CC.LESSONS || [];
const BUGS = CC.BUGS || [];
const Grade = CC.Grade;

const SECTION_TYPES = ['text', 'code', 'table', 'tip', 'mistakes', 'list', 'steps'];
const problems = [];

describe('内容规模', () => {
  test('课程数量 >= 16', () => ok(LESSONS.length >= 16, '当前只有 ' + LESSONS.length + ' 课'));
  test('捉虫关卡 >= 8', () => ok(BUGS.length >= 8, '当前只有 ' + BUGS.length + ' 个关卡'));
  test('每个课程都有 2 个以上任务', () => {
    LESSONS.forEach(l => ok(l.tasks && l.tasks.length >= 2, l.id + ' 任务太少'));
  });
  test('任务 id 唯一', () => {
    const seen = new Set();
    LESSONS.forEach(l => l.tasks.forEach(t => {
      ok(!seen.has(t.id), '任务 id 重复：' + t.id);
      seen.add(t.id);
    }));
  });
});

describe('课程结构', () => {
  test('每课都有标题、目标、章节、任务', () => {
    LESSONS.forEach(l => {
      ok(l.id && l.title && l.subtitle, l.id + ' 缺少基本信息');
      ok(Array.isArray(l.goals) && l.goals.length >= 2, l.id + ' 缺少学习目标');
      ok(Array.isArray(l.sections) && l.sections.length >= 4, l.id + ' 讲解内容太少');
      l.sections.forEach((s, i) => {
        ok(SECTION_TYPES.includes(s.type), l.id + ' 第 ' + (i + 1) + ' 节使用了未知类型 ' + s.type);
        if (s.type === 'text') { ok(s.h && s.p && s.p.length, l.id + ' 文本小节不完整'); }
        if (s.type === 'code') { ok(typeof s.code === 'string' && s.code.length > 10, l.id + ' 代码示例为空'); }
        if (s.type === 'table') { ok(s.head && s.rows && s.rows.length, l.id + ' 表格不完整'); }
        if (s.type === 'mistakes') { ok(s.items && s.items.length, l.id + ' 常见错误为空'); }
      });
    });
  });

  test('每个任务都有 starter / 提示 / 测试', () => {
    LESSONS.forEach(l => l.tasks.forEach(t => {
      ok(t.title, l.id + ' 有任务缺少 title');
      ok(t.brief, t.id + ' 缺少 brief');
      ok(typeof t.starter === 'string' && t.starter.length > 5, t.id + ' 缺少起始代码');
      ok(Array.isArray(t.hints) && t.hints.length >= 1, t.id + ' 缺少提示');
      ok(Array.isArray(t.tests) && t.tests.length >= 1, t.id + ' 缺少测试');
    }));
  });
});

describe('参考答案必须能通过判题', () => {
  const tasksWithSolution = [];
  LESSONS.forEach(l => l.tasks.forEach(t => { if (t.solution) tasksWithSolution.push({ lesson: l, task: t }); }));
  test('所有任务都提供了参考答案', () => {
    LESSONS.forEach(l => l.tasks.forEach(t => ok(t.solution, t.id + ' 缺少参考答案')));
  });
  tasksWithSolution.forEach(({ lesson, task }) => {
    test(lesson.id + ' / ' + task.id + ' 参考答案通过', () => {
      const r = Grade.gradeTask(task, task.solution);
      if (!r.pass) {
        throw new Error('参考答案没通过：' + r.message + '\n测试结果：' + JSON.stringify(r.results, null, 1));
      }
    });
  });
});

describe('捉虫关卡检查', () => {
  if (BUGS.length) {
    test('每个关卡都有 buggy 代码、参考答案和测试', () => {
      BUGS.forEach(b => {
        ok(b.id && b.title && b.brief, '关卡缺少基本信息');
        ok(typeof b.buggy === 'string' && b.buggy.length > 10, b.id + ' 缺少有 bug 的代码');
        ok(typeof b.fixed === 'string' && b.fixed.length > 10, b.id + ' 缺少修好的代码');
        ok(Array.isArray(b.tests) && b.tests.length >= 1, b.id + ' 缺少测试');
        ok(b.hint, b.id + ' 缺少提示');
      });
    });
    BUGS.forEach(b => {
      test(b.id + ' 修好的代码能通过', () => {
        const r = Grade.gradeTask(b, b.fixed);
        if (!r.pass) throw new Error('修好的代码没通过：' + r.message + '\n' + JSON.stringify(r.results, null, 1));
      });
      test(b.id + ' 原始代码确实有问题', () => {
        const r = Grade.gradeTask(b, b.buggy);
        ok(!r.pass, '这段「有 bug 的代码」居然直接通过了，关卡需要重新设计');
      });
    });
  }
});

// 顺便检查一下起始代码是不是“太善良”（直接就能通过）
const friendlyStarters = [];
LESSONS.forEach(l => l.tasks.forEach(t => {
  if (!t.starter) return;
  const r = Grade.gradeTask(t, t.starter);
  if (r.pass) friendlyStarters.push(t.id);
}));

process.stdout.write('\n起始代码就能通过的任务（不算错误，但可以留意）：' + (friendlyStarters.length ? friendlyStarters.join(', ') : '无') + '\n');
summary();