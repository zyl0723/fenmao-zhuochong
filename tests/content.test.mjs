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
  'assets/js/content-bugs.js',
  'assets/js/world-art.js',
  'assets/js/world-data.js',
  'assets/js/puzzles.js',
  'assets/js/puzzles-b.js'
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

describe('大世界地图与谜题', () => {
  const WD = CC.WorldData;
  const Puzzles = CC.Puzzles;

  test('世界里有 4 个区域，每个区域都能读出来', () => {
    ok(WD && WD.Area, '没有找到 WorldData');
    const ids = WD.Area.ids();
    ok(ids.length >= 4, '区域太少：' + ids.join(', '));
    ids.forEach(id => {
      const a = WD.Area.get(id);
      ok(a && a.rows && a.rows.length, id + ' 读不出来');
      ok(a.name && a.spawn, id + ' 缺少名字或出生点');
    });
  });

  test('每个区域的地图都是规整的矩形，字符都在图例里', () => {
    WD.Area.ids().forEach(id => {
      const a = WD.Area.get(id);
      const w = a.size.w;
      eq(a.rows.length, a.size.h, id + ' 行数和 size.h 不一致');
      a.rows.forEach((row, y) => {
        eq(row.length, w, id + ' 第 ' + (y + 1) + ' 行宽度不对');
        for (const ch of row) {
          ok(WD.LEGEND[ch], id + ' 里出现了图例没有的字符：' + ch);
        }
      });
    });
  });

  test('出生点踩在能走的地方', () => {
    WD.Area.ids().forEach(id => {
      const a = WD.Area.get(id);
      const tiles = WD.Area.decode(a.rows);
      const tx = Math.floor(a.spawn.x), ty = Math.floor(a.spawn.y);
      ok(tx >= 0 && tx < a.size.w && ty >= 0 && ty < a.size.h, id + ' 的出生点跑到地图外面了');
      ok(WD.walkable(tiles[ty][tx]), id + ' 的出生点落在不能走的地形上：' + tiles[ty][tx]);
    });
  });

  test('物件坐标都在地图范围内', () => {
    WD.Area.ids().forEach(id => {
      const a = WD.Area.get(id);
      (a.objects || []).forEach(o => {
        ok(o.kind, id + ' 里有物件缺少 kind');
        ok(o.x >= 0 && o.x < a.size.w && o.y >= 0 && o.y < a.size.h,
          id + ' 的物件 ' + (o.id || o.kind) + ' 坐标越界：' + o.x + ',' + o.y);
        if (o.to) ok(WD.Area.has(o.to), id + ' 的物件 ' + o.id + ' 通向不存在的区域 ' + o.to);
        if (o.puzzle) ok(Puzzles.get(o.puzzle), id + ' 的物件 ' + o.id + ' 指向不存在的谜题 ' + o.puzzle);
      });
    });
  });

  test('谜题都写全了（标题、猫的话、隐喻、玩法）', () => {
    const ids = Puzzles.ids();
    ok(ids.length >= 9, '谜题太少：' + ids.length);
    ids.forEach(pid => {
      const d = Puzzles.get(pid);
      ok(d.id && d.title, pid + ' 缺少标题');
      ok(d.cat && d.cat.length, pid + ' 缺少小猫的话');
      ok(d.metaphor, pid + ' 缺少「像什么」的说明');
      ok(typeof d.build === 'function', pid + ' 缺少玩法');
      ok(d.reward, pid + ' 缺少奖励设置');
    });
  });

  test('每个谜题对应的编程挑战都是真实存在的任务', () => {
    const links = Puzzles.TASK_LINKS || {};
    const all = {};
    LESSONS.forEach(l => l.tasks.forEach(t => { all[t.id] = true; }));
    BUGS.forEach(b => { all[b.id] = true; });
    Object.keys(links).forEach(pid => {
      ok(Puzzles.get(pid), 'TASK_LINKS 里的 ' + pid + ' 不是一个谜题');
      const tid = links[pid];
      if (tid) ok(all[tid], pid + ' 对应的任务 ' + tid + ' 不存在');
    });
  });

  test('世界里的谜题都有对应的课程试炼或说明', () => {
    const links = Puzzles.TASK_LINKS || {};
    WD.Area.ids().forEach(id => {
      (WD.Area.get(id).objects || []).forEach(o => {
        if (!o.puzzle) return;
        if (['books', 'bag', 'feed', 'bridge', 'boat', 'sleep', 'cave'].indexOf(o.puzzle) >= 0) return;  // 工具类的不需要试炼
        ok(links[o.puzzle], '谜题 ' + o.puzzle + ' 还没有配「自己写一遍」的课程试炼');
      });
    });
  });
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