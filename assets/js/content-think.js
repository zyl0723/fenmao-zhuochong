/*!
 * 粉猫捉虫 · 思维训练题（流程图 + 代码）
 * 每道题：题目 → 画流程图 → 检查思路 → 看参考 → 写代码（复用已判题的课程试炼）
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});

  function n(id, type, x, y, text) { return { id: id, type: type, x: x, y: y, text: text }; }
  function e(from, to, label) { return { from: from, to: to, label: label || '' }; }

  var PROBLEMS = [
    {
      id: 'T1', title: '成绩等级', difficulty: 1, taskId: 'L7-T1',
      brief: '已知 score = 75。\n90 分及以上输出「优秀」；60~89 输出「及格」；60 以下输出「不及格」。',
      examples: [['75', '及格'], ['95', '优秀'], ['40', '不及格']],
      needs: { minNodes: 6, decisions: 2, loop: false, keywords: [['score', '成绩', '分数'], ['90'], ['60']] },
      teach: '这是一道「多分支」题：判断要一层套一层。先问「是不是 90 以上」，不是的话再问「是不是 60 以上」。',
      hints: ['别忘了先输入成绩。', '两条「是 / 否」的路最后都要汇合到「结束」。'],
      reference: {
        nodes: [
          n('s', 'start', 560, 20, '开始'), n('in', 'io', 545, 110, '输入 score'),
          n('d1', 'decision', 550, 200, 'score >= 90 ?'),
          n('p1', 'process', 250, 220, '输出「优秀」'),
          n('d2', 'decision', 550, 340, 'score >= 60 ?'),
          n('p2', 'process', 250, 360, '输出「及格」'),
          n('p3', 'process', 560, 480, '输出「不及格」'),
          n('end', 'start', 560, 600, '结束')
        ],
        edges: [e('s', 'in'), e('in', 'd1'), e('d1', 'p1', '是'), e('d1', 'd2', '否'),
          e('d2', 'p2', '是'), e('d2', 'p3', '否'), e('p1', 'end'), e('p2', 'end'), e('p3', 'end')]
      }
    },
    {
      id: 'T2', title: '1 到 100 求和', difficulty: 1, taskId: 'L9-T1',
      brief: '用循环计算 1 + 2 + … + 100，并输出结果。',
      examples: [['（无输入）', '1 到 100 的和是 5050']],
      needs: { minNodes: 5, decisions: 1, loop: true, keywords: [['sum', '和', '累加'], ['100'], ['i']] },
      teach: '求和的关键三件套：① 累加变量先归零 ② 循环变量从 1 开始 ③ 判断「还没到 100」就继续加。',
      hints: ['循环要有一条箭头回到判断。', '循环里既要 sum += i，也要让 i 变大。'],
      referenceTemplate: 'sum'
    },
    {
      id: 'T3', title: '三个数的最大值', difficulty: 1, taskId: 'L7-T2',
      brief: '已知 a = 12，b = 45，c = 7，找出最大值并输出。',
      examples: [['12 45 7', '最大值是 45']],
      needs: { minNodes: 6, decisions: 2, loop: false, keywords: [['max', '最大'], ['b'], ['c']] },
      teach: '「目前最大」的想法：先把 a 当冠军，再让 b、c 依次来挑战，谁大谁当新冠军。',
      hints: ['每一步挑战都是一次判断。', '两条分支最后要汇合，再继续下一个挑战。'],
      referenceTemplate: 'max3'
    },
    {
      id: 'T4', title: '判断素数', difficulty: 2, taskId: 'L14-T2',
      brief: '输入一个整数 n，判断它是不是素数。\n（素数：只能被 1 和它自己整除，且大于 1）',
      examples: [['17', '17 是素数'], ['20', '20 不是素数']],
      needs: { minNodes: 7, decisions: 2, loop: true, keywords: [['n'], ['i'], ['%', '余', '整除']] },
      teach: '先用 n < 2 排除掉 0、1 和负数；再从 2 开始试除，只要找到一个能整除的 i，就不是素数。',
      hints: ['注意判断的嵌套：循环里面还有一个「能不能整除」的判断。', '找到因数就可以直接结束，不用再试。'],
      referenceTemplate: 'prime'
    },
    {
      id: 'T5', title: '打印直角三角形', difficulty: 2, taskId: 'L10-T2',
      brief: '打印 5 行星星，第 1 行 1 个，第 2 行 2 个……第 5 行 5 个：\n*\n**\n***\n****\n*****',
      examples: [['（无输入）', '5 行星号，逐行变多']],
      needs: { minNodes: 5, decisions: 1, loop: true, cycles: 2, keywords: [['行', 'i'], ['星', '*', 'j']] },
      teach: '两层循环：外层管「第几行」，内层管「这一行打印几个星」。内层的次数依赖外层的 i。',
      hints: ['外层 i 从 1 到 5。', '内层 j 从 1 到 i；内层每轮打印一个星。', '内层结束后别忘了换行。'],
      reference: {
        nodes: [
          n('s', 'start', 560, 20, '开始'), n('i0', 'process', 535, 100, 'i = 1'),
          n('d1', 'decision', 550, 190, 'i <= 5 ?'),
          n('j0', 'process', 835, 200, 'j = 1'),
          n('d2', 'decision', 850, 290, 'j <= i ?'),
          n('out', 'io', 1150, 300, '输出一个 *'),
          n('j1', 'process', 1160, 400, 'j = j + 1'),
          n('nl', 'io', 835, 420, '输出换行'),
          n('i1', 'process', 535, 360, 'i = i + 1'),
          n('end', 'start', 560, 480, '结束')
        ],
        edges: [e('s', 'i0'), e('i0', 'd1'), e('d1', 'j0', '是'), e('j0', 'd2'),
          e('d2', 'out', '是'), e('out', 'j1'), e('j1', 'd2'), e('d2', 'nl', '否'),
          e('nl', 'i1'), e('i1', 'd1'), e('d1', 'end', '否')]
      }
    },
    {
      id: 'T6', title: '倒序输出 5 个数', difficulty: 2, taskId: 'L11-T3',
      brief: '读入 5 个整数存进数组，再倒着打印出来（数字之间用空格分开）。',
      examples: [['1 2 3 4 5', '5 4 3 2 1']],
      needs: { minNodes: 5, decisions: 1, loop: true, keywords: [['数组', 'a[', 'a'], ['倒', '逆', '5']] },
      teach: '两段循环：第一段把 5 个数读进数组；第二段从下标 4 开始往回走到 0。',
      hints: ['先想清楚数组的下标范围：0 ~ 4。', '倒着走是 i = 4 开始，每次 i 减 1，直到 i >= 0。'],
      reference: {
        nodes: [
          n('s', 'start', 80, 40, '开始'), n('rd', 'process', 60, 130, '读入 5 个数到 a[0..4]'),
          n('i0', 'process', 60, 230, 'i = 4'),
          n('d', 'decision', 70, 330, 'i >= 0 ?'),
          n('out', 'io', 330, 340, '输出 a[i] 和一个空格'),
          n('dec', 'process', 340, 440, 'i = i - 1'),
          n('end', 'start', 80, 520, '结束')
        ],
        edges: [e('s', 'rd'), e('rd', 'i0'), e('i0', 'd'), e('d', 'out', '是'),
          e('out', 'dec'), e('dec', 'd'), e('d', 'end', '否')]
      }
    },
    {
      id: 'T7', title: '判断回文', difficulty: 3, taskId: 'L13-T3',
      brief: '读入一个不含空格的字符串，判断它正着读和倒着读是不是一样（回文）。\n例如 level 是回文，hello 不是。',
      examples: [['level', 'level 是回文'], ['hello', 'hello 不是回文']],
      needs: { minNodes: 6, decisions: 2, loop: true, keywords: [['i'], ['j'], ['len', '长度']] },
      teach: '用两个下标从两头往中间走：i 从 0 开始向右，j 从 len-1 开始向左。只要有一对字符不一样，就不是回文。',
      hints: ['先求字符串长度 len。', '循环条件是 i < j（走到中间就停）。', '循环里先判断 s[i] 和 s[j] 是否相等。'],
      reference: {
        nodes: [
          n('s', 'start', 60, 30, '开始'), n('in', 'io', 45, 110, '输入字符串 s'),
          n('len', 'process', 45, 190, 'len = strlen(s)；i = 0；j = len - 1'),
          n('d1', 'decision', 60, 280, 'i < j ?'),
          n('d2', 'decision', 320, 290, 's[i] == s[j] ?'),
          n('no', 'io', 600, 200, '输出「不是回文」'),
          n('mv', 'process', 600, 380, 'i = i + 1；j = j - 1'),
          n('yes', 'io', 320, 430, '输出「是回文」'),
          n('end', 'start', 620, 480, '结束')
        ],
        edges: [e('s', 'in'), e('in', 'len'), e('len', 'd1'), e('d1', 'd2', '是'),
          e('d2', 'mv', '是'), e('mv', 'd1'), e('d2', 'no', '否'), e('d1', 'yes', '否'),
          e('no', 'end'), e('yes', 'end')]
      }
    },
    {
      id: 'T8', title: '成绩统计系统', difficulty: 3, taskId: 'L16-T1',
      brief: '先读人数 n，再读入 n 个成绩。输出：\n共 n 人\n平均分（保留 2 位小数）\n最高分\n及格人数',
      examples: [['5 / 88 92 76 95 60', '共 5 人 / 平均分 82.20 / 最高分 95 / 及格 5 人']],
      needs: { minNodes: 7, decisions: 1, loop: true, keywords: [['n'], ['平均', 'avg'], ['最高', 'max'], ['及格', 'pass']] },
      teach: '把「读入 + 统计」放进同一个循环：每读一个成绩，就顺手累加总分、更新最高分、数一数及格人数。',
      hints: ['循环之前要把 sum、max、pass 这些统计变量准备好。', '平均分要除以 1.0 * n，避免整数除法。', '最后按题目要求的四行输出。'],
      reference: {
        nodes: [
          n('s', 'start', 40, 30, '开始'), n('in', 'io', 25, 110, '输入人数 n'),
          n('init', 'process', 25, 190, 'sum = 0；max = 0；pass = 0；i = 0'),
          n('d', 'decision', 40, 280, 'i < n ?'),
          n('read', 'io', 300, 290, '读入成绩 x'),
          n('stat', 'process', 300, 380, 'sum += x；更新 max；如果 x >= 60 则 pass++'),
          n('inc', 'process', 310, 470, 'i = i + 1'),
          n('avg', 'process', 40, 470, 'avg = sum / (1.0 * n)'),
          n('out', 'io', 40, 550, '输出人数 / 平均分 / 最高分 / 及格人数'),
          n('end', 'start', 60, 640, '结束')
        ],
        edges: [e('s', 'in'), e('in', 'init'), e('init', 'd'), e('d', 'read', '是'),
          e('read', 'stat'), e('stat', 'inc'), e('inc', 'd'), e('d', 'avg', '否'),
          e('avg', 'out'), e('out', 'end')]
      }
    }
  ];

  CC.THINK_PROBLEMS = PROBLEMS;
})(typeof globalThis !== 'undefined' ? globalThis : this);