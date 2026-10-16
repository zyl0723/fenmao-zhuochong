/*!
 * 粉猫捉虫 · 课程内容（第 9 ~ 12 课）
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var LESSONS = CC.LESSONS || (CC.LESSONS = []);

  LESSONS.push({
    id: 'L9',
    title: '第 9 课 · 循环 while',
    subtitle: '重复的事，让电脑去做',
    minutes: 18,
    goals: ['会写 while 和 do-while', '知道循环的三要素', '能识别并避免死循环', '会边循环边计算'],
    sections: [
      { type: 'text', h: '一、循环的三要素', p: [
        '写循环前先在心里回答三个问题：① 从哪儿开始（初始值）；② 什么时候继续（条件）；③ 每一轮之后怎么变（更新）。',
        '这三件事少一件，循环要么不执行，要么永远停不下来。'
      ]},
      { type: 'code', title: 'while 和 do-while', code: String.raw`// while：先判断条件，条件成立才进循环体
int i = 1;                  // ① 初始值
while (i <= 5) {            // ② 条件
    printf("%d ", i);
    i++;                    // ③ 更新（千万别忘！）
}
printf("\n");               // 输出：1 2 3 4 5

// do-while：先做一次，再判断（至少执行一次）
int n = 10;
do {
    printf("至少会执行一次\n");
    n++;
} while (n < 5);            // 注意结尾的分号`,
        explain: [
          ['while 的括号里写条件', '条件为真（非 0）就再执行一遍循环体。'],
          ['循环体要用花括号包起来', '只有一条语句时可以不写，但强烈建议写上。'],
          ['do-while 的区别', '先执行一次再判断，适合「至少要读一次输入」这种场景。'],
          ['结尾的分号', 'do { … } while (条件); 最后这个分号很容易忘。']
        ]},
      { type: 'text', h: '二、死循环：让它停不下来的原因', p: [
        '如果条件永远成立，循环就会一直跑下去。写完循环后，习惯性地问自己一句：循环变量会变吗？最终会让条件不成立吗？',
        '有时候死循环是故意的，例如 while (1) 表示「一直循环」，这时必须靠 break 跳出来。'
      ]},
      { type: 'code', title: '提前跳出：break', code: String.raw`int i = 1;
while (1) {                 // 故意写成死循环
    if (i > 5) {
        break;              // 条件满足就跳出去
    }
    printf("%d ", i);
    i++;
}` },
      { type: 'mistakes', title: '常见错误', items: [
        { bad: '忘了让循环变量变化', why: '条件永远成立 → 死循环，页面会提示你', fix: '在循环体里写 i++ 或类似更新' },
        { bad: '条件写成 i = 5', why: '这是赋值，结果永远是 5（真），无限循环', fix: '比较用 ==，或者直接写 i <= 5 这样的范围判断' },
        { bad: '循环多跑或少跑一次', why: '把 i < 5 写成 i <= 5 会多一次', fix: '拿纸笔数一数第一轮、最后一轮的值' },
        { bad: 'do-while 结尾漏了分号', why: '语法错误', fix: '} while (条件); ← 别忘了分号' }
      ]}
    ],
    tasks: [
      {
        id: 'L9-T1',
        title: '任务 1：1 加到 100',
        brief: '用 while 循环求 1 + 2 + … + 100，输出：\n1 到 100 的和是 5050',
        starter: String.raw`#include <stdio.h>

int main() {
    int i = 1;
    int sum = 0;

    while (i <= 100) {
        // 把 i 加到 sum 上，然后让 i 变大

    }

    return 0;
}`,
        hints: ['循环体里写 sum += i; 和 i++;', '打印：printf("1 到 100 的和是 %d\\n", sum);'],
        mustInclude: [{ re: /while\s*\(/, label: 'while 循环', hint: '这道题要求用 while 写循环。' }],
        tests: [{ name: '求和正确', expect: '1 到 100 的和是 5050' }],
        reward: { fish: 6, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    int i = 1;
    int sum = 0;

    while (i <= 100) {
        sum += i;
        i++;
    }

    printf("1 到 100 的和是 %d\n", sum);
    return 0;
}`
      },
      {
        id: 'L9-T2',
        title: '任务 2：数位求和',
        brief: '输入一个正整数，求它每一位数字之和。\n输入 1234 时输出：1234 的各位数字之和是 10\n（因为 1+2+3+4 = 10）',
        starter: String.raw`#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);

    int sum = 0;
    // 提示：n % 10 拿到最后一位，n / 10 去掉最后一位
    // 循环条件：n > 0

    return 0;
}`,
        hints: ['while (n > 0) { sum += n % 10; n /= 10; }', '注意别忘了保存原始的数字用于打印（先存一份 int original = n;）。'],
        tests: [
          { name: '输入 1234', stdin: '1234', expect: '1234 的各位数字之和是 10' },
          { name: '输入 9999', stdin: '9999', expect: '9999 的各位数字之和是 36' }
        ],
        reward: { fish: 7, xp: 35 },
        solution: String.raw`#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);

    int original = n;
    int sum = 0;

    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }

    printf("%d 的各位数字之和是 %d\n", original, sum);
    return 0;
}`
      },
      {
        id: 'L9-T3',
        title: '任务 3：读到 0 为止（do-while 登场）',
        brief: '不断读入整数，直到读到 0 才停止（0 不算进去）。\n最后输出：一共读了 3 个数，和是 15\n（例如输入 3 5 7 0 时就是 3 个数，和为 15）',
        starter: String.raw`#include <stdio.h>

int main() {
    int x;
    int count = 0, sum = 0;

    do {
        scanf("%d", &x);
        // 如果不是 0，就计数并累加
    } while (x != 0);

    return 0;
}`,
        hints: ['循环体里写：if (x != 0) { count++; sum += x; }', 'do-while 的结尾 } while (x != 0); 别忘了分号。'],
        mustInclude: [{ re: /do\s*\{/, label: 'do { … } while', hint: '这道题要求用 do-while 循环。' }],
        tests: [{ name: '输入 3 5 7 0', stdin: '3 5 7 0', expect: '一共读了 3 个数，和是 15' }],
        reward: { fish: 7, xp: 35 },
        solution: String.raw`#include <stdio.h>

int main() {
    int x;
    int count = 0, sum = 0;

    do {
        scanf("%d", &x);
        if (x != 0) {
            count++;
            sum += x;
        }
    } while (x != 0);

    printf("一共读了 %d 个数，和是 %d\n", count, sum);
    return 0;
}`
      },
      {
        id: 'L9-T4',
        title: '挑战：倒计时',
        brief: '用 while 打印倒计时，格式完全一致（共 6 行）：\n5\n4\n3\n2\n1\n发射！',
        starter: String.raw`#include <stdio.h>

int main() {
    int i = 5;

    while (i >= 1) {
        // 打印 i

    }
    return 0;
}`,
        hints: ['循环结束后再打印「发射！」。', '别忘 i--，否则会倒计时一万年。'],
        tests: [{ name: '倒计时正确', expect: '5\n4\n3\n2\n1\n发射！' }],
        reward: { fish: 7, xp: 35 },
        solution: String.raw`#include <stdio.h>

int main() {
    int i = 5;

    while (i >= 1) {
        printf("%d\n", i);
        i--;
    }
    printf("发射！\n");
    return 0;
}`
      }
    ]
  });

  LESSONS.push({
    id: 'L10',
    title: '第 10 课 · for 循环与嵌套',
    subtitle: '写循环的标准姿势，顺便画出图形',
    minutes: 20,
    goals: ['会用 for 写计数循环', '会用 break / continue 控制流程', '会写嵌套循环', '能读懂双层循环的执行顺序'],
    sections: [
      { type: 'text', h: '一、for：把三要素写在一行', p: [
        'for 循环把「初始值、条件、更新」三件事塞进了同一行的括号里，中间用分号隔开。',
        '因为它把三要素都摆在眼前，所以不容易漏掉更新，是计数循环最常用的写法。'
      ]},
      { type: 'code', title: 'for 的结构', code: String.raw`//  for (初始化; 条件; 每轮之后要做的事)
for (int i = 1; i <= 5; i++) {
    printf("%d ", i);
}
printf("\n");

// 等价的 while 写法，对比一下就更清楚了
int i = 1;
while (i <= 5) {
    printf("%d ", i);
    i++;
}

// 倒着数
for (int j = 5; j >= 1; j--) {
    printf("%d ", j);
}`,
        explain: [
          ['初始化', '只在循环开始前执行一次，例如 int i = 1。'],
          ['条件', '每一轮开始前检查，为真才执行循环体。'],
          ['更新', '每一轮结束之后执行，例如 i++。'],
          ['循环变量可以就地声明', 'for (int i = 0; …) 里的 i 只在循环里有效，出了循环就没了。']
        ]},
      { type: 'text', h: '二、break 和 continue 的区别', p: [
        'break 是「不干了」，直接跳出整个循环；continue 是「这一轮到此为止」，马上进入下一轮。',
        '在嵌套循环里，break 只会跳出它所在的那一层循环。'
      ]},
      { type: 'code', title: '嵌套循环：把执行顺序读明白', code: String.raw`for (int i = 1; i <= 3; i++) {       // 外层：跑 3 轮
    for (int j = 1; j <= 2; j++) {   // 内层：每一轮外层的循环体里跑 2 轮
        printf("i=%d j=%d\n", i, j);
    }
}

// 输出：
// i=1 j=1
// i=1 j=2
// i=2 j=1
// i=2 j=2
// i=3 j=1
// i=3 j=2`,
        explain: [
          ['外层走一步，内层走一圈', '外层 i=1 时，内层 j 从 1 到 2 全部走一遍；然后 i 变成 2，内层再从头走一遍。'],
          ['总共执行次数', '外层次数 × 内层次数，例如 3 × 2 = 6 次。'],
          ['用嵌套画图形', '外层控制行数，内层控制每行打印几个字符，就能画出三角形、正方形、九九表。']
        ]},
      { type: 'mistakes', title: '常见错误', items: [
        { bad: 'for 的两个分号写成逗号或漏掉', why: '语法错误，编译器看不懂', fix: '记住形状：for (初始; 条件; 更新)' },
        { bad: '循环体里又改了循环变量', why: '可能导致提前结束或死循环', fix: '只在 for 的第三部分更新循环变量' },
        { bad: '内层循环用了和外层一样的变量名', why: '可以把 i 改成 j 避免误会', fix: '外层 i、内层 j、再内层 k，是通用习惯' },
        { bad: '嵌套层数太多', why: '代码难以阅读，且容易算错', fix: '超过两层考虑把内层逻辑抽成函数' }
      ]}
    ],
    tasks: [
      {
        id: 'L10-T1',
        title: '任务 1：乘法表（嵌套循环）',
        brief: '用两层 for 循环打印 1~5 的乘法表，共 5 行，每行 5 个算式，算式之间用空格分开。\n第一行开头是：1*1=1 1*2=2 …　最后一行末尾是：5*5=25',
        starter: String.raw`#include <stdio.h>

int main() {
    for (int i = 1; i <= 5; i++) {
        for (int j = 1; j <= 5; j++) {
            // 打印 i*j 的算式，后面跟一个空格
        }
        printf("\n");   // 每一行结束要换行
    }
    return 0;
}`,
        hints: ['内层写法：printf("%d*%d=%d ", i, j, i * j);', '别忘了内层循环结束后换行，否则会全部挤在一行。'],
        mustInclude: [{ re: /for[\s\S]*for/, label: '嵌套的 for 循环', hint: '这道题要求用两层 for 循环。' }],
        tests: [
          { name: '有 5 行', expectRegex: '^([^\\n]+\\n){4}[^\\n]+$' },
          { name: '内容正确', expectContains: ['1*1=1', '1*5=5', '3*4=12', '5*5=25'] }
        ],
        reward: { fish: 8, xp: 40 },
        solution: String.raw`#include <stdio.h>

int main() {
    for (int i = 1; i <= 5; i++) {
        for (int j = 1; j <= 5; j++) {
            printf("%d*%d=%d ", i, j, i * j);
        }
        printf("\n");
    }
    return 0;
}`
      },
      {
        id: 'L10-T2',
        title: '任务 2：打印直角三角形',
        brief: '用嵌套循环打印 5 行星星组成的直角三角形，输出必须完全一致：\n*\n**\n***\n****\n*****',
        starter: String.raw`#include <stdio.h>

int main() {
    for (int i = 1; i <= 5; i++) {
        // 这一行要打印 i 个星号

        printf("\n");
    }
    return 0;
}`,
        hints: ['内层循环：for (int j = 1; j <= i; j++) { printf("*"); }', '关键点：内层的次数由外层的 i 决定。'],
        tests: [{ name: '三角形正确', expect: '*\n**\n***\n****\n*****' }],
        reward: { fish: 8, xp: 40 },
        solution: String.raw`#include <stdio.h>

int main() {
    for (int i = 1; i <= 5; i++) {
        for (int j = 1; j <= i; j++) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}`
      },
      {
        id: 'L10-T3',
        title: '任务 3：找到第一个符合条件的数',
        brief: '用 for 循环从 1 数到 100，找到第一个能同时被 7 和 9 整除的数，用 break 跳出循环，输出：\n第一个能同时被 7 和 9 整除的数是 63',
        starter: String.raw`#include <stdio.h>

int main() {
    int found = 0;

    for (int i = 1; i <= 100; i++) {
        // 条件成立就记下来并 break

    }

    return 0;
}`,
        hints: ['条件：i % 7 == 0 && i % 9 == 0', '找到后 printf 再 break;'],
        mustInclude: [{ re: /break\s*;/, label: 'break 语句', hint: '找到之后要用 break 跳出循环。' }],
        tests: [{ name: '找到了 63', expect: '第一个能同时被 7 和 9 整除的数是 63' }],
        reward: { fish: 8, xp: 40 },
        solution: String.raw`#include <stdio.h>

int main() {
    for (int i = 1; i <= 100; i++) {
        if (i % 7 == 0 && i % 9 == 0) {
            printf("第一个能同时被 7 和 9 整除的数是 %d\n", i);
            break;
        }
    }
    return 0;
}`
      },
      {
        id: 'L10-T4',
        title: '挑战：跳过 5 的倍数求和',
        brief: '用 for 和 continue，求 1~20 中所有「不是 5 的倍数」的数之和，输出：\n结果是 160',
        starter: String.raw`#include <stdio.h>

int main() {
    int sum = 0;

    for (int i = 1; i <= 20; i++) {
        // 是 5 的倍数就跳过这一轮

    }

    return 0;
}`,
        hints: ['i % 5 == 0 时 continue;', '1~20 的总和是 210，其中 5+10+15+20 = 50 被跳过了。'],
        tests: [{ name: '求和正确', expect: '结果是 160' }],
        reward: { fish: 9, xp: 45 },
        solution: String.raw`#include <stdio.h>

int main() {
    int sum = 0;

    for (int i = 1; i <= 20; i++) {
        if (i % 5 == 0) {
            continue;
        }
        sum += i;
    }

    printf("结果是 %d\n", sum);
    return 0;
}`
      }
    ]
  });

  LESSONS.push({
    id: 'L11',
    title: '第 11 课 · 数组',
    subtitle: '一次装很多个数据',
    minutes: 20,
    goals: ['会声明一维数组', '知道下标从 0 开始', '会用循环遍历数组', '会求最大最小值和统计'],
    sections: [
      { type: 'text', h: '一、数组：一排连着的盒子', p: [
        '要存 5 个学生的成绩，声明 5 个变量太累，这时就用数组：int scores[5]; 一次开出 5 个连着的整数盒子。',
        '每个盒子有自己的编号，叫下标。关键点：下标从 0 开始！所以 int a[5] 的合法下标是 0、1、2、3、4，没有 a[5]。',
        '数组的最大好处是可以配合循环使用：用循环变量当下标，就能一次处理所有元素。'
      ]},
      { type: 'code', title: '声明、赋值、遍历', code: String.raw`#include <stdio.h>

int main() {
    int scores[5];                       // 开 5 个整数盒子

    scores[0] = 88;                      // 一个一个装
    scores[1] = 92;
    scores[2] = 76;

    int a[3] = {1, 2, 3};                // 声明时就装满
    int b[5] = {10, 20};                 // 只给两个，剩下的自动是 0
    int c[] = {7, 8, 9};                 // 让编译器自己数长度（就是 3）

    // 最常用的套路：用循环遍历
    int sum = 0;
    for (int i = 0; i < 5; i++) {        // 注意是 i < 5，不是 i <= 5
        sum += scores[i];
    }
    printf("总和 %d\n", sum);

    // sizeof 可以算出数组有几个元素
    printf("b 有 %d 个元素\n", (int)(sizeof(b) / sizeof(b[0])));
    return 0;
}`,
        explain: [
          ['下标从 0 开始', 'a[0] 是第一个元素，a[n-1] 是最后一个。'],
          ['数组长度必须是常量', 'int a[n]; 里的 n 不能是运行时才确定的变量（初学先用固定数字）。'],
          ['越界是危险的', '访问 a[5] 属于越界，真实 C 语言不会报错，只会悄悄破坏别的数据；我们的解释器会拦下来提醒你。'],
          ['sizeof 技巧', 'sizeof(数组) / sizeof(数组[0]) 就是元素个数。']
        ]},
      { type: 'text', h: '二、遍历时的三大常用套路', p: [
        '① 求和求平均：开一个累加变量，循环里一个个加上去。',
        '② 找最大/最小：先把第一个元素当成「目前最大」，然后逐个比较，遇到更大的就更新。',
        '③ 统计计数：满足条件就让计数器加一。'
      ]},
      { type: 'mistakes', title: '常见错误', items: [
        { bad: '下标从 1 开始用', why: 'a[1] 其实是第二个元素，容易错位', fix: 'C 语言的下标从 0 开始，循环写 i = 0; i < n' },
        { bad: '循环条件写成 i <= n', why: '最后会访问 a[n]，越界！', fix: '记住：i < n 或 i <= n - 1' },
        { bad: '数组没初始化就用', why: '里面是垃圾值，算出来结果莫名其妙', fix: '声明时给初值，或先循环赋 0' },
        { bad: '整个数组用 = 赋值', why: 'C 语言不允许 b = a; 这种整体复制', fix: '用循环一个元素一个元素复制' }
      ]}
    ],
    tasks: [
      {
        id: 'L11-T1',
        title: '任务 1：求平均分',
        brief: '已知 5 个成绩 88、92、76、95、60，用数组保存，循环求和后求平均分，输出：\n平均分是 82.20',
        starter: String.raw`#include <stdio.h>

int main() {
    int scores[5] = {88, 92, 76, 95, 60};
    int sum = 0;

    // 用循环求和

    // 计算平均分（注意整数除法），打印时保留两位小数

    return 0;
}`,
        hints: ['sum / 5.0 才能得到小数。', 'printf("平均分是 %.2f\\n", avg);'],
        tests: [{ name: '平均分正确', expect: '平均分是 82.20' }],
        reward: { fish: 7, xp: 35 },
        solution: String.raw`#include <stdio.h>

int main() {
    int scores[5] = {88, 92, 76, 95, 60};
    int sum = 0;

    for (int i = 0; i < 5; i++) {
        sum += scores[i];
    }

    double avg = sum / 5.0;
    printf("平均分是 %.2f\n", avg);
    return 0;
}`
      },
      {
        id: 'L11-T2',
        title: '任务 2：最高分和最低分',
        brief: '还是那 5 个成绩（88、92、76、95、60），找出最高分和最低分，输出：\n最高分 95，最低分 60',
        starter: String.raw`#include <stdio.h>

int main() {
    int scores[5] = {88, 92, 76, 95, 60};
    int max = scores[0];
    int min = scores[0];

    // 从 i = 1 开始比较

    return 0;
}`,
        hints: ['循环里：if (scores[i] > max) max = scores[i]; 最小值同理。', '为什么要从 i = 1 开始？因为 scores[0] 已经当作初始值了。'],
        tests: [{ name: '最大最小正确', expect: '最高分 95，最低分 60' }],
        reward: { fish: 7, xp: 35 },
        solution: String.raw`#include <stdio.h>

int main() {
    int scores[5] = {88, 92, 76, 95, 60};
    int max = scores[0];
    int min = scores[0];

    for (int i = 1; i < 5; i++) {
        if (scores[i] > max) {
            max = scores[i];
        }
        if (scores[i] < min) {
            min = scores[i];
        }
    }

    printf("最高分 %d，最低分 %d\n", max, min);
    return 0;
}`
      },
      {
        id: 'L11-T3',
        title: '任务 3：倒序输出',
        brief: '读入 5 个整数存进数组，然后倒着打印出来，数字之间用空格分开。\n输入 1 2 3 4 5 时输出：5 4 3 2 1',
        starter: String.raw`#include <stdio.h>

int main() {
    int a[5];

    // 先读 5 个数进数组

    // 再从最后一个元素开始往前打印

    return 0;
}`,
        hints: ['读入用 for (int i = 0; i < 5; i++) scanf("%d", &a[i]);', '倒着打印：for (int i = 4; i >= 0; i--) printf("%d ", a[i]);'],
        tests: [{ name: '倒序正确', stdin: '1 2 3 4 5', expect: '5 4 3 2 1' }],
        reward: { fish: 8, xp: 40 },
        solution: String.raw`#include <stdio.h>

int main() {
    int a[5];

    for (int i = 0; i < 5; i++) {
        scanf("%d", &a[i]);
    }

    for (int i = 4; i >= 0; i--) {
        printf("%d ", a[i]);
    }
    return 0;
}`
      },
      {
        id: 'L11-T4',
        title: '挑战：统计及格人数',
        brief: '读入 6 个成绩，统计其中及格（>= 60）的人数并求平均分（保留 1 位小数），输出：\n及格 4 人，平均分 66.5\n（输入示例：50 60 70 80 90 40）',
        starter: String.raw`#include <stdio.h>

int main() {
    int s[6];
    int pass = 0, sum = 0;

    // 读入 + 统计

    return 0;
}`,
        hints: ['一边读一边判断 if (s[i] >= 60) pass++;', '平均分用 sum / 6.0。'],
        tests: [{ name: '统计正确', stdin: '50 60 70 80 90 40', expect: '及格 4 人，平均分 65.0' }],
        reward: { fish: 9, xp: 45 },
        solution: String.raw`#include <stdio.h>

int main() {
    int s[6];
    int pass = 0, sum = 0;

    for (int i = 0; i < 6; i++) {
        scanf("%d", &s[i]);
        sum += s[i];
        if (s[i] >= 60) {
            pass++;
        }
    }

    printf("及格 %d 人，平均分 %.1f\n", pass, sum / 6.0);
    return 0;
}`
      }
    ]
  });

  LESSONS.push({
    id: 'L12',
    title: '第 12 课 · 二维数组',
    subtitle: '表格和矩阵：行与列',
    minutes: 18,
    goals: ['会声明和使用二维数组', '会用双层循环遍历表格', '会做转置、求和这类矩阵操作', '知道二维数组在内存里也是「一排」'],
    sections: [
      { type: 'text', h: '一、二维数组就是一张表格', p: [
        'int m[3][4]; 可以理解成 3 行 4 列的表格，一共 12 个整数盒子。',
        '访问方式：m[行][列]，两个下标都从 0 开始。比如 m[0][0] 是左上角，m[2][3] 是右下角。'
      ]},
      { type: 'code', title: '声明、初始化、遍历', code: String.raw`#include <stdio.h>

int main() {
    // 3 行 3 列的表格，逐行填数
    int m[3][3] = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };

    // 双层循环遍历：外层走行，内层走列
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            printf("%d ", m[i][j]);
        }
        printf("\n");       // 一行打印完要换行
    }

    // 求和
    int sum = 0;
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            sum += m[i][j];
        }
    }
    printf("总和 %d\n", sum);
    return 0;
}`,
        explain: [
          ['m[i][j]', '先定位到第 i 行，再取第 j 列。'],
          ['外层是行，内层是列', '这个顺序和「一行一行地读表格」一致，也是内存里的真实排列顺序。'],
          ['行列不要搞反', 'm[2][1] 是第 2 行第 1 列（都从 0 数），不是第 2 列第 1 行。'],
          ['常用操作', '按行求和、按列求和、找最大值、矩阵转置（行列互换），都可以用双层循环完成。']
        ]},
      { type: 'text', h: '二、转置：把表格翻过来', p: [
        '转置就是把第 i 行第 j 列的元素，搬到第 j 行第 i 列。原来的行变成列，列变成行。',
        '做法是双层循环遍历原数组，把 m[i][j] 赋给新数组 t[j][i]，最后打印新数组。'
      ]},
      { type: 'mistakes', title: '常见错误', items: [
        { bad: '用两个下标时写反了行和列', why: '结果会和预期完全不同', fix: '先把表格画在纸上，标好行列编号再写代码' },
        { bad: '内层循环忘了换行', why: '所有数字挤成一行，看不出来表格', fix: '内层循环结束后立刻 printf("\\n")' },
        { bad: '行列长度搞错导致越界', why: '例如 3×3 的表写成 i <= 3', fix: '行列都用 i < 行数、j < 列数' }
      ]}
    ],
    tasks: [
      {
        id: 'L12-T1',
        title: '任务 1：矩阵转置',
        brief: '已知 3×3 矩阵 {{1,2,3},{4,5,6},{7,8,9}}，把它转置后打印出来（每行三个数字，用空格分开）：\n1 4 7\n2 5 8\n3 6 9',
        starter: String.raw`#include <stdio.h>

int main() {
    int m[3][3] = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };
    int t[3][3];

    // 把 m[i][j] 搬到 t[j][i]

    return 0;
}`,
        hints: ['双层循环里：t[j][i] = m[i][j];', '打印时外层 i 是行，内层 j 是列，每行结束记得换行。'],
        tests: [{ name: '转置结果正确', expect: '1 4 7\n2 5 8\n3 6 9' }],
        reward: { fish: 8, xp: 40 },
        solution: String.raw`#include <stdio.h>

int main() {
    int m[3][3] = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };
    int t[3][3];

    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            t[j][i] = m[i][j];
        }
    }

    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            printf("%d ", t[i][j]);
        }
        printf("\n");
    }
    return 0;
}`
      },
      {
        id: 'L12-T2',
        title: '任务 2：每行的和',
        brief: '已知 2×3 的成绩表 {{80,90,70},{60,85,95}}，求每一行的和并输出：\n第 1 行和是 240\n第 2 行和是 240',
        starter: String.raw`#include <stdio.h>

int main() {
    int m[2][3] = {
        {80, 90, 70},
        {60, 85, 95}
    };

    // 外层 i 是行号，内层 j 遍历这一行的每一列

    return 0;
}`,
        hints: ['每处理一行之前，把 sum 归零：int sum = 0;', '打印时行号用 i + 1，因为下标从 0 开始。'],
        tests: [{ name: '每行和正确', expect: '第 1 行和是 240\n第 2 行和是 240' }],
        reward: { fish: 8, xp: 40 },
        solution: String.raw`#include <stdio.h>

int main() {
    int m[2][3] = {
        {80, 90, 70},
        {60, 85, 95}
    };

    for (int i = 0; i < 2; i++) {
        int sum = 0;
        for (int j = 0; j < 3; j++) {
            sum += m[i][j];
        }
        printf("第 %d 行和是 %d\n", i + 1, sum);
    }
    return 0;
}`
      },
      {
        id: 'L12-T3',
        title: '任务 3：找出表格里的最大值',
        brief: '读入 2 行 3 列共 6 个整数，找出其中最大的数并输出：\n最大值是 99',
        starter: String.raw`#include <stdio.h>

int main() {
    int m[2][3];

    // 先读入

    // 再找最大值

    return 0;
}`,
        hints: ['读入：双重循环 scanf("%d", &m[i][j]);', '先把 m[0][0] 当成最大值，再逐个比较。'],
        tests: [
          { name: '输入 1 2 3 4 5 6', stdin: '1 2 3 4 5 6', expect: '最大值是 6' },
          { name: '输入 10 99 3 4 5 6', stdin: '10 99 3 4 5 6', expect: '最大值是 99' }
        ],
        reward: { fish: 9, xp: 45 },
        solution: String.raw`#include <stdio.h>

int main() {
    int m[2][3];

    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 3; j++) {
            scanf("%d", &m[i][j]);
        }
    }

    int max = m[0][0];
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 3; j++) {
            if (m[i][j] > max) {
                max = m[i][j];
            }
        }
    }

    printf("最大值是 %d\n", max);
    return 0;
}`
      }
    ]
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);