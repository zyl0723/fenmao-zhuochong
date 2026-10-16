/*!
 * 粉猫捉虫 · 捉虫关卡（找 bug、修 bug）
 * 每一关都给一段「有小虫子」的代码，让你找出问题并修好。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var BUGS = CC.BUGS || (CC.BUGS = []);

  BUGS.push({
    id: 'B1',
    title: '失踪的分号',
    difficulty: 1,
    lesson: 'L1',
    brief: '小猫说：程序报错了，它说「缺少分号」。\n请修好它，让它打印出三行文字。',
    buggy: String.raw`#include <stdio.h>

int main() {
    printf("第一行\n")
    printf("第二行\n");
    printf("第三行\n");
    return 0;
}`,
    hint: '报错会告诉你第几行。看第 4 行：printf("第一行\\n") 后面少了什么？',
    learn: 'C 语言每条语句都要以分号 ; 结尾。',
    tests: [{ name: '三行都打印出来', expect: '第一行\n第二行\n第三行' }],
    fixed: String.raw`#include <stdio.h>

int main() {
    printf("第一行\n");
    printf("第二行\n");
    printf("第三行\n");
    return 0;
}`
  });

  BUGS.push({
    id: 'B2',
    title: '混进来的中文标点',
    difficulty: 1,
    lesson: 'L2',
    brief: '这段代码怎么看都正常，但编译器就是不认。\n找出那个「长得像但不是」的符号，修好它。',
    buggy: String.raw`#include <stdio.h>

int main() {
    printf("我要吃小鱼干！\n")；
    return 0;
}`,
    hint: '仔细看行尾的分号：它比其他标点更宽，那是中文输入法的分号。',
    learn: '中文标点和英文标点是不同的字符，代码里只能用英文半角标点。',
    tests: [{ name: '正常运行', expect: '我要吃小鱼干！' }],
    fixed: String.raw`#include <stdio.h>

int main() {
    printf("我要吃小鱼干！\n");
    return 0;
}`
  });

  BUGS.push({
    id: 'B3',
    title: '小数被打回了原形',
    difficulty: 1,
    lesson: 'L4',
    brief: '程序想打印圆周率，却只打印出一个 3。\n修好格式符，让它输出：圆周率约等于 3.14',
    buggy: String.raw`#include <stdio.h>

int main() {
    double pi = 3.14159;
    printf("圆周率约等于 %d\n", pi);
    return 0;
}`,
    hint: '打印小数要用 %f，想控制小数位数可以写 %.2f。',
    learn: 'printf 的格式符必须和数据类型对应：整数 %d，小数 %f。',
    tests: [{ name: '输出了 3.14', expect: '圆周率约等于 3.14' }],
    fixed: String.raw`#include <stdio.h>

int main() {
    double pi = 3.14159;
    printf("圆周率约等于 %.2f\n", pi);
    return 0;
}`
  });

  BUGS.push({
    id: 'B4',
    title: '平均分变成了整数',
    difficulty: 2,
    lesson: 'L4',
    brief: '三门课总分 241，平均分应该是 80.33，可是程序打印出了 80.00。\n找出原因并修好。',
    buggy: String.raw`#include <stdio.h>

int main() {
    int total = 241;
    printf("平均分是 %.2f\n", total / 3);
    return 0;
}`,
    hint: '两个整数相除，结果还是整数。要让算式里出现小数。',
    learn: '整数除法会丢掉小数部分。写 3.0 或者用 (double) 转换就能得到小数结果。',
    tests: [{ name: '平均分正确', expect: '平均分是 80.33' }],
    fixed: String.raw`#include <stdio.h>

int main() {
    int total = 241;
    printf("平均分是 %.2f\n", total / 3.0);
    return 0;
}`
  });

  BUGS.push({
    id: 'B5',
    title: '一个等号引发的血案',
    difficulty: 2,
    lesson: 'L7',
    brief: '程序要判断 x 是不是 0。x 本来就是 0，所以应该输出「x 是 0」。\n可是它输出了「x 不是 0」——条件里那个等号好像不太对。',
    buggy: String.raw`#include <stdio.h>

int main() {
    int x = 0;

    if (x = 0) {
        printf("x 是 0\n");
    } else {
        printf("x 不是 0\n");
    }
    return 0;
}`,
    hint: '条件里那个等号，是「赋值」还是「比较」？',
    learn: '一个 = 是赋值，两个 == 才是比较是否相等。这是 C 语言里最常见的一类 bug。',
    tests: [{ name: '判断正确', expect: 'x 是 0' }],
    fixed: String.raw`#include <stdio.h>

int main() {
    int x = 0;

    if (x == 0) {
        printf("x 是 0\n");
    } else {
        printf("x 不是 0\n");
    }
    return 0;
}`
  });

  BUGS.push({
    id: 'B6',
    title: '多跑了一次的循环',
    difficulty: 2,
    lesson: 'L11',
    brief: '程序要把 5 个数字打印出来，但它报了一个「数组下标越界」的错。\n找出循环条件的问题，让它正确打印：1 2 3 4 5',
    buggy: String.raw`#include <stdio.h>

int main() {
    int a[5] = {1, 2, 3, 4, 5};

    for (int i = 0; i <= 5; i++) {
        printf("%d ", a[i]);
    }
    return 0;
}`,
    hint: '5 个元素的数组，下标最大是几？想想 i <= 5 会访问到哪个下标。',
    learn: '数组下标从 0 开始，长度是 n 的数组最后一个下标是 n-1。循环条件应该写 i < n。',
    tests: [{ name: '打印 5 个数字', expect: '1 2 3 4 5' }],
    fixed: String.raw`#include <stdio.h>

int main() {
    int a[5] = {1, 2, 3, 4, 5};

    for (int i = 0; i < 5; i++) {
        printf("%d ", a[i]);
    }
    return 0;
}`
  });

  BUGS.push({
    id: 'B7',
    title: '停不下来的循环',
    difficulty: 2,
    lesson: 'L9',
    brief: '程序运行起来就不肯停了（提示「可能是死循环」）。\n请修好它，让它打印：1 2 3 4 5',
    buggy: String.raw`#include <stdio.h>

int main() {
    int i = 1;

    while (i <= 5) {
        printf("%d ", i);
    }
    return 0;
}`,
    hint: '循环的三个要素里，哪一件被漏掉了？',
    learn: '循环变量一定要在循环体里变化，否则条件永远成立。',
    tests: [{ name: '正常结束并打印', expect: '1 2 3 4 5' }],
    fixed: String.raw`#include <stdio.h>

int main() {
    int i = 1;

    while (i <= 5) {
        printf("%d ", i);
        i++;
    }
    return 0;
}`
  });

  BUGS.push({
    id: 'B8',
    title: '不肯停下的 switch',
    difficulty: 2,
    lesson: 'L8',
    brief: '程序想根据数字打印对应的中文数字。输入的数字是 1，本该只打印「一」。\n可它把后面几个都打印了出来。',
    buggy: String.raw`#include <stdio.h>

int main() {
    int n = 1;

    switch (n) {
        case 1:
            printf("一\n");
        case 2:
            printf("二\n");
        case 3:
            printf("三\n");
    }
    return 0;
}`,
    hint: '每个 case 处理完之后，应该写点什么让程序跳出 switch？',
    learn: 'case 少了 break 会「穿透」到下一个 case，这个特性有时有用，但多数时候是个 bug。',
    tests: [{ name: '只打印「一」', expect: '一' }],
    fixed: String.raw`#include <stdio.h>

int main() {
    int n = 1;

    switch (n) {
        case 1:
            printf("一\n");
            break;
        case 2:
            printf("二\n");
            break;
        case 3:
            printf("三\n");
            break;
    }
    return 0;
}`
  });

  BUGS.push({
    id: 'B9',
    title: '装不下的小盒子',
    difficulty: 2,
    lesson: 'L13',
    brief: '程序想存下字符串 "cat!"，但报错说字符串太长了。\n数一数：4 个字符需要几个位置？',
    buggy: String.raw`#include <stdio.h>

int main() {
    char s[4] = "cat!";
    printf("内容是 %s\n", s);
    return 0;
}`,
    hint: '字符串末尾还要留一个位置给看不见的 \\0。',
    learn: 'char 数组的长度至少是「字符个数 + 1」，多的那个位置放字符串结束标志 \\0。',
    tests: [{ name: '正常打印', expect: '内容是 cat!' }],
    fixed: String.raw`#include <stdio.h>

int main() {
    char s[5] = "cat!";
    printf("内容是 %s\n", s);
    return 0;
}`
  });

  BUGS.push({
    id: 'B10',
    title: '白忙一场的交换函数',
    difficulty: 3,
    lesson: 'L15',
    brief: '函数里明明交换了，回到 main 里却发现 a 和 b 一点没变。\n请让它真的交换，输出：交换后 a=2 b=1',
    buggy: String.raw`#include <stdio.h>

void swap(int a, int b) {
    int t = a;
    a = b;
    b = t;
}

int main() {
    int a = 1, b = 2;

    swap(a, b);

    printf("交换后 a=%d b=%d\n", a, b);
    return 0;
}`,
    hint: 'C 语言的参数是「复制」的。想让函数改到外面的变量，要把变量的地址传进去。',
    learn: '参数是按值传递的，函数里改形参不影响实参。要改变外部变量，就得用指针接收地址。',
    tests: [{ name: '真的交换了', expect: '交换后 a=2 b=1' }],
    fixed: String.raw`#include <stdio.h>

void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int main() {
    int a = 1, b = 2;

    swap(&a, &b);

    printf("交换后 a=%d b=%d\n", a, b);
    return 0;
}`
  });

  BUGS.push({
    id: 'B11',
    title: '被遮住的总和',
    difficulty: 3,
    lesson: 'L10',
    brief: '程序本来要算 1+2+3+4+5，结果打印出 0。\n看看循环里那行声明，它把外面的变量怎么了？',
    buggy: String.raw`#include <stdio.h>

int main() {
    int total = 0;

    for (int i = 1; i <= 5; i++) {
        int total = 0;      // 这一行有问题
        total += i;
    }

    printf("总和 %d\n", total);
    return 0;
}`,
    hint: '内层花括号里又声明了一个同名变量，它把外面的 total 挡住了（这叫变量遮蔽）。',
    learn: '在花括号里声明的变量只在那一对花括号里有效。同名变量会「遮住」外面的，循环结束就消失了。',
    tests: [{ name: '总和正确', expect: '总和 15' }],
    fixed: String.raw`#include <stdio.h>

int main() {
    int total = 0;

    for (int i = 1; i <= 5; i++) {
        total += i;
    }

    printf("总和 %d\n", total);
    return 0;
}`
  });

  BUGS.push({
    id: 'B12',
    title: '少给了一个值',
    difficulty: 1,
    lesson: 'L1',
    brief: '程序想打印「3 + 4 = 7」，可是运行时报错说格式里有个 % 没给值。\n补上缺的东西。',
    buggy: String.raw`#include <stdio.h>

int main() {
    int a = 3, b = 4;
    printf("%d + %d = %d\n", a, b);
    return 0;
}`,
    hint: '数一数格式字符串里有几个 %d，再数一数逗号后面有几个值。',
    learn: 'printf 的格式符个数必须和后面提供的值一一对应。',
    tests: [{ name: '输出正确', expect: '3 + 4 = 7' }],
    fixed: String.raw`#include <stdio.h>

int main() {
    int a = 3, b = 4;
    printf("%d + %d = %d\n", a, b, a + b);
    return 0;
}`
  });

  CC.BUGS = BUGS;
})(typeof globalThis !== 'undefined' ? globalThis : this);