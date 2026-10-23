/*!
 * 粉猫捉虫 · 函数阶梯题（三）：math + 组合过渡
 * math 每个函数单独 3 关；最后 12 道双函数组合题，作为进入综合挑战的桥。
 * 所有起始代码保持空白，头文件必须由学习者自己写。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var tasks = [];

  function addSingle(fn, header, specs) {
    specs.forEach(function (s, i) {
      var cases = s.cases;
      tasks.push({
        id: 'ladder-' + fn + '-' + (i + 1), kind: 'code', stage: 'single',
        target: fn, familyLevel: i + 1, header: header, level: s.level || i + 1,
        title: s.title, functions: [fn],
        story: s.story || ('这是「' + fn + '」专练第 ' + (i + 1) + ' 关。先把单个函数的输入、返回值和格式练熟。'),
        goal: s.goal, inputFormat: s.input, outputFormat: s.output,
        constraints: '必须自己写 #include 和 main；本题重点只练 ' + fn + '。',
        examples: [{ stdin: cases[0][0], stdout: cases[0][1], note: '先跑通公开样例，再提交全部测试点。' }],
        tests: cases.map(function (c, j) { return { name: j === 0 ? '公开样例' : ('测试点 ' + (j + 1)), stdin: c[0], expect: c[1] }; }),
        starter: '', hints: s.hints, solution: s.code, explain: s.explain
      });
    });
  }

  function addBridge(id, title, fnList, goal, input, output, cases, hints, code, explain) {
    tasks.push({
      id: 'bridge-' + id, kind: 'code', stage: 'bridge', target: '组合过渡',
      familyLevel: Number(id), header: '综合', level: 3,
      title: title, functions: fnList,
      story: '单函数训练结束，开始把两三个熟悉的函数接起来。组合题先慢一点，只组合你已经单独练过的函数。',
      goal: goal, inputFormat: input, outputFormat: output,
      constraints: '必须自己写 #include 和 main；先想清楚每个函数分别负责哪一步。',
      examples: [{ stdin: cases[0][0], stdout: cases[0][1], note: '组合题不是新函数题，而是把熟悉的积木搭起来。' }],
      tests: cases.map(function (c, j) { return { name: j === 0 ? '公开样例' : ('测试点 ' + (j + 1)), stdin: c[0], expect: c[1] }; }),
      starter: '', hints: hints, solution: code, explain: explain
    });
  }

  addSingle('sqrt', 'math.h', [
    {
      title: 'sqrt 第 1 关：求平方根',
      goal: '用 sqrt 输出一个非负数的平方根。',
      input: '一行，一个非负实数。',
      output: '输出平方根，保留三位小数。',
      cases: [['9\n', '3.000\n'], ['2\n', '1.414\n'], ['0\n', '0.000\n'], ['16\n', '4.000\n']],
      hints: ['需要 #include <math.h>。', 'sqrt 返回 double，printf 用 %.3f。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double x;\n    scanf("%lf", &x);\n    printf("%.3f\\n", sqrt(x));\n    return 0;\n}\n',
      explain: 'sqrt 的参数不能为负数；本题保证输入非负。'
    },
    {
      title: 'sqrt 第 2 关：直角三角形斜边',
      goal: '用 sqrt 计算两条直角边对应的斜边。',
      input: '一行，两个非负整数 a、b。',
      output: '输出斜边，保留三位小数。',
      cases: [['3 4\n', '5.000\n'], ['5 12\n', '13.000\n'], ['1 1\n', '1.414\n'], ['8 15\n', '17.000\n']],
      hints: ['先算 a*a + b*b。', 'sqrt(a*a + b*b) 得到斜边。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("%.3f\\n", sqrt(a * a + b * b));\n    return 0;\n}\n',
      explain: '这是勾股定理在 C 中的直接表达。'
    },
    {
      title: 'sqrt 第 3 关：长度是多少',
      goal: '用 sqrt 计算向量 (x, y) 的长度。',
      input: '一行，两个实数 x、y。',
      output: '输出长度，保留三位小数。',
      cases: [['3 4\n', '5.000\n'], ['-3 4\n', '5.000\n'], ['0 0\n', '0.000\n'], ['2 2\n', '2.828\n']],
      hints: ['平方可以写成 x*x。', 'sqrt(x*x + y*y) 对负坐标同样有效。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double x, y;\n    scanf("%lf %lf", &x, &y);\n    printf("%.3f\\n", sqrt(x * x + y * y));\n    return 0;\n}\n',
      explain: '平方后符号消失，所以负坐标不会影响长度。'
    }
  ]);

  addSingle('pow', 'math.h', [
    {
      title: 'pow 第 1 关：求平方',
      goal: '用 pow 计算一个数的平方。',
      input: '一行，一个实数 x。',
      output: '输出 x²，保留两位小数。',
      cases: [['3\n', '9.00\n'], ['-2.5\n', '6.25\n'], ['0\n', '0.00\n'], ['1.5\n', '2.25\n']],
      hints: ['pow(x, 2) 表示 x 的 2 次方。', '不要写成 x^2，^ 在 C 中不是乘方。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double x;\n    scanf("%lf", &x);\n    printf("%.2f\\n", pow(x, 2));\n    return 0;\n}\n',
      explain: 'pow 的两个参数都是 double 类型，结果也为 double。'
    },
    {
      title: 'pow 第 2 关：任意整数次方',
      goal: '用 pow 计算 base 的 exponent 次方。',
      input: '一行：实数 base、整数 exponent（0～6）。',
      output: '输出结果，保留三位小数。',
      cases: [['2 3\n', '8.000\n'], ['1.5 2\n', '2.250\n'], ['5 0\n', '1.000\n'], ['-2 3\n', '-8.000\n']],
      hints: ['读入 double 和 int。', 'pow(base, exponent) 会自动完成类型转换。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double base;\n    int exponent;\n    scanf("%lf %d", &base, &exponent);\n    printf("%.3f\\n", pow(base, exponent));\n    return 0;\n}\n',
      explain: '任何非零数的 0 次方都是 1。'
    },
    {
      title: 'pow 第 3 关：2 的幂',
      goal: '用 pow 输出 2 的 n 次方。',
      input: '一行，整数 n（0～20）。',
      output: '输出整数结果。',
      cases: [['0\n', '1\n'], ['3\n', '8\n'], ['10\n', '1024\n'], ['20\n', '1048576\n']],
      hints: ['pow(2, n) 返回 double。', '用 %.0f 输出为无小数形式。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    int n;\n    scanf("%d", &n);\n    printf("%.0f\\n", pow(2, n));\n    return 0;\n}\n',
      explain: 'n 在上限内时结果能被 double 精确表示。'
    }
  ]);

  addSingle('fabs', 'math.h', [
    {
      title: 'fabs 第 1 关：小数绝对值',
      goal: '用 fabs 输出一个实数的绝对值。',
      input: '一行，一个实数。',
      output: '输出绝对值，保留两位小数。',
      cases: [['-3.5\n', '3.50\n'], ['2.25\n', '2.25\n'], ['0\n', '0.00\n'], ['-0.1\n', '0.10\n']],
      hints: ['fabs 返回 double。', '它和 abs 不同，专用于浮点数。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double x;\n    scanf("%lf", &x);\n    printf("%.2f\\n", fabs(x));\n    return 0;\n}\n',
      explain: 'fabs 消除小数符号，不改变数值大小。'
    },
    {
      title: 'fabs 第 2 关：小数距离',
      goal: '用 fabs 求两个实数之间的差。',
      input: '一行，两个实数 a、b。',
      output: '输出 |a-b|，保留三位小数。',
      cases: [['3.5 1.25\n', '2.250\n'], ['-1.5 1.5\n', '3.000\n'], ['2 2\n', '0.000\n'], ['10.1 9.9\n', '0.200\n']],
      hints: ['先算 a-b。', '再用 fabs 消除符号。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double a, b;\n    scanf("%lf %lf", &a, &b);\n    printf("%.3f\\n", fabs(a - b));\n    return 0;\n}\n',
      explain: 'fabs 适合计算误差、距离和浮点差。'
    },
    {
      title: 'fabs 第 3 关：误差够小吗',
      goal: '用 fabs 判断测量值与目标值之差是否不超过 0.1。',
      input: '一行，两个实数 measured、target。',
      output: '误差 ≤ 0.1 输出 OK，否则输出 BAD。',
      cases: [['3.05 3\n', 'OK\n'], ['3.2 3\n', 'BAD\n'], ['-1.05 -1\n', 'OK\n'], ['0 0\n', 'OK\n']],
      hints: ['误差写成 fabs(measured - target)。', '用 <= 0.1 判断。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double measured, target;\n    scanf("%lf %lf", &measured, &target);\n    printf(fabs(measured - target) <= 0.1 ? "OK\\n" : "BAD\\n");\n    return 0;\n}\n',
      explain: '浮点数比较通常允许一个小误差范围。'
    }
  ]);

  addSingle('floor', 'math.h', [
    {
      title: 'floor 第 1 关：向下取整',
      goal: '用 floor 把一个实数向下取整。',
      input: '一行，一个实数。',
      output: '输出向下取整结果，保留一位小数。',
      cases: [['3.7\n', '3.0\n'], ['2.1\n', '2.0\n'], ['5\n', '5.0\n'], ['-2.1\n', '-3.0\n']],
      hints: ['floor 返回不大于输入的整数（以 double 表示）。', 'printf 用 %.1f。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double x;\n    scanf("%lf", &x);\n    printf("%.1f\\n", floor(x));\n    return 0;\n}\n',
      explain: '对负数来说，-2.1 的 floor 是 -3.0。'
    },
    {
      title: 'floor 第 2 关：能装满几组',
      goal: '用 floor 计算 people 能装满多少个 groupSize 人的小组。',
      input: '一行，两个正整数 people、groupSize。',
      output: '输出能装满的小组数。',
      cases: [['17 5\n', '3\n'], ['20 5\n', '4\n'], ['3 5\n', '0\n'], ['100 30\n', '3\n']],
      hints: ['people / (double)groupSize 得到小数。', 'floor 后转 int 输出。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    int people, groupSize;\n    scanf("%d %d", &people, &groupSize);\n    int groups = (int)floor(people / (double)groupSize);\n    printf("%d\\n", groups);\n    return 0;\n}\n',
      explain: '“能装满”要向下取整，剩余人数不足以组成一组。'
    },
    {
      title: 'floor 第 3 关：负坐标取整',
      goal: '用 floor 处理一个可能为负的坐标。',
      input: '一行，一个实数 x。',
      output: '输出：floor=x.0',
      cases: [['1.2\n', 'floor=1.0\n'], ['0\n', 'floor=0.0\n'], ['-0.1\n', 'floor=-1.0\n'], ['-3.8\n', 'floor=-4.0\n']],
      hints: ['不要用整数强制转换代替 floor。', '负数时两者结果不同。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double x;\n    scanf("%lf", &x);\n    printf("floor=%.1f\\n", floor(x));\n    return 0;\n}\n',
      explain: '(int)-0.1 会变成 0，而 floor(-0.1) 是 -1.0。'
    }
  ]);

  addSingle('ceil', 'math.h', [
    {
      title: 'ceil 第 1 关：向上取整',
      goal: '用 ceil 把一个实数向上取整。',
      input: '一行，一个实数。',
      output: '输出向上取整结果，保留一位小数。',
      cases: [['3.1\n', '4.0\n'], ['2\n', '2.0\n'], ['-2.1\n', '-2.0\n'], ['0.01\n', '1.0\n']],
      hints: ['ceil 返回不小于输入的整数（以 double 表示）。', 'printf 用 %.1f。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double x;\n    scanf("%lf", &x);\n    printf("%.1f\\n", ceil(x));\n    return 0;\n}\n',
      explain: '负数向上取整会靠近 0。'
    },
    {
      title: 'ceil 第 2 关：需要几辆车',
      goal: '用 ceil 计算运送 people 人至少需要几辆容量为 cap 的车。',
      input: '一行，两个正整数 people、cap。',
      output: '输出最少车辆数。',
      cases: [['17 5\n', '4\n'], ['20 5\n', '4\n'], ['3 5\n', '1\n'], ['100 30\n', '4\n']],
      hints: ['people / (double)cap 可能不是整数。', 'ceil 后转 int 得到车数。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    int people, cap;\n    scanf("%d %d", &people, &cap);\n    int cars = (int)ceil(people / (double)cap);\n    printf("%d\\n", cars);\n    return 0;\n}\n',
      explain: '只要还剩人，就还需要一辆车，所以向上取整。'
    },
    {
      title: 'ceil 第 3 关：负方向向上取整',
      goal: '用 ceil 处理负数的向上取整。',
      input: '一行，一个实数 x。',
      output: '输出：ceil=x.0',
      cases: [['1.2\n', 'ceil=2.0\n'], ['0\n', 'ceil=0.0\n'], ['-1.1\n', 'ceil=-1.0\n'], ['-3.8\n', 'ceil=-3.0\n']],
      hints: ['ceil(-0.1) 的结果是 -0.0，打印时可能带负号。', '不要用 floor 替代。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double x;\n    scanf("%lf", &x);\n    printf("ceil=%.1f\\n", ceil(x));\n    return 0;\n}\n',
      explain: '向上取整在负数侧同样成立，-3.8 会变成 -3.0。'
    }
  ]);

  addSingle('round', 'math.h', [
    {
      title: 'round 第 1 关：四舍五入',
      goal: '用 round 把一个实数按最接近的整数取整。',
      input: '一行，一个实数。',
      output: '输出取整结果，保留一位小数。',
      cases: [['3.6\n', '4.0\n'], ['3.4\n', '3.0\n'], ['2.5\n', '3.0\n'], ['-2.5\n', '-3.0\n']],
      hints: ['round 按远离 0 的方向处理 .5。', 'printf 用 %.1f。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double x;\n    scanf("%lf", &x);\n    printf("%.1f\\n", round(x));\n    return 0;\n}\n',
      explain: 'round(2.5) 是 3.0，round(-2.5) 是 -3.0。'
    },
    {
      title: 'round 第 2 关：平均分取整',
      goal: '用 round 把三个整数的平均值四舍五入成整数。',
      input: '一行，三个整数。',
      output: '输出最接近的平均值整数。',
      cases: [['1 2 2\n', '2\n'], ['1 1 2\n', '1\n'], ['10 10 11\n', '10\n'], ['9 10 10\n', '10\n']],
      hints: ['平均值用 sum / 3.0。', 'round 返回 double，用 %.0f 输出。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    int a, b, c;\n    scanf("%d %d %d", &a, &b, &c);\n    double avg = (a + b + c) / 3.0;\n    printf("%.0f\\n", round(avg));\n    return 0;\n}\n',
      explain: '整型平均容易丢掉小数，先转 double 再 round。'
    },
    {
      title: 'round 第 3 关：价格凑整',
      goal: '用 round 把价格四舍五入到整数元。',
      input: '一行，一个实数价格。',
      output: '输出整数元金额。',
      cases: [['12.6\n', '13\n'], ['12.4\n', '12\n'], ['0.5\n', '1\n'], ['99.49\n', '99\n']],
      hints: ['round 后转为整数输出。', '用 (int)round(price)。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double price;\n    scanf("%lf", &price);\n    printf("%d\\n", (int)round(price));\n    return 0;\n}\n',
      explain: '金额四舍五入后转换成 int，方便输出整元。'
    }
  ]);

  addSingle('fmin', 'math.h', [
    {
      title: 'fmin 第 1 关：两个数取较小',
      goal: '用 fmin 输出两个实数中较小的一个。',
      input: '一行，两个实数。',
      output: '输出较小值，保留两位小数。',
      cases: [['3.5 2.1\n', '2.10\n'], ['-1 2\n', '-1.00\n'], ['4 4\n', '4.00\n'], ['10.2 9.8\n', '9.80\n']],
      hints: ['fmin(a, b) 返回两者较小值。', '结果仍是 double。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double a, b;\n    scanf("%lf %lf", &a, &b);\n    printf("%.2f\\n", fmin(a, b));\n    return 0;\n}\n',
      explain: 'fmin 适合浮点数，不用自己写 if。'
    },
    {
      title: 'fmin 第 2 关：三个数的最小值',
      goal: '用 fmin 求三个实数的最小值。',
      input: '一行，三个实数。',
      output: '输出最小值，保留两位小数。',
      cases: [['3 1 2\n', '1.00\n'], ['-2 -5 -1\n', '-5.00\n'], ['4.5 4.5 4.5\n', '4.50\n'], ['0 -0.1 0.1\n', '-0.10\n']],
      hints: ['fmin 一次只能比较两个。', '可以先 fmin(a, b)，再和 c 比较。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double a, b, c;\n    scanf("%lf %lf %lf", &a, &b, &c);\n    printf("%.2f\\n", fmin(fmin(a, b), c));\n    return 0;\n}\n',
      explain: '把两个参数的函数嵌套起来，就能处理更多值。'
    },
    {
      title: 'fmin 第 3 关：预算内的价格',
      goal: '用 fmin 从两个价格中选较低的作为预算方案。',
      input: '一行，两个实数价格。',
      output: '输出：方案价格：x.xx',
      cases: [['15.5 12.8\n', '方案价格：12.80\n'], ['7 9\n', '方案价格：7.00\n'], ['0 3\n', '方案价格：0.00\n'], ['20 20\n', '方案价格：20.00\n']],
      hints: ['金额用 double。', '输出时用 fmin 选择更便宜的价格。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double a, b;\n    scanf("%lf %lf", &a, &b);\n    printf("方案价格：%.2f\\n", fmin(a, b));\n    return 0;\n}\n',
      explain: 'fmin 可以直接作为 printf 的参数。'
    }
  ]);

  addSingle('fmax', 'math.h', [
    {
      title: 'fmax 第 1 关：两个数取较大',
      goal: '用 fmax 输出两个实数中较大的一个。',
      input: '一行，两个实数。',
      output: '输出较大值，保留两位小数。',
      cases: [['3.5 2.1\n', '3.50\n'], ['-1 2\n', '2.00\n'], ['4 4\n', '4.00\n'], ['10.2 9.8\n', '10.20\n']],
      hints: ['fmax(a, b) 返回较大值。', '它和 fmin 的参数完全一样。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double a, b;\n    scanf("%lf %lf", &a, &b);\n    printf("%.2f\\n", fmax(a, b));\n    return 0;\n}\n',
      explain: 'fmax 不会修改原变量，只返回比较结果。'
    },
    {
      title: 'fmax 第 2 关：三个数的最大值',
      goal: '用 fmax 求三个实数的最大值。',
      input: '一行，三个实数。',
      output: '输出最大值，保留两位小数。',
      cases: [['3 1 2\n', '3.00\n'], ['-2 -5 -1\n', '-1.00\n'], ['4.5 6.1 5.2\n', '6.10\n'], ['0 -0.1 0.1\n', '0.10\n']],
      hints: ['先比较前两个。', '再把结果和第三个数比较。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double a, b, c;\n    scanf("%lf %lf %lf", &a, &b, &c);\n    printf("%.2f\\n", fmax(fmax(a, b), c));\n    return 0;\n}\n',
      explain: '嵌套 fmax 可以逐层合并最大值。'
    },
    {
      title: 'fmax 第 3 关：最佳成绩',
      goal: '用 fmax 输出两次成绩中的较高分。',
      input: '一行，两个实数成绩。',
      output: '输出：最佳：x.xx',
      cases: [['88.5 91.2\n', '最佳：91.20\n'], ['60 59.5\n', '最佳：60.00\n'], ['100 100\n', '最佳：100.00\n'], ['0 10\n', '最佳：10.00\n']],
      hints: ['成绩用 double。', '输出时调用 fmax。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double a, b;\n    scanf("%lf %lf", &a, &b);\n    printf("最佳：%.2f\\n", fmax(a, b));\n    return 0;\n}\n',
      explain: '比较函数返回结果，可以直接参与格式化输出。'
    }
  ]);

  addSingle('hypot', 'math.h', [
    {
      title: 'hypot 第 1 关：直角边求斜边',
      goal: '用 hypot 计算两条直角边对应的斜边。',
      input: '一行，两个非负实数 a、b。',
      output: '输出斜边，保留三位小数。',
      cases: [['3 4\n', '5.000\n'], ['5 12\n', '13.000\n'], ['1 1\n', '1.414\n'], ['0 2\n', '2.000\n']],
      hints: ['hypot(a, b) 等价于 sqrt(a*a + b*b)，但实现更稳。', '需要 #include <math.h>。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double a, b;\n    scanf("%lf %lf", &a, &b);\n    printf("%.3f\\n", hypot(a, b));\n    return 0;\n}\n',
      explain: 'hypot 专门计算平方和的平方根。'
    },
    {
      title: 'hypot 第 2 关：两点距离',
      goal: '用 hypot 计算两个二维点之间的距离。',
      input: '一行，四个实数 x1 y1 x2 y2。',
      output: '输出距离，保留三位小数。',
      cases: [['0 0 3 4\n', '5.000\n'], ['1 1 4 5\n', '5.000\n'], ['-1 -1 2 3\n', '5.000\n'], ['2 2 2 2\n', '0.000\n']],
      hints: ['dx = x2 - x1，dy = y2 - y1。', 'hypot(dx, dy)。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double x1, y1, x2, y2;\n    scanf("%lf %lf %lf %lf", &x1, &y1, &x2, &y2);\n    printf("%.3f\\n", hypot(x2 - x1, y2 - y1));\n    return 0;\n}\n',
      explain: '二维距离就是两个坐标差构成的直角三角形的斜边。'
    },
    {
      title: 'hypot 第 3 关：三维距离',
      goal: '用两层 hypot 计算三维空间两点距离。',
      input: '一行，六个实数 x1 y1 z1 x2 y2 z2。',
      output: '输出距离，保留三位小数。',
      cases: [['0 0 0 1 2 2\n', '3.000\n'], ['0 0 0 3 4 0\n', '5.000\n'], ['1 1 1 1 1 1\n', '0.000\n'], ['-1 -1 -1 1 1 1\n', '3.464\n']],
      hints: ['先算三个坐标差 dx、dy、dz。', '距离是 hypot(hypot(dx, dy), dz)。'],
      code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double x1, y1, z1, x2, y2, z2;\n    scanf("%lf %lf %lf %lf %lf %lf", &x1, &y1, &z1, &x2, &y2, &z2);\n    double dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;\n    printf("%.3f\\n", hypot(hypot(dx, dy), dz));\n    return 0;\n}\n',
      explain: '先求平面距离，再把它和 z 方向差交给第二次 hypot。'
    }
  ]);

  addBridge('01', '组合 1：复制并数长度', ['strcpy', 'strlen'], '复制输入字符串，再输出副本长度。', '一行，一个字符串。', '输出：copy=字符串 len=n', [['Mimi\n', 'copy=Mimi len=4\n'], ['C\n', 'copy=C len=1\n'], ['hello\n', 'copy=hello len=5\n'], ['cat2026\n', 'copy=cat2026 len=7\n']], ['先用 strcpy 把输入复制到 copy。', '再用 strlen(copy) 求长度。'], '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char in[100], copy[100];\n    scanf("%s", in);\n    strcpy(copy, in);\n    printf("copy=%s len=%d\\n", copy, (int)strlen(copy));\n    return 0;\n}\n', '两个函数各负责一步：先复制，后计数。');

  addBridge('02', '组合 2：拼接并数长度', ['strcat', 'strlen'], '把两个字符串拼起来并输出总长度。', '一行，两个字符串。', '输出：单词 总长度', [['mi mi\n', 'mimi 4\n'], ['cat dog\n', 'catdog 6\n'], ['C 99\n', 'C99 3\n'], ['a b\n', 'ab 2\n']], ['先做 char out[100] = "";。', 'strcat 两次，再用 strlen。'], '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char a[50], b[50], out[100] = "";\n    scanf("%s %s", a, b);\n    strcat(out, a);\n    strcat(out, b);\n    printf("%s %d\\n", out, (int)strlen(out));\n    return 0;\n}\n', '拼接会改变目标字符串，长度要在拼接后计算。');

  addBridge('03', '组合 3：比较后再看长度', ['strcmp', 'strlen'], '先判断两个字符串是否相同；不同时输出各自长度。', '一行，两个字符串。', '相同输出 SAME；不同输出 DIFF x y。', [['cat cat\n', 'SAME\n'], ['cat dog\n', 'DIFF 3 3\n'], ['hi hello\n', 'DIFF 2 5\n'], ['C C\n', 'SAME\n']], ['先用 strcmp 判断相等。', '不相等时再调用 strlen 两次。'], '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char a[100], b[100];\n    scanf("%s %s", a, b);\n    if (strcmp(a, b) == 0) printf("SAME\\n");\n    else printf("DIFF %d %d\\n", (int)strlen(a), (int)strlen(b));\n    return 0;\n}\n', '条件分支可以决定后面调用哪些函数。');

  addBridge('04', '组合 4：找到字符并大写', ['strchr', 'toupper'], '找到指定字符后把它改成大写，再输出字符串。', '一行：字符串、字符。', '输出修改后的字符串。', [['mimi m\n', 'Mimi\n'], ['cat a\n', 'cAt\n'], ['hello z\n', 'hello\n'], ['C c\n', 'C\n']], ['用 strchr 找到字符指针。', '找到后对 *p 使用 toupper。'], '#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100], ch;\n    scanf("%s %c", s, &ch);\n    char *p = strchr(s, ch);\n    if (p != NULL) *p = (char)toupper((unsigned char)*p);\n    printf("%s\\n", s);\n    return 0;\n}\n', 'strchr 定位，toupper 修改，指针把两步接起来。');

  addBridge('05', '组合 5：找到子串并复制后缀', ['strstr', 'strcpy'], '找到子串后，把从匹配处开始的后缀复制到新数组。', '一行：主字符串、子串。', '找到输出 SUF=后缀，否则输出 NOT。', [['helloworld world\n', 'SUF=world\n'], ['banana nana\n', 'SUF=nana\n'], ['abcdef gh\n', 'NOT\n'], ['Clanguage language\n', 'SUF=language\n']], ['用 strstr 找到匹配位置。', '找到后用 strcpy 把指针指向的后缀复制出来。'], '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char text[200], needle[100], out[200];\n    scanf("%s %s", text, needle);\n    char *p = strstr(text, needle);\n    if (p == NULL) printf("NOT\\n");\n    else { strcpy(out, p); printf("SUF=%s\\n", out); }\n    return 0;\n}\n', 'strstr 返回位置，strcpy 保存位置后面的字符串。');

  addBridge('06', '组合 6：字符串整数的距离', ['atoi', 'abs'], '把两个数字字符串转成整数，再输出绝对差。', '一行，两个整数字符串。', '输出：距离：d', [['10 3\n', '距离：7\n'], ['-5 5\n', '距离：10\n'], ['7 7\n', '距离：0\n'], ['100 25\n', '距离：75\n']], ['atoi 把两个字符串分别变成 int。', '再用 abs 处理差值。'], '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    char a[30], b[30];\n    scanf("%s %s", a, b);\n    printf("距离：%d\\n", abs(atoi(a) - atoi(b)));\n    return 0;\n}\n', '转换与计算可以写在同一表达式里。');

  addBridge('07', '组合 7：小数价格取整', ['atof', 'round'], '把价格字符串转成小数，再四舍五入成整数元。', '一行，一个价格字符串。', '输出整数金额。', [['12.5\n', '13\n'], ['9.4\n', '9\n'], ['0.6\n', '1\n'], ['99.1\n', '99\n']], ['atof 返回 double。', 'round 后再转 int。'], '#include <stdio.h>\n#include <stdlib.h>\n#include <math.h>\n\nint main(void) {\n    char text[50];\n    scanf("%s", text);\n    printf("%d\\n", (int)round(atof(text)));\n    return 0;\n}\n', '这一题组合了字符串解析和数值取整。');

  addBridge('08', '组合 8：只把字母变大写', ['isalpha', 'toupper'], '遍历字符串，仅对字母使用 toupper，并输出大写字母数。', '一行，一个字符串。', '输出：大写串 字母数', [['mi99mi\n', 'MI99MI 4\n'], ['cat\n', 'CAT 3\n'], ['123\n', '123 0\n'], ['AbC\n', 'ABC 3\n']], ['循环每个字符。', 'isalpha 为真时调用 toupper 并计数。'], '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    int letters = 0;\n    for (int i = 0; s[i] != \'\\0\'; i++) {\n        if (isalpha(s[i])) { s[i] = (char)toupper((unsigned char)s[i]); letters++; }\n    }\n    printf("%s %d\\n", s, letters);\n    return 0;\n}\n', '分类函数负责判断，转换函数负责修改。');

  addBridge('09', '组合 9：数字字符串翻倍', ['isdigit', 'atoi'], '先检查字符串是否全是数字，是则用 atoi 转成整数并输出两倍。', '一行，一个非空字符串。', '全数字输出两倍，否则输出 ERROR。', [['21\n', '42\n'], ['005\n', '10\n'], ['2a\n', 'ERROR\n'], ['-3\n', 'ERROR\n']], ['循环用 isdigit 检查每个字符。', '全部通过后再 atoi。'], '#include <stdio.h>\n#include <ctype.h>\n#include <stdlib.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    int ok = 1;\n    for (int i = 0; s[i] != \'\\0\'; i++) if (!isdigit(s[i])) { ok = 0; break; }\n    if (ok) printf("%d\\n", atoi(s) * 2);\n    else printf("ERROR\\n");\n    return 0;\n}\n', '先验证再转换，比直接 atoi 更安全。');

  addBridge('10', '组合 10：坐标距离', ['pow', 'sqrt'], '用 pow 求平方，再用 sqrt 求两点距离。', '一行，四个实数 x1 y1 x2 y2。', '输出距离，保留三位小数。', [['0 0 3 4\n', '5.000\n'], ['1 1 4 5\n', '5.000\n'], ['-1 -1 2 3\n', '5.000\n'], ['2 2 2 2\n', '0.000\n']], ['dx 和 dy 分别求差。', 'sqrt(pow(dx,2) + pow(dy,2))。'], '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double x1, y1, x2, y2;\n    scanf("%lf %lf %lf %lf", &x1, &y1, &x2, &y2);\n    double dx = x2 - x1, dy = y2 - y1;\n    printf("%.3f\\n", sqrt(pow(dx, 2) + pow(dy, 2)));\n    return 0;\n}\n', 'pow 和 sqrt 组合就是距离公式。');

  addBridge('11', '组合 11：把数值夹在范围内', ['fmax', 'fmin'], '把 value 限制在 [lo, hi] 范围内。', '一行，三个实数 value lo hi。', '输出夹紧后的值，保留两位小数。', [['5 1 10\n', '5.00\n'], ['-2 0 10\n', '0.00\n'], ['15 0 10\n', '10.00\n'], ['10 0 10\n', '10.00\n']], ['先用 fmax(value, lo) 抬到下限。', '再用 fmin(..., hi) 压到上限。'], '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double value, lo, hi;\n    scanf("%lf %lf %lf", &value, &lo, &hi);\n    printf("%.2f\\n", fmin(fmax(value, lo), hi));\n    return 0;\n}\n', '嵌套 fmax/fmin 是范围限制的常见写法。');

  addBridge('12', '组合 12：四位数字口令', ['strlen', 'isdigit'], '检查字符串长度是否为 4，且四个字符全是数字。', '一行，一个字符串。', '合法输出 VALID，否则输出 INVALID。', [['1234\n', 'VALID\n'], ['123\n', 'INVALID\n'], ['12a4\n', 'INVALID\n'], ['0000\n', 'VALID\n']], ['先用 strlen 检查长度是否等于 4。', '再循环用 isdigit 检查每个字符。'], '#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    int ok = (int)strlen(s) == 4;\n    for (int i = 0; ok && s[i] != \'\\0\'; i++) if (!isdigit(s[i])) ok = 0;\n    printf(ok ? "VALID\\n" : "INVALID\\n");\n    return 0;\n}\n', '长度和字符类型是两种不同校验，需要组合起来。');

  CC.CODE_DRILLS = (CC.CODE_DRILLS || []).concat(tasks);
})(typeof globalThis !== 'undefined' ? globalThis : this);
