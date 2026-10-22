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
  'assets/js/fx.js',
  'assets/js/world-art.js',
  'assets/js/world-data.js',
  'assets/js/puzzles.js',
  'assets/js/puzzles-b.js',
  'assets/js/content-funcs-1.js',
  'assets/js/content-funcs-2.js',
  'assets/js/content-funcs-3.js',
  'assets/js/content-funcs-4.js',
  'assets/js/flowchart.js',
  'assets/js/content-think.js',
  'assets/js/views-think.js'
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

describe('情绪价值：夸夸与安慰', () => {
  const FX = CC.FX;

  test('夸夸池足够大，而且句子都不重复', () => {
    ok(FX && FX.PRAISE, '没有找到夸夸池');
    ok(FX.PRAISE.length >= 40, '夸夸句子太少：' + FX.PRAISE.length);
    const set = new Set(FX.PRAISE);
    eq(set.size, FX.PRAISE.length, '夸夸池里有重复的句子');
    FX.PRAISE.forEach(p => ok(typeof p === 'string' && p.length >= 4, '有一句夸夸太短了：' + p));
  });

  test('安慰池足够大，句子都不重复', () => {
    ok(FX && FX.COMFORT, '没有找到安慰池');
    ok(FX.COMFORT.length >= 20, '安慰句子太少：' + FX.COMFORT.length);
    const set = new Set(FX.COMFORT);
    eq(set.size, FX.COMFORT.length, '安慰池里有重复的句子');
  });

  test('每次安慰抽 5 句，互相都不重复', () => {
    const used = [];
    for (let round = 0; round < 12; round++) {
      const picked = FX._pickUnique(FX.COMFORT, used, 5);
      eq(picked.length, 5, '没有抽满 5 句');
      eq(new Set(picked).size, 5, '同一轮里出现了重复的安慰：' + picked.join(' / '));
      picked.forEach(p => ok(FX.COMFORT.indexOf(p) >= 0, '抽出了不在池子里的句子'));
    }
  });

  test('安慰不会连着重复（池子用完后才重新开始）', () => {
    const used = [];
    const seen = [];
    for (let round = 0; round < 4; round++) {
      const picked = FX._pickUnique(FX.COMFORT, used, 5);
      picked.forEach(p => {
        ok(seen.indexOf(p) < 0, '上一次安慰过的句子又出现了：' + p);
        seen.push(p);
      });
    }
  });
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
describe('判题严格度：空行不能蒙混过关', () => {
  const G = CC.Grade;
  const task = { tests: [{ expect: '第一行\n第二行\n第三行' }] };
  const run = (code) => G.gradeTask(task, code);

  test('完全正确（最后一行带 \\n）能通过', () => {
    const r = run('#include <stdio.h>\nint main(){printf("第一行\\n第二行\\n第三行\\n");return 0;}');
    ok(r.pass, '正确输出应该通过：' + r.message);
  });

  test('最后一行不带 \\n 也能通过（每一行的内容一样）', () => {
    const r = run('#include <stdio.h>\nint main(){printf("第一行\\n第二行\\n第三行");return 0;}');
    ok(r.pass, '不写最后那个换行符应该也算对：' + r.message);
  });

  test('两行之间多一个空行 → 判错', () => {
    const r = run('#include <stdio.h>\nint main(){printf("第一行\\n\\n第二行\\n第三行\\n");return 0;}');
    ok(!r.pass, '中间多空行不应该通过');
    contains(r.message, '空行');
  });

  test('开头多空行 → 判错', () => {
    const r = run('#include <stdio.h>\nint main(){printf("\\n\\n第一行\\n第二行\\n第三行\\n");return 0;}');
    ok(!r.pass, '开头多空行不应该通过');
    contains(r.message, '空行');
  });

  test('结尾多空行 → 判错', () => {
    const r = run('#include <stdio.h>\nint main(){printf("第一行\\n第二行\\n第三行\\n\\n\\n");return 0;}');
    ok(!r.pass, '结尾多空行不应该通过');
    contains(r.message, '空行');
  });

  test('每行都多空行 → 判错，并给出逐行对比', () => {
    const r = run('#include <stdio.h>\nint main(){printf("第一行\\n\\n第二行\\n\\n第三行\\n\\n");return 0;}');
    ok(!r.pass, '每行后多空行不应该通过');
    contains(r.message, '空行');
    contains(r.message, '题目要的输出（3 行）');
    contains(r.message, '你的输出（6 行）');
    contains(r.message, '（空行）');
  });

  test('行尾空格不算错（看不见，不影响结果）', () => {
    const r = run('#include <stdio.h>\nint main(){printf("第一行   \\n第二行\\t\\n第三行\\n");return 0;}');
    ok(r.pass, '行尾空格应该被忽略：' + r.message);
  });

  test('少打印一行 → 判错并说清行数', () => {
    const r = run('#include <stdio.h>\nint main(){printf("第一行\\n第二行\\n");return 0;}');
    ok(!r.pass);
    contains(r.message, '行数少了');
  });

  test('多打印一行 → 判错并说清行数', () => {
    const r = run('#include <stdio.h>\nint main(){printf("第一行\\n第二行\\n第三行\\n第四行\\n");return 0;}');
    ok(!r.pass);
    contains(r.message, '行数多了');
  });

  test('打错一个字 → 指出第几行不一样', () => {
    const r = run('#include <stdio.h>\nint main(){printf("第一行\\n第二行\\n第三行啊\\n");return 0;}');
    ok(!r.pass);
    contains(r.message, '第 3 行');
  });

  test('所有题目的参考答案依然能通过严格判题', () => {
    LESSONS.forEach(l => l.tasks.forEach(t => {
      if (!t.solution) return;
      const r = G.gradeTask(t, t.solution);
      ok(r.pass, t.id + ' 的参考答案在新的严格判题下不通过了：' + r.message.split('\n')[0]);
    }));
  });
});

describe('函数手册：内容与可运行性', () => {
  const FX = CC.FUNCS || [];
  const HDR = CC.FUNC_HEADERS || {};

  test('函数手册条目足够多', () => {
    ok(FX.length >= 90, '函数条目太少：' + FX.length);
  });

  test('每个条目都写全了（名字 / 头文件 / 原型 / 作用 / 参数 / 返回值）', () => {
    FX.forEach(f => {
      ok(f.id && f.name, '有条目缺少 id 或 name');
      ok(f.header, f.name + ' 缺少 header');
      ok(HDR[f.header], f.name + ' 用到了不存在的头文件 ' + f.header);
      ok(f.proto, f.name + ' 缺少原型');
      ok(f.brief && f.brief.length >= 4, f.name + ' 缺少一句话说明');
      ok(f.params && f.returns, f.name + ' 缺少参数或返回值说明');
      ok(Array.isArray(f.notes) && f.notes.length >= 1, f.name + ' 缺少使用要点/坑');
      ok(typeof f.example === 'string' && f.example.indexOf('int main') >= 0, f.name + ' 缺少示例代码');
      ok(f.supported === true || f.supported === false, f.name + ' 缺少 supported 标记');
    });
  });

  test('id 唯一', () => {
    const seen = new Set();
    FX.forEach(f => { ok(!seen.has(f.id), '重复的函数条目：' + f.id); seen.add(f.id); });
  });

  test('标了「本站可运行」的函数，解释器里真的存在', () => {
    const builtins = new Set(CC.builtinNames());
    FX.forEach(f => {
      if (!f.supported) return;
      if (f.kind === 'macro' || f.kind === 'operator') return;
      ok(builtins.has(f.name), f.name + ' 标了可运行，但解释器里没有这个函数');
    });
  });

  test('标了「本站可运行」的示例必须真的能跑通', () => {
    FX.forEach(f => {
      if (!f.supported) return;
      const r = CC.run(f.example, { stdin: f.demoStdin || '', fixedTime: 1735689600 });
      if (!r.ok) {
        throw new Error(f.name + ' 的示例跑不起来：' + r.error.message + ' | ' + (r.error.hint || '') + '\n代码：\n' + f.example);
      }
    });
  });

  test('标了「需要真编译器」的函数，示例里没有用到本站不支持的语法也能正常保存', () => {
    FX.forEach(f => {
      if (f.supported) return;
      ok(f.example.length > 10, f.name + ' 的示例太短');
    });
  });

  test('每个头文件都有介绍，并且至少有一个函数', () => {
    const used = {};
    FX.forEach(f => { used[f.header] = true; });
    Object.keys(HDR).forEach(id => {
      ok(HDR[id].title && HDR[id].summary && HDR[id].when, id + ' 缺少介绍');
    });
    Object.keys(used).forEach(id => ok(HDR[id], id + ' 没有对应的头文件介绍'));
  });

  test('支持 / 不支持的条目都有，方便新手分清', () => {
    const sup = FX.filter(f => f.supported).length;
    const no = FX.filter(f => !f.supported).length;
    ok(sup >= 50, '本站可运行的函数太少：' + sup);
    ok(no >= 20, '需要真编译器的函数太少：' + no);
  });
});

describe('流程图工坊：模板', () => {
  const T = CC.FLOW_TEMPLATES || [];

  test('至少准备了 6 个模板', () => {
    ok(T.length >= 6, '模板太少：' + T.length);
  });

  test('每个模板都有名字、说明、参考代码、图形和连线', () => {
    T.forEach(tpl => {
      ok(tpl.id && tpl.name && tpl.desc, '模板缺少基本信息：' + tpl.id);
      ok(tpl.code && tpl.code.indexOf('int main') >= 0, tpl.name + ' 缺少参考代码');
      ok(Array.isArray(tpl.nodes) && tpl.nodes.length >= 5, tpl.name + ' 图形太少');
      ok(Array.isArray(tpl.edges) && tpl.edges.length >= 4, tpl.name + ' 连线太少');
    });
  });

  test('模板里的图形 id 唯一，类型合法', () => {
    const types = ['start', 'process', 'decision', 'io'];
    T.forEach(tpl => {
      const seen = new Set();
      tpl.nodes.forEach(n => {
        ok(!seen.has(n.id), tpl.name + ' 里图形 id 重复：' + n.id);
        seen.add(n.id);
        ok(types.indexOf(n.type) >= 0, tpl.name + ' 里图形类型不合法：' + n.type);
        ok(typeof n.x === 'number' && typeof n.y === 'number', tpl.name + ' 里图形缺少坐标');
        ok(n.x >= 0 && n.y >= 0, tpl.name + ' 里图形坐标是负数');
        ok(n.text, tpl.name + ' 里图形缺少文字');
      });
    });
  });

  test('所有连线的两端都存在，而且有开始、有结束', () => {
    T.forEach(tpl => {
      const ids = new Set(tpl.nodes.map(n => n.id));
      tpl.edges.forEach(e => {
        ok(ids.has(e.from), tpl.name + ' 的连线起点不存在：' + e.from);
        ok(ids.has(e.to), tpl.name + ' 的连线终点不存在：' + e.to);
      });
      ok(tpl.nodes.some(n => String(n.text).indexOf('开始') >= 0), tpl.name + ' 没有「开始」');
      ok(tpl.nodes.some(n => String(n.text).indexOf('结束') >= 0), tpl.name + ' 没有「结束」');
    });
  });

  test('判断的出口标了「是 / 否」', () => {
    T.forEach(tpl => {
      const decisions = tpl.nodes.filter(n => n.type === 'decision').map(n => n.id);
      const labelled = tpl.edges.filter(e => decisions.indexOf(e.from) >= 0 && (e.label === '是' || e.label === '否'));
      if (decisions.length) ok(labelled.length >= decisions.length, tpl.name + ' 有判断没标是/否');
    });
  });
});

describe('思维训练：题目与参考流程图', () => {
  const P = CC.THINK_PROBLEMS || [];

  test('至少有 8 道思维训练题', () => {
    ok(P.length >= 8, '题目太少：' + P.length);
  });

  test('每道题都写全了（题干/例子/知识点/提示/对应代码练习）', () => {
    const taskIds = {};
    LESSONS.forEach(l => l.tasks.forEach(t => { taskIds[t.id] = t; }));
    P.forEach(p => {
      ok(p.id && p.title, '题目缺少编号或标题');
      ok(p.brief && p.brief.length >= 10, p.title + ' 缺少题干');
      ok(Array.isArray(p.examples) && p.examples.length, p.title + ' 缺少输入输出例子');
      ok(p.teach && p.teach.length >= 10, p.title + ' 缺少知识点讲解');
      ok(Array.isArray(p.hints) && p.hints.length, p.title + ' 缺少提示');
      ok(p.taskId && taskIds[p.taskId], p.title + ' 对应的代码练习不存在：' + p.taskId);
      ok(p.needs && p.needs.minNodes, p.title + ' 缺少检查要求');
    });
  });

  test('题目编号唯一，并且每种结构都有覆盖', () => {
    const seen = new Set();
    let decisions = 0, loops = 0, nested = 0;
    P.forEach(p => {
      ok(!seen.has(p.id), '题目编号重复：' + p.id);
      seen.add(p.id);
      if (p.needs.decisions) decisions++;
      if (p.needs.loop) loops++;
      if (p.needs.cycles > 1) nested++;
    });
    ok(decisions >= 6, '练判断的题太少');
    ok(loops >= 4, '练循环的题太少');
    ok(nested >= 1, '缺少练嵌套循环的题');
  });

  test('每道题都有参考流程图，并且结构合法', () => {
    P.forEach(p => {
      const ref = CC.ThinkView.referenceOf.call({ referenceOf: CC.ThinkView.referenceOf, problemById: CC.ThinkView.problemById, problems: P }, p);
      ok(ref && ref.nodes && ref.nodes.length >= 3, p.title + ' 缺少参考流程图');
      const ids = {};
      ref.nodes.forEach(n => { ids[n.id] = true; ok(n.type && n.text, p.title + ' 参考图里有不完整的框'); });
      ref.edges.forEach(e => {
        ok(ids[e.from] && ids[e.to], p.title + ' 参考图里有断掉的箭头');
      });
    });
  });

  test('每道题的参考流程图都能通过它自己的「思路检查」', () => {
    P.forEach(p => {
      const ref = (function () {
        if (p.reference) return p.reference;
        const tpls = CC.FLOW_TEMPLATES || [];
        for (const t of tpls) if (t.id === p.referenceTemplate) return { nodes: t.nodes, edges: t.edges };
        return null;
      })();
      const probe = Object.create(CC.ThinkView);
      probe.nodes = JSON.parse(JSON.stringify(ref.nodes));
      probe.edges = JSON.parse(JSON.stringify(ref.edges));
      const r = probe.check(p);
      if (!r.ok) throw new Error(p.title + ' 的参考流程图没通过自己的检查：' + r.issues.join(' / '));
    });
  });

  test('空画布会被判为思路不完整', () => {
    const probe = Object.create(CC.ThinkView);
    probe.nodes = [{ id: 's', type: 'start', x: 0, y: 0, text: '开始' }];
    probe.edges = [];
    const r = probe.check(P[0]);
    ok(!r.ok, '只有开始也能通过？');
    ok(r.issues.length >= 2, '应该列出多个问题');
  });
});

summary();