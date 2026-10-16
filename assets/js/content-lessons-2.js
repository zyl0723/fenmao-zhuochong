/*!
 * 粉猫捉虫 · 课程内容（第 5 ~ 8 课）
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var LESSONS = CC.LESSONS || (CC.LESSONS = []);

  LESSONS.push({
    id: 'L5',
    title: '第 5 课 · 键盘输入 scanf',
    subtitle: '让程序听你说话：把数据读进来',
    minutes: 18,
    goals: ['会用 scanf 读取整数、小数、字符、字符串', '明白为什么必须写 &', '会看「输入」和「格式」是否匹配', '知道 %c 会读走换行符这个坑'],
    sections: [
      { type: 'text', h: '一、只会打印的程序是死的', p: [
        '前四课的程序，结果都是写死在代码里的。真正有用的程序要能接受你输入的数据：输入两个数，算出它们的和；输入身高体重，算出 BMI。',
        '在 C 语言里，从键盘读数据最常用的函数是 scanf。它和 printf 是一对好搭档：printf 往外写，scanf 往里读。'
      ]},
      { type: 'code', title: '读两个整数，算它们的和', code: String.raw`#include <stdio.h>

int main() {
    int a, b;                 // 准备好两个盒子，先不装东西

    scanf("%d %d", &a, &b);   // 从键盘读两个整数，装进 a 和 b

    printf("%d + %d = %d\n", a, b, a + b);
    return 0;
}`,
        explain: [
          ['scanf("%d %d", …)', '双引号里写「我要读什么」，%d 表示一个整数。'],
          ['&a、&b', '& 是「取地址」。scanf 要知道盒子在内存里的位置，才能把读到的数字放进去。'],
          ['为什么 printf 不用 &', 'printf 只是把变量的「值」拿出来看；scanf 要往盒子里「放东西」，所以必须知道盒子在哪。'],
          ['输入要自己准备', '运行前要在下面的「程序输入」里填好数据，例如 3 4。']
        ]},
      { type: 'table', title: '常用的读取格式', head: ['格式', '读什么', '写法示例'], rows: [
        ['%d', '整数', 'int n; scanf("%d", &n);'],
        ['%lf', '小数（double 专用）', 'double x; scanf("%lf", &x);'],
        ['%c', '一个字符（含空格、换行）', 'char c; scanf("%c", &c);'],
        ['%s', '一串不带空格的文字', 'char s[20]; scanf("%s", s);'],
        ['%f', 'float 用的小数', 'float x; scanf("%f", &x);']
      ], note: 'double 一定要用 %lf 读、用 %f 或 %lf 打印（用 %f 打印也没问题）。读字符串时数组名本身就是地址，不用再加 &。'},
      { type: 'mistakes', title: 'scanf 的经典坑', items: [
        { bad: '忘记写 &，例如 scanf("%d", n);', why: '程序会往一个莫名其妙的地方写数据，直接崩溃或乱跑', fix: '记住：读进变量要写 &变量名' },
        { bad: '%d 却输入了字母', why: 'scanf 读不到整数，就会失败（返回 0），后面的变量还是垃圾值', fix: '检查输入内容；真实项目里还要检查 scanf 的返回值' },
        { bad: '先用 %d 读了数字，再用 %c 读字符', why: '上一次输入留下的换行符会被 %c 读走', fix: '在 %c 前加一个空格：scanf(" %c", &c);' },
        { bad: '读字符串时数组太小', why: '输入太长会写超出去，覆盖别的内存', fix: '数组开大一点，并在 %s 里限制长度：scanf("%19s", s);' }
      ]},
      { type: 'tip', text: '每道题的「程序输入」框里填的内容，就是程序运行时会「敲键盘」输入的东西。运行前先看清楚题目要求输入什么。' }
    ],
    tasks: [
      {
        id: 'L5-T1',
        title: '任务 1：计算两数之和',
        brief: '程序输入是 3 4。请读出两个整数并打印出：\n3 + 4 = 7\n（提示：要打印出实际的数字，而不是把 3、4 写死）',
        starter: String.raw`#include <stdio.h>

int main() {
    int a, b;

    // 用 scanf 读入两个整数

    // 打印 a + b 的结果

    return 0;
}`,
        hints: ['scanf("%d %d", &a, &b);', 'printf("%d + %d = %d\\n", a, b, a + b);'],
        mustInclude: [{ re: /scanf\s*\(/, label: 'scanf 函数', hint: '这道题要用 scanf 读取输入。' }],
        tests: [{ name: '输入 3 4', stdin: '3 4', expect: '3 + 4 = 7' }, { name: '输入 100 250', stdin: '100 250', expect: '100 + 250 = 350' }],
        reward: { fish: 5, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    int a, b;

    scanf("%d %d", &a, &b);

    printf("%d + %d = %d\n", a, b, a + b);
    return 0;
}`
      },
      {
        id: 'L5-T2',
        title: '任务 2：圆的面积',
        brief: '输入一个半径（小数），计算圆的面积并保留 2 位小数。\n输入 2 时输出：半径 2.0 的圆面积是 12.57\n（圆周率用 3.14159）',
        starter: String.raw`#include <stdio.h>

int main() {
    double r;

    scanf("%lf", &r);

    // 面积 = 3.14159 * r * r

    return 0;
}`,
        hints: ['面积存到 double 里：double s = 3.14159 * r * r;', '打印用 %.2f 保留两位小数。'],
        tests: [{ name: '半径 2', stdin: '2', expect: '半径 2.0 的圆面积是 12.57' }],
        reward: { fish: 6, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    double r;
    scanf("%lf", &r);

    double s = 3.14159 * r * r;
    printf("半径 %.1f 的圆面积是 %.2f\n", r, s);
    return 0;
}`
      },
      {
        id: 'L5-T3',
        title: '任务 3：问名字',
        brief: '读入一个名字（不含空格），打印问候。\n输入 小粉猫 时输出：你好，小粉猫！',
        starter: String.raw`#include <stdio.h>

int main() {
    char name[20];

    // 用 scanf 读入字符串

    return 0;
}`,
        hints: ['读字符串：scanf("%s", name); —— 这里不需要写 &。', '打印：printf("你好，%s！\\n", name);'],
        tests: [{ name: '输入 小粉猫', stdin: '小粉猫', expect: '你好，小粉猫！' }],
        reward: { fish: 5, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    char name[20];
    scanf("%s", name);
    printf("你好，%s！\n", name);
    return 0;
}`
      },
      {
        id: 'L5-T4',
        title: '挑战：三个数的平均分',
        brief: '输入三个整数（用空格分开），输出保留 2 位小数的平均值。\n输入 80 90 70 时输出：平均分是 80.00',
        starter: String.raw`#include <stdio.h>

int main() {

    return 0;
}`,
        hints: ['三个整数相加后除以 3.0，才能得到小数。', '%.2f 保留两位小数。'],
        tests: [{ name: '输入 80 90 70', stdin: '80 90 70', expect: '平均分是 80.00' }],
        reward: { fish: 7, xp: 35 },
        solution: String.raw`#include <stdio.h>

int main() {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);

    double avg = (a + b + c) / 3.0;
    printf("平均分是 %.2f\n", avg);
    return 0;
}`
      }
    ]
  });

  LESSONS.push({
    id: 'L6',
    title: '第 6 课 · 运算符与优先级',
    subtitle: '表达式是怎么算出来的',
    minutes: 20,
    goals: ['分清算术、关系、逻辑、赋值运算符', '会用 && || ! 组合条件', '理解优先级和括号', '知道自增自减的区别'],
    sections: [
      { type: 'table', title: '常用运算符分类', head: ['类别', '运算符', '说明'], rows: [
        ['算术', '+ - * / %', '% 是取余，只能用于整数'],
        ['关系', '> < >= <= == !=', '结果是 1（真）或 0（假）'],
        ['逻辑', '&& || !', '&& 全真才真，|| 一个真就真，! 取反'],
        ['赋值', '= += -= *= /= %=', 'a += 3 就是 a = a + 3'],
        ['自增自减', '++ --', 'i++ 先用再加，++i 先加再用'],
        ['位运算', '& | ^ ~ << >>', '按二进制位操作，进阶内容']
      ]},
      { type: 'text', h: '一、关系运算的结果是数字', p: [
        '在 C 语言里没有专门的「真/假」类型：比较成立得到 1，不成立得到 0。所以你完全可以打印出来看。',
        '反过来，任何非 0 的数字在条件里都算「真」，0 算「假」。这就是为什么 while (1) 是「永远成立」。'
      ]},
      { type: 'code', title: '逻辑运算与短路', code: String.raw`int age = 18;
int score = 95;

printf("%d\n", age >= 18);            // 1
printf("%d\n", score > 90 && age >= 18);  // 1  两个条件都成立
printf("%d\n", score > 90 || age > 60);   // 1  至少一个成立
printf("%d\n", !(score > 90));        // 0  取反

// 短路：&& 左边的条件不成立时，右边根本不会被计算
int b = 0;
if (b != 0 && 10 / b > 1) {
    printf("不会执行到这里，也不会除以 0 崩溃\n");
}`,
        explain: [
          ['&& 全真才真', '需要同时满足多个条件时用它。'],
          ['|| 一个真就真', '满足任意一个就行时用它。'],
          ['短路求值', '这是个很有用的特性，可以用来避免除以 0、避免访问越界。'],
          ['优先级', '! 高，然后算术、关系、&&、||、赋值最低。记不住就加括号——括号不花钱，错误很贵。']
        ]},
      { type: 'text', h: '二、优先级速查（从高到低）', p: [
        '① 括号 ( ) → ② 单目 ! ++ -- (类型) sizeof → ③ 乘除取余 * / % → ④ 加减 + - → ⑤ 比较大小 < > <= >= → ⑥ 相等 == != → ⑦ && → ⑧ || → ⑨ 赋值 = += -= …',
        '最常见的坑：a < b == c 的写法。想清楚时，一律加上括号，写成 (a < b) == c。'
      ]},
      { type: 'mistakes', title: '常见错误', items: [
        { bad: '把 = 当成 ==', why: 'if (x = 5) 是把 5 赋给 x，然后 5 为真，条件永远成立', fix: '比较相等必须写两个等号 ==' },
        { bad: '&& 写成 &', why: '& 是按位与，会把两个数的二进制位对齐了算，不是「并且」', fix: '条件里用 &&、||' },
        { bad: '整数除法的结果不符合预期', why: '3 / 4 得到 0，不是 0.75', fix: '写成 3.0 / 4 或 (double)3 / 4' },
        { bad: 'i++ 和 ++i 混用导致结果差 1', why: '一个先取值再自增，一个先自增再取值', fix: '单独一行写 i++; 最不容易出错' }
      ]}
    ],
    tasks: [
      {
        id: 'L6-T1',
        title: '任务 1：判断闰年',
        brief: '闰年的规则：能被 4 整除，但不能被 100 整除；或者能被 400 整除。\n已知 year = 2024，请判断并输出：\n2024 是闰年',
        starter: String.raw`#include <stdio.h>

int main() {
    int year = 2024;

    // 条件：year % 4 == 0 && year % 100 != 0 || year % 400 == 0

    return 0;
}`,
        hints: ['用 if … else 输出两种结果。', '| 和 || 用途不同：逻辑或用 ||，位或才用 |。'],
        mustInclude: [{ re: /&&/, label: '逻辑与 &&' }, { re: /\|\|/, label: '逻辑或 ||' }],
        tests: [{ name: '2024 是闰年', expect: '2024 是闰年' }],
        reward: { fish: 6, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    int year = 2024;

    if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {
        printf("%d 是闰年\n", year);
    } else {
        printf("%d 不是闰年\n", year);
    }
    return 0;
}`
      },
      {
        id: 'L6-T2',
        title: '任务 2：用复合赋值求和',
        brief: '用 for 循环和 += 运算符，求出 1 + 2 + … + 10，并输出：\nsum = 55',
        starter: String.raw`#include <stdio.h>

int main() {
    int sum = 0;

    // 循环里用 sum += i;

    return 0;
}`,
        hints: ['for (int i = 1; i <= 10; i++) { sum += i; }', '输出格式：printf("sum = %d\\n", sum);'],
        mustInclude: [{ re: /\+=/, label: '复合赋值运算符 +=', hint: '这道题要求用 sum += i; 这种写法。' }],
        tests: [{ name: '求和结果正确', expect: 'sum = 55' }],
        reward: { fish: 5, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    int sum = 0;

    for (int i = 1; i <= 10; i++) {
        sum += i;
    }

    printf("sum = %d\n", sum);
    return 0;
}`
      },
      {
        id: 'L6-T3',
        title: '任务 3：看看位运算的样子',
        brief: '已知 a = 6，打印下面三个结果（用空格分开，一行）：\na & 3、a | 1、a << 1\n即输出：2 7 12',
        starter: String.raw`#include <stdio.h>

int main() {
    int a = 6;

    // 依次打印 a & 3、a | 1、a << 1

    return 0;
}`,
        hints: ['6 的二进制是 110，3 是 011，按位与得到 010（也就是 2）。', '左移一位相当于乘 2。'],
        tests: [{ name: '三个结果正确', expect: '2 7 12' }],
        reward: { fish: 6, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    int a = 6;

    printf("%d %d %d\n", a & 3, a | 1, a << 1);
    return 0;
}`
      }
    ]
  });

  LESSONS.push({
    id: 'L7',
    title: '第 7 课 · 条件判断 if',
    subtitle: '让程序会思考、会做选择',
    minutes: 18,
    goals: ['会写 if / else if / else', '会组合多个条件', '会把大问题拆成几种情况', '避开 if 的经典错误'],
    sections: [
      { type: 'text', h: '一、if 的形状', p: [
        'if 的意思是：如果括号里的条件成立（不是 0），就执行花括号里的代码；否则跳过。',
        '想处理「否则」的情况，就用 else；想处理多种情况，就用 else if 串成一条链。'
      ]},
      { type: 'code', title: '三种常见形状', code: String.raw`// 形状一：只有一种情况
if (score >= 60) {
    printf("及格\n");
}

// 形状二：两种情况
if (score >= 60) {
    printf("及格\n");
} else {
    printf("不及格\n");
}

// 形状三：多种情况（从上往下一个个试，命中一个就不再往下判断）
if (score >= 90) {
    printf("优秀\n");
} else if (score >= 80) {
    printf("良好\n");
} else if (score >= 60) {
    printf("及格\n");
} else {
    printf("要继续加油\n");
}`,
        explain: [
          ['条件的写法', 'score >= 60 就是一个条件，结果是 1 或 0。'],
          ['花括号可以省，但别省', '只有一条语句时花括号可以省略，但很容易出错，建议一律写上。'],
          ['顺序很重要', 'else if 是「从上往下」判断的。所以要把最严格的条件放前面：先 90 分，再 80 分，最后 60 分。'],
          ['嵌套', 'if 里面还可以再写 if，但层次别太深，超过 3 层就该考虑换个写法了。']
        ]},
      { type: 'mistakes', title: 'if 的三个经典错误', items: [
        { bad: 'if (x = 0)', why: '这是赋值：先把 0 装进 x，然后 0 为假，条件永远不成立', fix: '判断相等要写 if (x == 0)' },
        { bad: 'if (x > 0);', why: '分号让 if 的作用到此结束，后面的大括号变成了「总会执行」', fix: '删掉 if 条件后面多余的分号' },
        { bad: '比较两个小数是否相等', why: '小数在计算机里是近似的，0.1 + 0.2 并不精确等于 0.3', fix: '判断 |a - b| < 0.000001 这类写法' }
      ]},
      { type: 'tip', text: '写条件时先读一遍中文：「如果 分数 大于等于 60，就……」。把中文想清楚了，代码基本就写对了。' }
    ],
    tasks: [
      {
        id: 'L7-T1',
        title: '任务 1：成绩等级',
        brief: '已知 score = 75，按规则输出等级：\n90 及以上：优秀\n60 ~ 89：及格\n60 以下：不及格\n（本题输出应该是：及格）',
        starter: String.raw`#include <stdio.h>

int main() {
    int score = 75;

    // 用 if / else if / else

    return 0;
}`,
        hints: ['先判断 score >= 90，再判断 score >= 60。', '想想为什么 score >= 60 要放在 else if 里，而不是单独再写一个 if。'],
        mustInclude: [{ re: /else\s+if/, label: 'else if 分支', hint: '这道题要求用 else if 写多分支。' }],
        tests: [{ name: '等级判断正确', expect: '及格' }],
        reward: { fish: 5, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    int score = 75;

    if (score >= 90) {
        printf("优秀\n");
    } else if (score >= 60) {
        printf("及格\n");
    } else {
        printf("不及格\n");
    }
    return 0;
}`
      },
      {
        id: 'L7-T2',
        title: '任务 2：找出最大的数',
        brief: '已知 a = 12，b = 45，c = 7，用 if 比较找出最大值并输出：\n最大值是 45',
        starter: String.raw`#include <stdio.h>

int main() {
    int a = 12, b = 45, c = 7;

    // 先假设 a 最大，再去和 b、c 比较

    return 0;
}`,
        hints: ['可以这样想：max = a; 如果 b 比 max 大，max = b; 如果 c 比 max 大，max = c;'],
        mustInclude: [{ re: /if\s*\(/, label: 'if 判断', hint: '这道题要求用 if 来比较大小。' }],
        tests: [{ name: '最大值正确', expect: '最大值是 45' }],
        reward: { fish: 6, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    int a = 12, b = 45, c = 7;
    int max = a;

    if (b > max) {
        max = b;
    }
    if (c > max) {
        max = c;
    }

    printf("最大值是 %d\n", max);
    return 0;
}`
      },
      {
        id: 'L7-T3',
        title: '任务 3：能被 3 和 5 同时整除吗',
        brief: '输入一个整数，判断它能不能被 3 和 5 同时整除（也就是能被 15 整除）。\n输入 45 时输出：45 能被 3 和 5 同时整除\n输入 20 时输出：20 不能被 3 和 5 同时整除',
        starter: String.raw`#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);

    // 提示：用 % 判断余数是不是 0

    return 0;
}`,
        hints: ['n % 3 == 0 && n % 5 == 0 表示两个条件同时成立。', '两个分支的文案都要和题目一模一样。'],
        tests: [
          { name: '输入 45', stdin: '45', expect: '45 能被 3 和 5 同时整除' },
          { name: '输入 20', stdin: '20', expect: '20 不能被 3 和 5 同时整除' }
        ],
        reward: { fish: 7, xp: 35 },
        solution: String.raw`#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);

    if (n % 3 == 0 && n % 5 == 0) {
        printf("%d 能被 3 和 5 同时整除\n", n);
    } else {
        printf("%d 不能被 3 和 5 同时整除\n", n);
    }
    return 0;
}`
      }
    ]
  });

  LESSONS.push({
    id: 'L8',
    title: '第 8 课 · 多分支 switch',
    subtitle: '当一个值有很多种情况时',
    minutes: 15,
    goals: ['会写 switch / case / default', '知道 break 的作用', '理解「穿透」这个特性', '知道什么时候该用 switch、什么时候用 if'],
    sections: [
      { type: 'text', h: '一、switch 的形状', p: [
        '当你要「根据某个整数或字符的值，分成几种情况」时，用 switch 比一串 else if 更清楚。',
        'switch 后面的括号里放要判断的值，花括号里列出一个个 case（情况）。每个 case 后面跟一个常量（比如 1、\'A\'、10），用冒号结尾。',
        '每个 case 处理完，通常要写一句 break; 表示「到此为止，跳出 switch」。'
      ]},
      { type: 'code', title: '判断星期几', code: String.raw`int day = 3;

switch (day) {
    case 1:
        printf("星期一\n");
        break;
    case 2:
        printf("星期二\n");
        break;
    case 3:
        printf("星期三\n");
        break;
    default:                 // 上面都没命中时走这里
        printf("不是 1~3 里的日子\n");
        break;
}`,
        explain: [
          ['switch (day)', '括号里是要比较的值，必须是整数或字符（不能是字符串、小数）。'],
          ['case 3:', '如果 day 等于 3，就从这一行开始往下执行。'],
          ['break;', '执行到这里就跳出整个 switch。少写 break 会「穿透」到下一个 case。'],
          ['default:', '兜底分支，相当于 else，可以放在任意位置（一般放最后）。'],
          ['穿透有用', '多个 case 共用一段代码时很有用，例如 case 10: case 9: printf("优秀");。']
        ]},
      { type: 'table', title: 'switch 还是 if？', head: ['场景', '推荐'], rows: [
        ['一个整数/字符有 3 种以上固定取值', 'switch'],
        ['判断范围（大于、小于）', 'if'],
        ['条件是复杂的逻辑组合', 'if'],
        ['多个 case 共用同一个处理', 'switch（利用穿透）']
      ]},
      { type: 'mistakes', title: '常见错误', items: [
        { bad: '忘记 break', why: '会一路穿透下去，把后面的 case 也执行了', fix: '每个 case 处理完加 break;' },
        { bad: 'case 里写变量', why: 'case 后面必须是编译期就能确定的常量', fix: '写常量，比如 case 1:、case \'A\':；用变量就换成 if' },
        { bad: 'switch 后面写了小数或字符串', why: 'switch 只能用于整数和字符', fix: '换成 if / else if' }
      ]}
    ],
    tasks: [
      {
        id: 'L8-T1',
        title: '任务 1：今天是星期几',
        brief: '输入一个 1~7 的整数，输出对应的中文星期。\n输入 3 时输出：星期三\n输入 7 时输出：星期日\n输入 9 时输出：输入有误',
        starter: String.raw`#include <stdio.h>

int main() {
    int day;
    scanf("%d", &day);

    switch (day) {
        // 补全 case

    }
    return 0;
}`,
        hints: ['七个 case 加一个 default。', '注意每个 case 都以冒号结尾，处理完要 break;'],
        mustInclude: [{ re: /switch\s*\(/, label: 'switch 语句' }, { re: /default\s*:/, label: 'default 分支' }],
        tests: [
          { name: '输入 3', stdin: '3', expect: '星期三' },
          { name: '输入 7', stdin: '7', expect: '星期日' },
          { name: '输入 9', stdin: '9', expect: '输入有误' }
        ],
        reward: { fish: 7, xp: 35 },
        solution: String.raw`#include <stdio.h>

int main() {
    int day;
    scanf("%d", &day);

    switch (day) {
        case 1: printf("星期一\n"); break;
        case 2: printf("星期二\n"); break;
        case 3: printf("星期三\n"); break;
        case 4: printf("星期四\n"); break;
        case 5: printf("星期五\n"); break;
        case 6: printf("星期六\n"); break;
        case 7: printf("星期日\n"); break;
        default: printf("输入有误\n"); break;
    }
    return 0;
}`
      },
      {
        id: 'L8-T2',
        title: '任务 2：迷你计算器',
        brief: '输入一个算式，格式是「数字 运算符 数字」，例如 6 * 7。\n请用 switch 判断运算符，输出：6 * 7 = 42\n支持 + - * / 四种运算；除以 0 时输出：不能除以 0',
        starter: String.raw`#include <stdio.h>

int main() {
    int a, b;
    char op;
    scanf("%d %c %d", &a, &op, &b);

    // 用 switch (op) 处理四种运算

    return 0;
}`,
        hints: ['case \'+\': printf("%d + %d = %d\\n", a, b, a + b); break;', '除法要先判断 b 是不是 0。'],
        mustInclude: [{ re: /switch\s*\(\s*op\s*\)/, label: 'switch (op)' }],
        tests: [
          { name: '6 * 7', stdin: '6 * 7', expect: '6 * 7 = 42' },
          { name: '9 - 4', stdin: '9 - 4', expect: '9 - 4 = 5' },
          { name: '8 / 0', stdin: '8 / 0', expect: '不能除以 0' }
        ],
        reward: { fish: 8, xp: 40 },
        solution: String.raw`#include <stdio.h>

int main() {
    int a, b;
    char op;
    scanf("%d %c %d", &a, &op, &b);

    switch (op) {
        case '+':
            printf("%d + %d = %d\n", a, b, a + b);
            break;
        case '-':
            printf("%d - %d = %d\n", a, b, a - b);
            break;
        case '*':
            printf("%d * %d = %d\n", a, b, a * b);
            break;
        case '/':
            if (b == 0) {
                printf("不能除以 0\n");
            } else {
                printf("%d / %d = %d\n", a, b, a / b);
            }
            break;
        default:
            printf("不支持的运算符\n");
            break;
    }
    return 0;
}`
      },
      {
        id: 'L8-T3',
        title: '任务 3：用穿透简化分支',
        brief: '输入一个分数（0~100），用 switch (score / 10) 输出等级：\n90~100：优秀　70~89：良好　60~69：及格　其他：不及格\n输入 88 时输出：良好',
        starter: String.raw`#include <stdio.h>

int main() {
    int score;
    scanf("%d", &score);

    // 提示：case 10 和 case 9 可以共用一段代码（不写 break 就是穿透）

    return 0;
}`,
        hints: ['case 10: case 9: printf("优秀\\n"); break;', '80、70 各自一段，6 一段，default 一段。'],
        tests: [
          { name: '输入 88', stdin: '88', expect: '良好' },
          { name: '输入 100', stdin: '100', expect: '优秀' },
          { name: '输入 45', stdin: '45', expect: '不及格' }
        ],
        reward: { fish: 8, xp: 40 },
        solution: String.raw`#include <stdio.h>

int main() {
    int score;
    scanf("%d", &score);

    switch (score / 10) {
        case 10:
        case 9:
            printf("优秀\n");
            break;
        case 8:
        case 7:
            printf("良好\n");
            break;
        case 6:
            printf("及格\n");
            break;
        default:
            printf("不及格\n");
            break;
    }
    return 0;
}`
      }
    ]
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);