/*!
 * 粉猫捉虫 · 课程内容（第 13 ~ 16 课）
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var LESSONS = CC.LESSONS || (CC.LESSONS = []);

  LESSONS.push({
    id: 'L13',
    title: '第 13 课 · 字符串与字符数组',
    subtitle: '一堆字符排排坐，最后站一个 \\0',
    minutes: 20,
    goals: ['知道字符串其实是 char 数组', '明白 \\0 的作用', '会用 strlen / strcpy / strcat / strcmp', '会自己写循环处理字符串'],
    sections: [
      { type: 'text', h: '一、字符串的秘密：结尾有一个看不见的 \\0', p: [
        'C 语言里没有专门的「字符串类型」。所谓字符串，就是一个 char 数组，而且最后一个有效字符后面必须跟一个特殊字符 \\0（读作「空字符」，它的值是 0）。',
        '这个 \\0 是「到此结束」的暗号。所有字符串函数都是靠找 \\0 来判断字符串在哪结束的。',
        '所以 char s[5] 只能装 4 个字符加一个 \\0，比如 "abcd"。数组开小了，字符串就装不下。'
      ]},
      { type: 'code', title: '内存里长这样', code: String.raw`char s[6] = "hello";

// 下标：  0    1    2    3    4    5
// 内容： 'h'  'e'  'l'  'l'  'o'  '\0'
// 值：   104  101  108  108  111   0

printf("%s\n", s);        // 从 s[0] 开始打印，遇到 \0 停止 → hello
printf("%c\n", s[1]);     // 取单个字符 → e
s[0] = 'H';               // 可以修改单个字符（数组是可改的）
printf("%s\n", s);        // Hello` },

      { type: 'table', title: 'string.h 里的常用函数', head: ['函数', '作用', '例子'], rows: [
        ['strlen(s)', '数出长度（不含 \\0）', 'strlen("hello") 得到 5'],
        ['strcpy(dst, src)', '把 src 复制到 dst', 'strcpy(a, "你好");'],
        ['strcat(dst, src)', '把 src 接到 dst 后面', 'strcat(a, " 再见");'],
        ['strcmp(a, b)', '比较内容：相等 0，a 小返回负数，a 大返回正数', 'if (strcmp(a, b) == 0) 表示相等']
      ], note: '用这些函数要 #include <string.h>。字符串比较千万别用 ==，那比较的是地址不是内容。'},

      { type: 'code', title: '不用库函数，自己数长度', code: String.raw`char s[] = "hello";
int len = 0;

while (s[len] != '\0') {   // 没遇到结尾暗号就继续数
    len++;
}

printf("长度是 %d\n", len);   // 5`,
        explain: [
          ['s[len] 逐个查看字符', '把下标当计数器用，是最经典的字符串遍历套路。'],
          ['\\0 是 0', '所以也可以写成 while (s[len]) —— 0 在条件里是假。'],
          ['数组名本身就是地址', '所以 scanf("%s", s) 不用写 &；s + 1 表示「从第二个字符开始」。']
        ]},

      { type: 'mistakes', title: '常见错误', items: [
        { bad: '用 == 比较两个字符串', why: '== 比较的是两个数组的地址，不是里面的内容', fix: '用 strcmp(a, b) == 0' },
        { bad: 'char s[5] = "hello";', why: '5 个字符还要加结尾的 \\0，需要 6 个位置', fix: '数组长度至少是「字符数 + 1」，或者干脆不写长度 char s[] = "hello";' },
        { bad: '给字符串整体赋值 s = "hi";', why: '数组不能整体赋值', fix: '用 strcpy(s, "hi");，或者声明时直接初始化' },
        { bad: '把 %s 用在单个字符上', why: '格式符和类型要对应', fix: '单个字符用 %c，字符串用 %s' }
      ]}
    ],
    tasks: [
      {
        id: 'L13-T1',
        title: '任务 1：自己数长度',
        brief: '不用 strlen，用 while 循环数出字符串 "pinkcat" 的长度，输出：\n字符串长度是 7',
        starter: String.raw`#include <stdio.h>

int main() {
    char s[] = "pinkcat";
    int len = 0;

    // 用 while 数到 \0 为止

    return 0;
}`,
        hints: ['while (s[len] != \'\\0\') { len++; }', '注意用单引号包住 \\0，它是字符常量。'],
        mustInclude: [{ re: /while\s*\(/, label: 'while 循环', hint: '这道题要求用 while 循环数长度。' }],
        tests: [{ name: '长度正确', expect: '字符串长度是 7' }],
        reward: { fish: 7, xp: 35 },
        solution: String.raw`#include <stdio.h>

int main() {
    char s[] = "pinkcat";
    int len = 0;

    while (s[len] != '\0') {
        len++;
    }

    printf("字符串长度是 %d\n", len);
    return 0;
}`
      },
      {
        id: 'L13-T2',
        title: '任务 2：把两个单词拼起来',
        brief: '读入两个单词（用空格分开），把它们拼成一个句子，中间加一个空格，输出：\n你好 小粉猫\n（输入示例：你好 小粉猫）',
        starter: String.raw`#include <stdio.h>
#include <string.h>

int main() {
    char a[40], b[20];

    scanf("%s %s", a, b);

    // 先接一个空格，再接上 b

    return 0;
}`,
        hints: ['strcat(a, " "); 然后 strcat(a, b);', '目标数组 a 要足够大，能装下两个字符串加空格。'],
        mustInclude: [{ re: /strcat\s*\(/, label: 'strcat 函数', hint: '这道题用 strcat 拼接最方便。' }],
        tests: [{ name: '拼接正确', stdin: '你好 小粉猫', expect: '你好 小粉猫' }],
        reward: { fish: 7, xp: 35 },
        solution: String.raw`#include <stdio.h>
#include <string.h>

int main() {
    char a[40], b[20];

    scanf("%s %s", a, b);

    strcat(a, " ");
    strcat(a, b);

    printf("%s\n", a);
    return 0;
}`
      },
      {
        id: 'L13-T3',
        title: '任务 3：判断回文',
        brief: '回文就是正着读和倒着读一样的字符串，比如 level。\n读入一个不带空格的字符串，判断它是不是回文，输出：\nlevel 是回文\n或者：\nhello 不是回文',
        starter: String.raw`#include <stdio.h>
#include <string.h>

int main() {
    char s[50];
    scanf("%s", s);

    int len = (int)strlen(s);
    int ok = 1;   // 先假设是回文

    // 用两个下标从两头往中间比较

    return 0;
}`,
        hints: ['左下标 i 从 0 开始，右下标 j = len - 1，相向而行。', '只要有一对不相等，就把 ok 设为 0 并 break。'],
        tests: [
          { name: '输入 level', stdin: 'level', expect: 'level 是回文' },
          { name: '输入 hello', stdin: 'hello', expect: 'hello 不是回文' }
        ],
        reward: { fish: 8, xp: 40 },
        solution: String.raw`#include <stdio.h>
#include <string.h>

int main() {
    char s[50];
    scanf("%s", s);

    int len = (int)strlen(s);
    int ok = 1;

    for (int i = 0, j = len - 1; i < j; i++, j--) {
        if (s[i] != s[j]) {
            ok = 0;
            break;
        }
    }

    if (ok) {
        printf("%s 是回文\n", s);
    } else {
        printf("%s 不是回文\n", s);
    }
    return 0;
}`
      },
      {
        id: 'L13-T4',
        title: '挑战：统计数字字符的个数',
        brief: '读入一个字符串，统计里面有多少个数字字符（0~9）。\n输入 a1b2c3 时输出：数字字符有 3 个',
        starter: String.raw`#include <stdio.h>
#include <string.h>

int main() {
    char s[100];
    scanf("%s", s);

    int count = 0;
    // 提示：'0' <= s[i] && s[i] <= '9'

    return 0;
}`,
        hints: ['字符也能比较大小，因为它们在内存里就是数字（\'0\' 是 48）。', '用 for 循环遍历到 \\0 为止。'],
        tests: [{ name: '输入 a1b2c3', stdin: 'a1b2c3', expect: '数字字符有 3 个' }],
        reward: { fish: 8, xp: 40 },
        solution: String.raw`#include <stdio.h>
#include <string.h>

int main() {
    char s[100];
    scanf("%s", s);

    int count = 0;
    for (int i = 0; s[i] != '\0'; i++) {
        if (s[i] >= '0' && s[i] <= '9') {
            count++;
        }
    }

    printf("数字字符有 %d 个\n", count);
    return 0;
}`
      }
    ]
  });

  LESSONS.push({
    id: 'L14',
    title: '第 14 课 · 函数',
    subtitle: '把代码打包，用起来更省心',
    minutes: 22,
    goals: ['会定义和调用函数', '理解返回值与参数', '会写 void 函数', '初步理解递归'],
    sections: [
      { type: 'text', h: '一、为什么要写函数', p: [
        '想求三个数的最大值，你可能写三段几乎一样的 if；下次还要用呢？复制粘贴三遍，改起来就要改三处。',
        '函数就是把「一段能完成某件事的代码」打包起来，起个名字，以后想用就叫它的名字。好处：复用、易读、易改、好测试。',
        '函数的形状：返回值类型 函数名(参数列表) { 函数体 }。'
      ]},
      { type: 'code', title: '定义、调用、返回', code: String.raw`#include <stdio.h>

// 定义：算出两个整数的和，并把结果交回去
int add(int a, int b) {
    return a + b;          // return 交出结果，同时结束函数
}

// 没有返回值就用 void
void line() {
    printf("----------\n");
}

// 求三个数的最大值（用了两次自己的比较逻辑）
int maxOf(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}

int main() {
    line();
    printf("3 + 4 = %d\n", add(3, 4));         // 调用：把 3、4 传进去
    printf("最大值 %d\n", maxOf(add(1, 2), 9));
    line();
    return 0;
}`,
        explain: [
          ['int add(int a, int b)', 'int 是返回类型；括号里的 a、b 是参数（函数内部的局部变量）。'],
          ['return', '把结果交回调用者并立刻结束函数。要返回值的函数，每个分支都要能 return。'],
          ['调用 add(3, 4)', '实参 3、4 会按顺序复制给形参 a、b。传的是「值」，所以函数里改 a、b 不会影响外面的 3、4。'],
          ['void', '表示「这个函数不返回任何东西」，例如只负责打印的函数。'],
          ['函数要先出现', '函数定义要写在调用它的代码之前（或者先写函数声明）。']
        ]},

      { type: 'text', h: '二、递归：函数自己调用自己', p: [
        '递归函数在解决问题时会调用自己，把问题变小一点。比如阶乘：5! = 5 × 4!，4! = 4 × 3! … 直到 1! = 1 为止。',
        '写递归必须有一件事想清楚：什么时候停下来（这叫终止条件）。没有终止条件就会一路调用下去，直到崩溃。'
      ]},

      { type: 'code', title: '递归求阶乘', code: String.raw`int fact(int n) {
    if (n <= 1) {
        return 1;              // ① 终止条件：这是递归的“刹车”
    }
    return n * fact(n - 1);    // ② 把大问题变小：n! = n × (n-1)!
}

int main() {
    printf("%d\n", fact(5));   // 120
    return 0;
}` },

      { type: 'mistakes', title: '常见错误', items: [
        { bad: '忘了写 return', why: '函数会返回不确定的值（我们的解释器会提示你）', fix: '每个分支都写 return，或者在末尾再补一个' },
        { bad: '参数个数或类型不对', why: '调用时给的东西要和定义时的参数对得上', fix: '数一数括号里的参数个数，类型尽量一致' },
        { bad: '递归忘了终止条件', why: '会无限调用自己直到爆栈', fix: '第一行就写 if (n <= 1) return 1; 这样的刹车' },
        { bad: '以为函数里改了参数，外面也会变', why: 'C 语言默认是「按值传递」，传进去的是副本', fix: '想让外面跟着变，就要传指针（下一课的内容）' }
      ]}
    ],
    tasks: [
      {
        id: 'L14-T1',
        title: '任务 1：写一个加法函数',
        brief: '写一个函数 int add(int a, int b) 返回两数之和，在 main 里调用它，输出：\n3 + 4 = 7\n10 + 25 = 35',
        starter: String.raw`#include <stdio.h>

// 在这里定义 add 函数


int main() {
    printf("3 + 4 = %d\n", add(3, 4));
    printf("10 + 25 = %d\n", add(10, 25));
    return 0;
}`,
        hints: ['函数定义要写在 main 之前。', '函数体里只要一句 return a + b;'],
        mustInclude: [{ re: /int\s+add\s*\(/, label: 'add 函数' }],
        tests: [{ name: '两行输出都正确', expect: '3 + 4 = 7\n10 + 25 = 35' }],
        reward: { fish: 7, xp: 35 },
        solution: String.raw`#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main() {
    printf("3 + 4 = %d\n", add(3, 4));
    printf("10 + 25 = %d\n", add(10, 25));
    return 0;
}`
      },
      {
        id: 'L14-T2',
        title: '任务 2：写一个判断素数的函数',
        brief: '写函数 int isPrime(int n)：是素数返回 1，否则返回 0。\n读入一个整数并输出判断结果：\n17 是素数\n20 不是素数',
        starter: String.raw`#include <stdio.h>

// 在这里定义 isPrime
// 提示：2 是最小的素数；从 2 试到 n/2 或 sqrt(n)


int main() {
    int n;
    scanf("%d", &n);

    if (isPrime(n)) {
        printf("%d 是素数\n", n);
    } else {
        printf("%d 不是素数\n", n);
    }
    return 0;
}`,
        hints: ['如果 n < 2，直接返回 0。', '循环 for (int i = 2; i * i <= n; i++)，如果 n % i == 0 就返回 0；循环结束返回 1。'],
        mustInclude: [{ re: /int\s+isPrime\s*\(/, label: 'isPrime 函数' }],
        tests: [
          { name: '输入 17', stdin: '17', expect: '17 是素数' },
          { name: '输入 20', stdin: '20', expect: '20 不是素数' },
          { name: '输入 2', stdin: '2', expect: '2 是素数' }
        ],
        reward: { fish: 8, xp: 45 },
        solution: String.raw`#include <stdio.h>

int isPrime(int n) {
    if (n < 2) {
        return 0;
    }
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            return 0;
        }
    }
    return 1;
}

int main() {
    int n;
    scanf("%d", &n);

    if (isPrime(n)) {
        printf("%d 是素数\n", n);
    } else {
        printf("%d 不是素数\n", n);
    }
    return 0;
}`
      },
      {
        id: 'L14-T3',
        title: '任务 3：函数的返回值可以再当参数',
        brief: '写一个函数 int maxOf(int a, int b) 返回较大的那个数。\n利用它，求 12、45、7 三个数里的最大值，输出：\n三个数中最大的是 45',
        starter: String.raw`#include <stdio.h>

// 定义 maxOf


int main() {
    int a = 12, b = 45, c = 7;

    // 先把其中两个比较，拿结果再去和第三个比较

    return 0;
}`,
        hints: ['maxOf(maxOf(a, b), c) 就能一次拿到三个数的最大值。', '想想为什么这样能成立：第一次比较的结果又成为了下一次的参数。'],
        tests: [{ name: '最大值正确', expect: '三个数中最大的是 45' }],
        reward: { fish: 8, xp: 40 },
        solution: String.raw`#include <stdio.h>

int maxOf(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}

int main() {
    int a = 12, b = 45, c = 7;
    int max = maxOf(maxOf(a, b), c);
    printf("三个数中最大的是 %d\n", max);
    return 0;
}`
      },
      {
        id: 'L14-T4',
        title: '挑战：递归求阶乘',
        brief: '用递归写 int fact(int n)，计算 6 的阶乘，输出：\n6 的阶乘是 720',
        starter: String.raw`#include <stdio.h>

int fact(int n) {
    // 别忘了终止条件！

}


int main() {
    printf("6 的阶乘是 %d\n", fact(6));
    return 0;
}`,
        hints: ['n <= 1 时返回 1。', '否则返回 n * fact(n - 1)。'],
        mustInclude: [{ re: /fact\s*\(\s*n\s*-\s*1\s*\)/, label: '递归调用 fact(n - 1)', hint: '在函数内部调用自己：fact(n - 1)。' }],
        tests: [{ name: '阶乘正确', expect: '6 的阶乘是 720' }],
        reward: { fish: 9, xp: 45 },
        solution: String.raw`#include <stdio.h>

int fact(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * fact(n - 1);
}

int main() {
    printf("6 的阶乘是 %d\n", fact(6));
    return 0;
}`
      }
    ]
  });

  LESSONS.push({
    id: 'L15',
    title: '第 15 课 · 指针入门',
    subtitle: '认识「地址」，让函数真正改变外面的变量',
    minutes: 25,
    goals: ['理解 & 和 * 的含义', '会声明和使用指针变量', '会用指针让函数修改外部变量', '会用指针遍历数组'],
    sections: [
      { type: 'text', h: '一、每个盒子都有一个门牌号', p: [
        '变量在内存里占据一块空间，这块空间有一个编号，叫地址。&a 就是「取 a 的地址」。',
        '指针是一种专门用来保存地址的变量：int *p 表示「p 是一个指针，它指向一个 int」。',
        '*p 表示「p 指向的那个盒子里的东西」，可以对它读，也可以对它写。'
      ]},
      { type: 'code', title: '指针的基本动作', code: String.raw`#include <stdio.h>

int main() {
    int a = 10;
    int *p = &a;      // p 记住了 a 的地址（p 指向 a）

    printf("%d\n", a);    // 10
    printf("%d\n", *p);   // 10   *p 就是 a

    *p = 99;              // 通过指针改 a 的值
    printf("%d\n", a);    // 99   a 真的被改了

    int b = 5;
    p = &b;               // 指针可以换一个目标
    printf("%d\n", *p);   // 5
    return 0;
}`,
        explain: [
          ['int *p = &a;', '声明时星号表示「p 是指针」；&a 是 a 的地址。两者结合就是「p 指向 a」。'],
          ['*p 用在右边', '取出 p 指向的值（读）。'],
          ['*p 用在左边', '*p = 99; 就是往 p 指向的盒子写（写），等价于 a = 99;。'],
          ['为什么函数需要指针', '因为函数参数是「复制」的。想让函数改到外面的变量，就得把地址传进去，函数再顺着地址去改。']
        ]},

      { type: 'code', title: '指针的两大经典用法', code: String.raw`// 用法一：让函数真正交换外面的两个变量
void swap(int *x, int *y) {
    int t = *x;    // 取出 x 指向的值
    *x = *y;
    *y = t;
}
// 调用：swap(&a, &b);   注意要传地址

// 用法二：用指针遍历数组
int a[5] = {1, 2, 3, 4, 5};
int *p = a;                  // 数组名就是首元素的地址
for (int i = 0; i < 5; i++) {
    printf("%d ", *(p + i)); // p + i 表示「往后走 i 个元素」
}
// 也可以 p++ 一个个往后挪`,
        explain: [
          ['swap(&a, &b)', '传进去的是地址，所以函数里能改到外面的 a、b。'],
          ['int *p = a;', '数组名会自动变成「指向第一个元素的指针」。'],
          ['*(p + i)', '等价于 a[i]，只是换了一种写法。'],
          ['指针加减', 'p + 1 不是加 1 个字节，而是「往后挪一个元素」。']
        ]},

      { type: 'mistakes', title: '常见错误', items: [
        { bad: '指针没有初始化就使用', why: '里面是垃圾地址，读写会崩溃', fix: '要么 int *p = &a; 要么 int *p = NULL;（空指针不能解引用）' },
        { bad: '指针跑出数组范围', why: '会读到别的变量的数据，甚至崩溃', fix: '循环次数别超过数组长度；我们的解释器会拦下越界' },
        { bad: '指针类型和目标的类型不一致', why: 'int *p 应该指向 int，别指向 double', fix: '类型要对应：int 配 int *，double 配 double *' },
        { bad: '以为 int *p, q; 里 q 也是指针', why: '星号只跟着 p，q 是普通 int', fix: '写成 int *p, *q; 或分成两行写清楚' }
      ]}
    ],
    tasks: [
      {
        id: 'L15-T1',
        title: '任务 1：用指针交换',
        brief: '写一个函数 void swap(int *x, int *y)，交换两个变量的值。\n已知 a = 3，b = 8，调用后输出：\n交换后 a=8 b=3',
        starter: String.raw`#include <stdio.h>

void swap(int *x, int *y) {
    // 用 *x、*y 完成交换

}

int main() {
    int a = 3, b = 8;

    swap(&a, &b);

    printf("交换后 a=%d b=%d\n", a, b);
    return 0;
}`,
        hints: ['借助一个临时变量：int t = *x; *x = *y; *y = t;', '注意调用时要写 swap(&a, &b)，传的是地址。'],
        mustInclude: [{ re: /void\s+swap\s*\(\s*int\s*\*\s*\w+/, label: '以指针为参数的 swap 函数' }],
        tests: [{ name: '交换成功', expect: '交换后 a=8 b=3' }],
        reward: { fish: 9, xp: 45 },
        solution: String.raw`#include <stdio.h>

void swap(int *x, int *y) {
    int t = *x;
    *x = *y;
    *y = t;
}

int main() {
    int a = 3, b = 8;

    swap(&a, &b);

    printf("交换后 a=%d b=%d\n", a, b);
    return 0;
}`
      },
      {
        id: 'L15-T2',
        title: '任务 2：用指针遍历数组',
        brief: '用指针（而不是 a[i]）求数组 {4, 9, 2, 7, 5} 中的最大值，输出：\n最大值是 9',
        starter: String.raw`#include <stdio.h>

int main() {
    int a[5] = {4, 9, 2, 7, 5};
    int *p = a;
    int max = *p;

    // 用 *(p + i) 依次比较

    return 0;
}`,
        hints: ['for (int i = 1; i < 5; i++)，比较 *(p + i)。', '想想 max 初始化成 *p 是什么意思。'],
        mustInclude: [{ re: /\*\s*\(\s*p\s*\+/, label: '指针取值 *(p + i)', hint: '这道题要求用 *(p + i) 访问数组元素。' }],
        tests: [{ name: '最大值正确', expect: '最大值是 9' }],
        reward: { fish: 9, xp: 45 },
        solution: String.raw`#include <stdio.h>

int main() {
    int a[5] = {4, 9, 2, 7, 5};
    int *p = a;
    int max = *p;

    for (int i = 1; i < 5; i++) {
        if (*(p + i) > max) {
            max = *(p + i);
        }
    }

    printf("最大值是 %d\n", max);
    return 0;
}`
      },
      {
        id: 'L15-T3',
        title: '任务 3：让函数返回多个结果',
        brief: '写一个函数 void minMax(int *arr, int n, int *min, int *max)，一次算出数组的最小值和最大值。\n读入 5 个整数，输出：\n最小值 3，最大值 88',
        starter: String.raw`#include <stdio.h>

void minMax(int *arr, int n, int *min, int *max) {
    *min = arr[0];
    *max = arr[0];

    // 循环比较，把结果写进 *min 和 *max

}

int main() {
    int a[5];
    for (int i = 0; i < 5; i++) {
        scanf("%d", &a[i]);
    }

    int lo, hi;
    minMax(a, 5, &lo, &hi);

    printf("最小值 %d，最大值 %d\n", lo, hi);
    return 0;
}`,
        hints: ['函数里：if (arr[i] < *min) *min = arr[i];', '这就是「C 语言一个函数只能返回一个值」的绕过办法：把结果写到指针指向的变量里。'],
        mustInclude: [{ re: /void\s+minMax\s*\(/, label: 'minMax 函数' }],
        tests: [{ name: '输入 5 个数', stdin: '3 45 12 88 7', expect: '最小值 3，最大值 88' }],
        reward: { fish: 10, xp: 50 },
        solution: String.raw`#include <stdio.h>

void minMax(int *arr, int n, int *min, int *max) {
    *min = arr[0];
    *max = arr[0];

    for (int i = 1; i < n; i++) {
        if (arr[i] < *min) {
            *min = arr[i];
        }
        if (arr[i] > *max) {
            *max = arr[i];
        }
    }
}

int main() {
    int a[5];
    for (int i = 0; i < 5; i++) {
        scanf("%d", &a[i]);
    }

    int lo, hi;
    minMax(a, 5, &lo, &hi);

    printf("最小值 %d，最大值 %d\n", lo, hi);
    return 0;
}`
      }
    ]
  });

  LESSONS.push({
    id: 'L16',
    title: '第 16 课 · 毕业项目',
    subtitle: '把学到的东西串起来：成绩统计小系统',
    minutes: 30,
    goals: ['学会把大需求拆成小步骤', '综合运用数组、循环、条件、函数', '体验「先设计再写码」的流程', '认识接下来的学习方向'],
    sections: [
      { type: 'text', h: '一、拿到需求先别急着写代码', p: [
        '项目需求：读入一个班级的人数 n，再读入 n 个成绩，输出人数、平均分、最高分、及格人数。',
        '第一步永远是拆解：① 读人数 n；② 开一个数组存成绩；③ 循环读入并顺手累加总和、记录最高分、统计及格人数；④ 按格式输出。',
        '拆成了四步之后，每一步都很小，写起来就不慌了。这就是编程最核心的能力：把大问题变成一串小问题。'
      ]},
      { type: 'code', title: '参考的骨架（自己动手补全会更有收获）', code: String.raw`#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);

    int scores[100];        // 先假设最多 100 人
    int sum = 0;
    int max = 0;
    int pass = 0;

    for (int i = 0; i < n; i++) {
        scanf("%d", &scores[i]);
        sum += scores[i];
        if (scores[i] > max) max = scores[i];
        if (scores[i] >= 60) pass++;
    }

    printf("共 %d 人\n", n);
    printf("平均分 %.2f\n", (double)sum / n);   // 注意别用整数除法
    printf("最高分 %d\n", max);
    printf("及格 %d 人\n", pass);
    return 0;
}` },
      { type: 'text', h: '二、接下来学什么', p: [
        '① 结构体 struct：把「姓名 + 分数 + 学号」打包成一种新类型，成绩系统就能装下真实的学生信息。',
        '② 字符串的更多用法、文件读写：把数据存进文件、从文件读出来，程序就有了「记忆」。',
        '③ 动态内存 malloc / free：数组大小不再写死，想要多少就申请多少。',
        '④ 算法与数据结构：排序、查找、链表、递归与分治。这些才是「写出好程序」的关键。',
        '⑤ 工具：装一个真正的编译器吧。Windows 上可以选 Dev-C++、Code::Blocks，或者 VS Code + MinGW(gcc)；在命令行里 gcc hello.c -o hello 就能编译。',
        '⑥ 练习平台：洛谷、力扣（LeetCode）、Codeforces 都能找到大量题目，从最简单的开始刷。'
      ]},
      { type: 'code', title: '一个「真正的 C 程序」长什么样', code: String.raw`// 保存成 hello.c，然后在命令行里执行：
//   gcc hello.c -o hello
//   ./hello          （Windows 上是 hello.exe）

#include <stdio.h>

int main(int argc, char *argv[]) {
    printf("你好，这是我的第一个真程序！\n");
    return 0;
}` },
      { type: 'tip', text: '捉虫（debugging）的能力比写代码的能力更值钱。遇到 bug 时：先看报错的行号 → 从第一处报错改起 → 每次只改一个地方 → 改完立刻运行验证。这套流程用熟了，你就已经比很多人强了。' }
    ],
    tasks: [
      {
        id: 'L16-T1',
        title: '毕业任务 1：成绩统计系统',
        brief: '读入一个班的人数 n（第一行），再读入 n 个成绩（第二行，用空格分开），输出：\n共 5 人\n平均分 82.20\n最高分 95\n及格 5 人\n输入示例：\n5\n88 92 76 95 60',
        starter: String.raw`#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);

    // 用数组存成绩，一边读一边统计

    return 0;
}`,
        hints: [
          '平均分要写 (double)sum / n，否则会得到整数。',
          '及格人数：成绩 >= 60 就 pass++。',
          '数组可以开 100 足够大（本题 n 不会超过 100）。'
        ],
        tests: [
          { name: '输入 5 个成绩', stdin: '5\n88 92 76 95 60', expect: '共 5 人\n平均分 82.20\n最高分 95\n及格 5 人' },
          { name: '输入 3 个成绩', stdin: '3\n100 59 60', expect: '共 3 人\n平均分 73.00\n最高分 100\n及格 2 人' }
        ],
        reward: { fish: 12, xp: 60 },
        solution: String.raw`#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);

    int scores[100];
    int sum = 0;
    int max = 0;
    int pass = 0;

    for (int i = 0; i < n; i++) {
        scanf("%d", &scores[i]);
        sum += scores[i];
        if (scores[i] > max) {
            max = scores[i];
        }
        if (scores[i] >= 60) {
            pass++;
        }
    }

    printf("共 %d 人\n", n);
    printf("平均分 %.2f\n", (double)sum / n);
    printf("最高分 %d\n", max);
    printf("及格 %d 人\n", pass);
    return 0;
}`
      },
      {
        id: 'L16-T2',
        title: '毕业任务 2：用函数拆分它',
        brief: '把上面任务里的「求平均分」写成一个函数 double average(int *arr, int n)，并在 main 里调用它。\n输出要和使用函数前完全一样。',
        starter: String.raw`#include <stdio.h>

// 在这里写 double average(int *arr, int n)


int main() {
    int n;
    scanf("%d", &n);

    int scores[100];
    for (int i = 0; i < n; i++) {
        scanf("%d", &scores[i]);
    }

    // 用 average(scores, n) 拿到平均分再打印

    return 0;
}`,
        hints: ['函数里用循环累加，最后 return (double)sum / n;', '数组传给函数时，其实传的是首元素的地址，所以形参写成 int *arr。'],
        mustInclude: [{ re: /double\s+average\s*\(/, label: 'average 函数' }],
        tests: [{ name: '平均分正确', stdin: '4\n90 80 70 60', expect: '平均分 75.00' }],
        reward: { fish: 10, xp: 50 },
        solution: String.raw`#include <stdio.h>

double average(int *arr, int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }
    return (double)sum / n;
}

int main() {
    int n;
    scanf("%d", &n);

    int scores[100];
    for (int i = 0; i < n; i++) {
        scanf("%d", &scores[i]);
    }

    printf("平均分 %.2f\n", average(scores, n));
    return 0;
}`
      },
      {
        id: 'L16-T3',
        title: '毕业任务 3：猜数字小游戏的雏形',
        brief: '用 rand() 生成 5 个 1~100 的随机数并逐行打印（要求先 srand(1) 让结果可复现，方便老师判题）。',
        starter: String.raw`#include <stdio.h>
#include <stdlib.h>

int main() {
    srand(1);

    // 循环 5 次，每次打印 rand() % 100 + 1

    return 0;
}`,
        hints: ['rand() % 100 得到 0~99，再 +1 就是 1~100。', '真正的游戏里会用 srand(time(NULL)) 让每次运行都不一样。'],
        mustInclude: [{ re: /rand\s*\(\s*\)/, label: 'rand() 函数' }, { re: /srand\s*\(/, label: 'srand 播种' }],
        tests: [{ name: '打印了 5 个随机数', expectRegex: '^(\\d+\\n){4}\\d+$' }],
        reward: { fish: 10, xp: 50 },
        solution: String.raw`#include <stdio.h>
#include <stdlib.h>

int main() {
    srand(1);

    for (int i = 0; i < 5; i++) {
        printf("%d\n", rand() % 100 + 1);
    }
    return 0;
}`
      },
      {
        id: 'L16-T4',
        title: '毕业任务 4：斐波那契（递归收官）',
        brief: '用递归写 int fib(int n)：前两项都是 1，从第三项开始每项等于前两项之和。\n读入 n，输出：\n第 10 项是 55',
        starter: String.raw`#include <stdio.h>

int fib(int n) {
    // 终止条件：n <= 2 时返回 1

}


int main() {
    int n;
    scanf("%d", &n);

    printf("第 %d 项是 %d\n", n, fib(n));
    return 0;
}`,
        hints: ['终止条件：if (n <= 2) return 1;', '递归：return fib(n - 1) + fib(n - 2);'],
        mustInclude: [{ re: /fib\s*\(\s*n\s*-\s*1\s*\)/, label: '递归调用 fib(n - 1)' }],
        tests: [
          { name: '输入 10', stdin: '10', expect: '第 10 项是 55' },
          { name: '输入 1', stdin: '1', expect: '第 1 项是 1' }
        ],
        reward: { fish: 12, xp: 60 },
        solution: String.raw`#include <stdio.h>

int fib(int n) {
    if (n <= 2) {
        return 1;
    }
    return fib(n - 1) + fib(n - 2);
}

int main() {
    int n;
    scanf("%d", &n);

    printf("第 %d 项是 %d\n", n, fib(n));
    return 0;
}`
      }
    ]
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);