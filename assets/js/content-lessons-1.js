/*!
 * 粉猫捉虫 · 课程内容（第 1 ~ 4 课）
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var LESSONS = CC.LESSONS || (CC.LESSONS = []);

  LESSONS.push({
    id: 'L1',
    title: '第 1 课 · 你好，C 语言',
    subtitle: '认识程序长什么样，让电脑说出第一句话',
    minutes: 15,
    goals: ['知道「源代码」和「编译」是什么', '认识 main 函数', '会用 printf 打印文字', '记住分号、花括号、双引号'],
    sections: [
      { type: 'text', h: '一、程序到底是什么？', p: [
        '你可以把程序想成一份「写给电脑的菜谱」：菜谱一行一行写着先做什么、再做什么，电脑就照着一步步执行。',
        'C 语言就是我们写这份菜谱时用的「语言」。它的特点很鲜明：关键字少、规则清楚、运行飞快，是很多语言的老前辈。',
        '我们写下的这些文字叫「源代码」（source code），通常保存在 .c 文件里。电脑真正能执行的是二进制的机器指令，所以中间还需要一位「翻译」——编译器（compiler）。这一课里，你不必自己装编译器：页面右边的粉色小猫会拿着一台迷你编译器，随时帮你翻译、运行、报错。'
      ]},

      { type: 'text', h: '二、C 程序的最小骨架', p: [
        '每一个 C 程序都要有一个 main 函数。程序运行起来时，电脑会从 main 的第一行开始，往下一条一条执行。',
        '花括号 { } 里装的是这个函数要做的事情；每一件事写完，都要用分号 ; 收尾。'
      ]},

      { type: 'code', title: '最小的 C 程序（就是下面这个形状）', code: String.raw`#include <stdio.h>          // 把「标准输入输出」工具箱搬进来，printf 住在这里

int main() {                // 程序从这里开始执行
    printf("你好，C 语言！\n");   // 在屏幕上打印一句话，\n 表示换行
    return 0;               // 告诉系统：程序正常结束
}`,
        explain: [
          ['#include <stdio.h>', '引入头文件。printf、scanf 这些函数都住在这个工具箱里，不搬进来编译器就不认识它们。'],
          ['int main()', 'main 是程序的入口。前面的 int 表示这个函数结束时会给系统一个整数。'],
          ['{ 与 }', '一对花括号把「要做的事」包成一个代码块，注意左右各一个，缺一不可。'],
          ['printf("…\\n")', 'printf 负责打印。双引号里的内容会原样输出；\\n 是一个转义字符，表示「换行」。'],
          ['return 0;', '返回 0 表示一切正常。初学者先照着写，后面讲函数时会明白它的意义。']
        ]},

      { type: 'table', title: '必须记住的三个符号', head: ['符号', '名字', '作用'], rows: [
        [';', '分号', '每条语句的结尾，相当于中文里的句号'],
        ['{ }', '花括号', '把一堆语句包成一个整体（代码块）'],
        ['" "', '双引号', '包住要打印的文字，这叫字符串']
      ], note: '全都是英文半角符号！中文输入法打出的 ；｛｝“” 长得像，但电脑完全不认识。'},

      { type: 'mistakes', title: '新手最常踩的三个坑', items: [
        { bad: '忘记结尾的分号', why: 'C 语言靠分号判断「这句话说完了」', fix: '在每条语句结尾补上 ;——报错信息也会告诉你第几行缺分号' },
        { bad: '用了中文标点', why: '中文的 ；和英文的 ; 是两个完全不同的字符，电脑只认后者', fix: '写代码前把输入法切到英文（很多编辑器会在中文标点处画波浪线）' },
        { bad: 'printf 后面忘了双引号或括号', why: 'printf 是一个函数，要写成 printf(要打印的内容)', fix: '记住形状：printf("文字"); 括号、双引号、分号一个都不能少' }
      ]},

      { type: 'tip', text: '右边（手机上在下方）那只粉色小猫叫「捉虫」。每完成一个任务，它就会得到小鱼干；你可以喂它、陪它玩、给它买装扮。学得越多，它长得越好。' }
    ],
    tasks: [
      {
        id: 'L1-T1',
        title: '任务 1：让电脑说出你的名字',
        brief: '先点一下「运行」，看看屏幕上出现什么。然后把双引号里的文字改成「你好，我是你的名字！」，再运行一次。',
        starter: String.raw`#include <stdio.h>

int main() {
    printf("你好，C 语言！\n");
    return 0;
}`,
        hints: [
          '只需要改双引号里面的文字，其他地方一个字都不要动。',
          '想打印多行，就写多个 printf，每一行都要有自己的 ; 和 \\n。'
        ],
        tests: [
          { name: '程序能正常运行', runs: true },
          { name: '打印出了自我介绍', expectContains: '你好，我是' }
        ],
        reward: { fish: 3, xp: 20 },
        solution: String.raw`#include <stdio.h>

int main() {
    printf("你好，我是小明！\n");
    return 0;
}`
      },
      {
        id: 'L1-T2',
        title: '任务 2：打印三行诗',
        brief: '用三个 printf，打印出下面三行（文字、顺序、标点都要一模一样）：\n第一行：C 语言，很酷\n第二行：我要学会它\n第三行：从今天开始',
        starter: String.raw`#include <stdio.h>

int main() {
    // 在这里写你的三个 printf

    return 0;
}`,
        hints: [
          '每一行末尾都要写 \\n，否则三行会挤在一起。',
          '三个 printf 写完，别忘了一行一个分号。'
        ],
        mustInclude: [{ re: /printf\s*\(/, label: 'printf 函数', hint: '打印文字要用 printf("文字");' }],
        tests: [{ name: '输出完全一致', expect: 'C 语言，很酷\n我要学会它\n从今天开始' }],
        reward: { fish: 4, xp: 25 },
        solution: String.raw`#include <stdio.h>

int main() {
    printf("C 语言，很酷\n");
    printf("我要学会它\n");
    printf("从今天开始\n");
    return 0;
}`
      },
      {
        id: 'L1-T3',
        title: '任务 3：故意弄坏它（这很重要）',
        brief: '以后你一定会写错代码，所以「看懂报错」比背语法更重要。\n请你故意删掉任何一行结尾的分号，然后点「运行」，读一读报错信息。\n\n本题要求：让程序报出一个「少了分号」的错误。',
        starter: String.raw`#include <stdio.h>

int main() {
    printf("我能看懂报错了！\n");
    return 0;
}`,
        hints: [
          '把 printf 那行末尾的 ; 删掉，再运行。',
          '报错会告诉你「第几行」出问题。改错时，永远从第一处报错开始改。'
        ],
        tests: [{ name: '报错里出现了“分号”', expectErrorContains: '分号' }],
        reward: { fish: 5, xp: 25 },
        solution: String.raw`// 参考做法：把 printf 那行结尾的分号删掉
#include <stdio.h>

int main() {
    printf("我能看懂报错了！\n")
    return 0;
}`
      },
      {
        id: 'L1-T4',
        title: '挑战：用字符拼一个小方块',
        brief: '只用 printf，打印出这个 4 行 × 4 列的方块（每行 4 个星号）：\n****\n****\n****\n****',
        starter: String.raw`#include <stdio.h>

int main() {

    return 0;
}`,
        hints: ['一行一个 printf，内容是 "****\\n"。'],
        tests: [{ name: '输出 4 行星号', expect: '****\n****\n****\n****' }],
        reward: { fish: 6, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    printf("****\n");
    printf("****\n");
    printf("****\n");
    printf("****\n");
    return 0;
}`
      }
    ]
  });

  LESSONS.push({
    id: 'L2',
    title: '第 2 课 · 注释与排版',
    subtitle: '让代码好读、好改、像人写的',
    minutes: 12,
    goals: ['会用 // 和 /* */ 写注释', '知道注释会被编译器忽略', '养成缩进和换行的习惯', '学会自己排查中文标点'],
    sections: [
      { type: 'text', h: '一、注释：写给「人」看的说明', p: [
        '程序里有一部分文字不是给电脑执行的，而是给「未来的你」和同事看的，这叫注释。',
        '编译器在翻译时会直接把注释丢掉，所以注释写得再多也不会影响程序的速度和结果。'
      ]},

      { type: 'code', title: '两种注释', code: String.raw`// 这叫单行注释：从 // 开始，到这一行结束都是废话（电脑不看）
/* 这叫块注释，
   可以从这一行延续到很多行，
   最后以星号加斜杠结束 */

int main() {
    printf("注释不会显示出来\n");  // 也可以写在语句后面
    return 0;
}`,
        explain: [
          ['// 单行注释', '最常用。写「为什么这么写」，而不是「这行在干嘛」。'],
          ['/* … */ 块注释', '适合一次注释掉一大段。注意：块注释不能嵌套，写了记得收尾。'],
          ['什么时候写注释', '说明思路、记录坑、标记待办。代码本身就是最好的注释，名字起好也很重要。']
        ]},

      { type: 'text', h: '二、排版：缩进与空行', p: [
        '编译器不关心空格和换行，但人关心。规范的排版能让你一眼看出代码的层次。',
        '常见约定：花括号里的内容统一缩进 4 个空格；不同功能的代码之间空一行；花括号通常单独成行或者紧跟在行尾，重点是全篇统一。'
      ]},

      { type: 'code', title: '好排版 vs 坏排版', code: String.raw`// 这样写，一眼看不出来谁包着谁
int main(){printf("a\n");if(1){printf("b\n");}return 0;}

// 这样写，层次清清楚楚
int main() {
    printf("a\n");
    if (1) {
        printf("b\n");
    }
    return 0;
}` },

      { type: 'mistakes', title: '字符类错误：眼睛看不出来，电脑一眼看穿', items: [
        { bad: '中文分号 ；', why: '它和英文 ; 编码不同，编译器会说「不认识这个字符」', fix: '切到英文输入法重打一遍' },
        { bad: '中文引号 “ ” 或 （ ）', why: '同理，字符串必须用英文双引号 " " 包起来', fix: '删掉重打，不要用复制粘贴里的花引号' },
        { bad: '块注释忘记收尾', why: '/* 后面的所有代码都会被当成注释，程序会突然「什么都找不到」', fix: '检查有没有对应的 */' }
      ]},

      { type: 'tip', text: '小技巧：不确定某个字符是不是中文标点，就看它占的宽度——中文标点更宽，而且光标选中时更容易选中一整块。' }
    ],
    tasks: [
      {
        id: 'L2-T1',
        title: '任务 1：给代码写注释',
        brief: '在下面的代码里加上至少两条注释（用 //），至少有一条写在某条语句的后面。程序要能正常运行，并打印出原文。',
        starter: String.raw`#include <stdio.h>

int main() {
    printf("我学会注释啦\n");
    return 0;
}`,
        hints: ['在 printf 那一行的末尾写 // 说明它在做什么。', '文件最上面可以写一行 // 说明这是谁写的。'],
        mustInclude: [{ re: /\/\/[^\n]*\S/, label: '一条 // 注释', keepComments: true, hint: '在代码里加一行 // 注释，比如 // 这是 C 语言程序' }],
        tests: [{ name: '输出正确', expect: '我学会注释啦' }],
        reward: { fish: 3, xp: 20 },
        solution: String.raw`#include <stdio.h>   // 引入打印工具箱

// 这是第 2 课的第一个任务：练习写注释
int main() {
    printf("我学会注释啦\n");   // 打印一句中文
    return 0;
}`
      },
      {
        id: 'L2-T2',
        title: '任务 2：修好中文标点',
        brief: '下面的程序里混进了中文标点，所以跑不起来。请找出问题、改成英文标点，让它正常运行。',
        starter: String.raw`#include <stdio.h>

int main() {
    printf("我要修好中文标点！\n")；
    return 0;
}`,
        hints: [
          '报错会指出是哪一行的第几个字符有问题。',
          '把行尾那个「宽宽的」分号改成英文的 ; 。'
        ],
        tests: [{ name: '修好后正常运行', expect: '我要修好中文标点！' }],
        reward: { fish: 4, xp: 25 },
        solution: String.raw`#include <stdio.h>

int main() {
    printf("我要修好中文标点！\n");
    return 0;
}`
      },
      {
        id: 'L2-T3',
        title: '任务 3：写一张有排版的卡片',
        brief: '用 printf 打印一张「学生证」卡片，要求输出完全一致：\n===== 学生证 =====\n姓名：小粉猫\n等级：Lv.1\n=================',
        starter: String.raw`#include <stdio.h>

int main() {

    return 0;
}`,
        hints: ['一行一个 printf，中文和标点要照抄。', '等号的个数要数清楚：5 个和 17 个。'],
        tests: [{ name: '卡片内容一致', expect: '===== 学生证 =====\n姓名：小粉猫\n等级：Lv.1\n=================' }],
        reward: { fish: 5, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    printf("===== 学生证 =====\n");
    printf("姓名：小粉猫\n");
    printf("等级：Lv.1\n");
    printf("=================\n");
    return 0;
}`
      }
    ]
  });

  LESSONS.push({
    id: 'L3',
    title: '第 3 课 · 变量与赋值',
    subtitle: '给数据起名字，装进「盒子」里',
    minutes: 18,
    goals: ['会声明变量并给它装初值', '会给变量重新赋值', '知道变量名怎么写才合法', '会用 printf 打印变量的值'],
    sections: [
      { type: 'text', h: '一、变量就是一个个有名字的盒子', p: [
        '程序要记住数据：你的年龄、游戏分数、小猫的饱食度……这些东西都要放进「盒子」里保存。',
        '盒子上的名字叫变量名，盒子里装的东西叫变量的值。盒子能装什么类型的东西，由声明时的类型决定（这一课我们先用整数 int）。'
      ]},

      { type: 'code', title: '声明、赋值、打印', code: String.raw`#include <stdio.h>

int main() {
    int age = 18;          // 声明一个整数盒子，名字叫 age，先装进 18
    int score;             // 也可以先声明、以后再装东西
    score = 95;            // 用 = 把 95 放进去（这叫赋值）

    age = 19;              // 盒子里的东西可以换，装新的进去，旧的就被顶掉了

    printf("年龄：%d\n", age);     // %d 是给整数留的位置，后面的 age 会填进去
    printf("分数：%d\n", score);
    return 0;
}`,
        explain: [
          ['int age = 18;', 'int 表示这个盒子只能装整数（integer）。= 不是数学上的相等，而是「把右边装进左边」。'],
          ['score = 95;', '先声明、后赋值也完全可以，前提是用之前已经装过东西，否则里面是乱七八糟的垃圾值。'],
          ['printf("%d", age)', '双引号里的 %d 是一个「占位符」，它会被逗号后面的第一个值替换掉。'],
          ['为什么要用 %d', 'printf 必须提前知道每个位置要打印什么类型：整数用 %d，小数用 %f，字符用 %c，字符串用 %s。']
        ]},

      { type: 'table', title: '取名字的规矩', head: ['规则', '例子'], rows: [
        ['只能用字母、数字、下划线，且不能以数字开头', 'score1、my_age、a 都行；1score、my-age 不行'],
        ['区分大小写', 'Score 和 score 是两个不同的盒子'],
        ['不能用 C 语言的关键字', 'int、return、if、for 不能当变量名'],
        ['名字要能看懂', '用 total_price 而不是 a1、abc']
      ]},

      { type: 'text', h: '二、交换两个盒子的东西', p: [
        '一个经典问题：a 里是 10，b 里是 20，怎样让它们换过来？',
        '如果你写 a = b; 再写 b = a;，结果是两个都变成 20——因为 a 原来的 10 已经被顶掉了。',
        '正确做法是找一个「临时盒子」帮个忙：把 a 的值先寄存到 temp 里，再让 b 到 a，最后把 temp 放回 b。'
      ]},

      { type: 'code', title: '交换的标准三步', code: String.raw`int a = 10;
int b = 20;

int temp = a;   // ① 把 a 的值寄存在 temp（temp = 10）
a = b;          // ② b 的值搬进 a（a = 20）
b = temp;       // ③ 把寄存的 10 还给 b（b = 10）

printf("a=%d b=%d\n", a, b);   // 输出 a=20 b=10` },

      { type: 'mistakes', title: '常见错误', items: [
        { bad: '用了没赋初值的变量就打印', why: '盒子里可能是任意垃圾值，结果不可预测', fix: '声明时就给它一个初值，例如 int score = 0;' },
        { bad: 'printf 里的 %d 和后面的值对不上', why: '占位符的个数、顺序、类型都要和后面的参数一一对应', fix: '数一数有几个 %d，就跟着写几个整数' },
        { bad: '把 = 当成数学等号', why: 'a = a + 1 在数学上不成立，但在程序里是「把 a 加 1 后再装回 a」', fix: '读作「赋值」，从左往右读是不对的，要从右往左读' }
      ]}
    ],
    tasks: [
      {
        id: 'L3-T1',
        title: '任务 1：介绍你自己',
        brief: '声明三个变量：name（名字，用 %s 打印）、age（年龄）、height（身高，整数厘米）。然后用 printf 打印出来，格式必须完全一致：\n我叫小粉猫，今年 1 岁，身高 30 厘米\n（把「小粉猫」「1」「30」换成你自己的信息也可以，格式不能变）',
        starter: String.raw`#include <stdio.h>

int main() {
    // 在这里声明 name、age、height 三个变量

    // 在这里用 printf 打印
    return 0;
}`,
        hints: [
          '名字是一串文字，用字符数组保存：char name[20] = "小粉猫";',
          '打印格式：printf("我叫%s，今年%d岁，身高%d厘米\\n", name, age, height);'
        ],
        mustInclude: [
          { re: /int\s+age\s*=/, label: 'int age 变量' },
          { re: /int\s+height\s*=/, label: 'int height 变量' }
        ],
        tests: [{ name: '输出格式正确', expectRegex: '^我叫.+，今年\\s?\\d+\\s?岁，身高\\s?\\d+\\s?厘米$' }],
        reward: { fish: 4, xp: 25 },
        solution: String.raw`#include <stdio.h>

int main() {
    char name[20] = "小粉猫";
    int age = 1;
    int height = 30;

    printf("我叫%s，今年%d岁，身高%d厘米\n", name, age, height);
    return 0;
}`
      },
      {
        id: 'L3-T2',
        title: '任务 2：交换两个变量的值',
        brief: 'a 里是 10，b 里是 20。请把它们换过来，最后打印出：\na=20 b=10',
        starter: String.raw`#include <stdio.h>

int main() {
    int a = 10;
    int b = 20;

    // 请在这里交换 a 和 b 的值

    printf("a=%d b=%d\n", a, b);
    return 0;
}`,
        hints: ['先找个临时变量把其中一个值存起来。', '顺序：temp = a; a = b; b = temp;'],
        tests: [{ name: '交换成功', expect: 'a=20 b=10' }],
        reward: { fish: 4, xp: 25 },
        solution: String.raw`#include <stdio.h>

int main() {
    int a = 10;
    int b = 20;

    int temp = a;
    a = b;
    b = temp;

    printf("a=%d b=%d\n", a, b);
    return 0;
}`
      },
      {
        id: 'L3-T3',
        title: '任务 3：算长方形的面积',
        brief: '长 8、宽 5，用变量保存，算出面积并打印：\n面积是 40',
        starter: String.raw`#include <stdio.h>

int main() {
    int length = 8;
    int width = 5;

    // 算面积，存到一个变量里

    return 0;
}`,
        hints: ['面积 = 长 × 宽，乘法用星号 *。', 'printf("面积是 %d\\n", area);'],
        tests: [{ name: '面积算对了', expect: '面积是 40' }],
        reward: { fish: 4, xp: 25 },
        solution: String.raw`#include <stdio.h>

int main() {
    int length = 8;
    int width = 5;
    int area = length * width;

    printf("面积是 %d\n", area);
    return 0;
}`
      }
    ]
  });

  LESSONS.push({
    id: 'L4',
    title: '第 4 课 · 数据类型与运算',
    subtitle: '整数和小数的区别，藏着很多「坑」',
    minutes: 20,
    goals: ['认识 int / long / double / float / char', '知道整数除法的陷阱', '会用 % 取余', '会用 (int)、(double) 强制转换'],
    sections: [
      { type: 'text', h: '一、盒子有大有小，装的东西也不一样', p: [
        'int 装整数，double 装小数，char 装一个字符。选择类型的依据很简单：需要小数就用 double，需要极大整数用 long long，其他用 int。',
        'sizeof 运算符能告诉你某个类型占几个字节（1 字节 = 8 位），这能帮你理解为什么 int 装不下天文数字。',
        '注意：float 和 double 都是小数类型，double 更精确，初学一律用 double 就好。'
      ]},

      { type: 'table', title: '常用类型速查', head: ['类型', '装什么', 'printf 占位符', '例子'], rows: [
        ['int', '整数（约 ±21 亿）', '%d', 'int age = 18;'],
        ['long long', '非常大的整数', '%lld', 'long long big = 9000000000;'],
        ['double', '小数（推荐）', '%.2f 可控制小数位', 'double price = 3.5;'],
        ['float', '小数（精度低一点）', '%f', 'float x = 1.5f;'],
        ['char', '一个字符', '%c', "char c = 'A';"]
      ]},

      { type: 'text', h: '二、整数除法：新手第一个大坑', p: [
        '在 C 语言里，两个整数相除，结果还是整数，小数部分会被直接丢掉（不是四舍五入）。',
        '7 / 2 的结果是 3，不是 3.5。想要小数结果，就要让算式里至少出现一个小数：7.0 / 2 或 (double)7 / 2 都会得到 3.5。'
      ]},

      { type: 'code', title: '除法和取余', code: String.raw`#include <stdio.h>

int main() {
    int a = 7, b = 2;

    printf("%d\n", a / b);        // 3   整数除法，小数被丢掉
    printf("%d\n", a % b);        // 1   取余：7 除以 2 剩下的部分
    printf("%.1f\n", 7.0 / 2);    // 3.5 只要有一个小数，结果就是小数
    printf("%.1f\n", (double)a / b);  // 3.5 用 (double) 把 a 临时变成小数

    printf("%d\n", 10 % 3);       // 1
    printf("%d\n", 10 % 5);       // 0   能整除时余数是 0
    return 0;
}` },

      { type: 'text', h: '三、强制类型转换', p: [
        '在值前面加一个小括号和类型名，就能把这个值临时变成别的类型，这叫强制类型转换。',
        '(int)3.99 的结果是 3——注意是「砍掉小数」，不是四舍五入。要四舍五入可以用 round()，或者写 (int)(x + 0.5)。'
      ]},

      { type: 'mistakes', title: '常见错误', items: [
        { bad: 'int 变量装小数', why: '装进去会被砍掉小数部分，例如 int a = 3.9; 得到 3', fix: '需要小数就声明成 double' },
        { bad: '用 % 算小数', why: '取余只能用于整数，7.5 % 2 是错误写法', fix: '先用 (int) 转换，或改用别的方法' },
        { bad: 'printf 占位符配错类型', why: '用 %d 打印 double 会得到乱码数字', fix: '整数 %d、小数 %f、字符 %c、字符串 %s，一一对应' },
        { bad: '除以 0', why: '数学上没有意义，程序会直接出错', fix: '做除法前先判断除数不为 0' }
      ]},

      { type: 'tip', text: '百分号本身怎么打印？写两个百分号 %% 就会输出一个 %。例如 printf("完成度 100%%\\n");' }
    ],
    tasks: [
      {
        id: 'L4-T1',
        title: '任务 1：摄氏度转华氏度',
        brief: '已知摄氏温度 c = 37.5，换算公式：华氏 = 摄氏 × 9 ÷ 5 + 32。\n请用 double 保存，并打印出结果，保留 1 位小数：\n摄氏 37.5 度 = 华氏 99.5 度',
        starter: String.raw`#include <stdio.h>

int main() {
    double c = 37.5;

    // 计算华氏温度，注意 9/5 是整数除法！

    return 0;
}`,
        hints: [
          '写成 c * 9 / 5.0 + 32，或者 c * 9.0 / 5 + 32，让除法里出现小数。',
          '打印用 printf("摄氏 %.1f 度 = 华氏 %.1f 度\\n", c, f);'
        ],
        tests: [{ name: '换算结果正确', expect: '摄氏 37.5 度 = 华氏 99.5 度' }],
        reward: { fish: 5, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    double c = 37.5;
    double f = c * 9 / 5.0 + 32;
    printf("摄氏 %.1f 度 = 华氏 %.1f 度\n", c, f);
    return 0;
}`
      },
      {
        id: 'L4-T2',
        title: '任务 2：三门课的平均分（小心整数除法）',
        brief: '语文 80、数学 90、英语 70。求平均分并保留 1 位小数，输出：\n平均分是 80.0',
        starter: String.raw`#include <stdio.h>

int main() {
    int chinese = 80, math = 90, english = 70;

    // 想想看：直接 / 3 会发生什么？

    return 0;
}`,
        hints: ['总和是整数，除以 3 会丢掉小数，所以用 / 3.0。', '也可以写 (double)(chinese + math + english) / 3。'],
        tests: [{ name: '平均分正确', expect: '平均分是 80.0' }],
        reward: { fish: 5, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    int chinese = 80, math = 90, english = 70;
    double avg = (chinese + math + english) / 3.0;

    printf("平均分是 %.1f\n", avg);
    return 0;
}`
      },
      {
        id: 'L4-T3',
        title: '任务 3：秒数换算',
        brief: '把 3661 秒换算成「几小时几分几秒」，用 / 和 % 完成，输出：\n3661 秒 = 1 小时 1 分 1 秒',
        starter: String.raw`#include <stdio.h>

int main() {
    int total = 3661;

    // 提示：小时 = 总秒数 / 3600
    //      剩余秒数 = 总秒数 % 3600

    return 0;
}`,
        hints: ['分钟 = 剩余秒数 / 60，秒 = 总秒数 % 60。', '想想为什么 % 3600 能拿到「去掉整小时之后的剩余秒数」。'],
        tests: [{ name: '换算正确', expect: '3661 秒 = 1 小时 1 分 1 秒' }],
        reward: { fish: 6, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    int total = 3661;
    int h = total / 3600;
    int m = total % 3600 / 60;
    int s = total % 60;

    printf("%d 秒 = %d 小时 %d 分 %d 秒\n", total, h, m, s);
    return 0;
}`
      },
      {
        id: 'L4-T4',
        title: '挑战：让 sizeof 说话',
        brief: '用 sizeof 打印出 int、double、char 三种类型各占几个字节，输出三行，每行格式为：\nint 占 4 字节\n（数字按实际结果打印）',
        starter: String.raw`#include <stdio.h>

int main() {

    return 0;
}`,
        hints: ['sizeof(int) 的结果就是一个整数，可以直接用 %d 打印。', '三行分别是 sizeof(int)、sizeof(double)、sizeof(char)。'],
        tests: [{ name: '打印了三个类型的大小', expectContains: ['int 占', 'double 占', 'char 占'] }],
        reward: { fish: 6, xp: 30 },
        solution: String.raw`#include <stdio.h>

int main() {
    printf("int 占 %d 字节\n", sizeof(int));
    printf("double 占 %d 字节\n", sizeof(double));
    printf("char 占 %d 字节\n", sizeof(char));
    return 0;
}`
      }
    ]
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);