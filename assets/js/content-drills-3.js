/*!
 * 粉猫捉虫 · 函数题海（三）：math.h / limits.h / 综合
 * 原创题；输出题由真实 gcc 编译运行复核。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var D = CC.DRILLS || (CC.DRILLS = []);
  function add(o) { D.push(o); }

  // ======================= math.h =======================
  add({ id: 'd-math-01', header: 'math.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <math.h>\nint main(void) {\n    printf("%.2f", sqrt(16.0));\n    return 0;\n}',
    options: ['4.00', '8.00', '16.00', '2.00'],
    answer: 0,
    explain: 'sqrt 是开平方，16 的平方根是 4。' });

  add({ id: 'd-math-02', header: 'math.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <math.h>\nint main(void) {\n    printf("%.0f", pow(2, 10));\n    return 0;\n}',
    options: ['1024', '20', '100', '512'],
    answer: 0,
    explain: 'pow(base, exp) 求 base 的 exp 次方：2 的 10 次方是 1024。' });

  add({ id: 'd-math-03', header: 'math.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <math.h>\nint main(void) {\n    printf("%.2f %.2f", fabs(-2.5), fabs(2.5));\n    return 0;\n}',
    options: ['2.50 2.50', '-2.50 2.50', '2.00 2.00', '2.5 -2.5'],
    answer: 0,
    explain: 'fabs 求小数的绝对值，正负 2.5 的结果都是 2.50。' });

  add({ id: 'd-math-04', header: 'math.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <math.h>\nint main(void) {\n    printf("%.0f %.0f", floor(3.9), floor(-3.1));\n    return 0;\n}',
    options: ['3 -4', '4 -3', '3 -3', '4 -4'],
    answer: 0,
    explain: 'floor 向「更小」的方向取整：3.9 → 3，-3.1 → -4。' });

  add({ id: 'd-math-05', header: 'math.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <math.h>\nint main(void) {\n    printf("%.0f %.0f", ceil(3.1), ceil(-3.9));\n    return 0;\n}',
    options: ['4 -3', '3 -4', '4 -4', '3 -3'],
    answer: 0,
    explain: 'ceil 向「更大」的方向取整：3.1 → 4，-3.9 → -3。' });

  add({ id: 'd-math-06', header: 'math.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <math.h>\nint main(void) {\n    printf("%.0f %.0f", round(2.4), round(2.6));\n    return 0;\n}',
    options: ['2 3', '2 2', '3 3', '2 4'],
    answer: 0,
    explain: 'round 四舍五入到最近的整数：2.4 → 2，2.6 → 3。' });

  add({ id: 'd-math-07', header: 'math.h', level: 3, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <math.h>\nint main(void) {\n    printf("%.0f %.0f", trunc(3.9), trunc(-3.9));\n    return 0;\n}',
    options: ['3 -3', '4 -4', '3 -4', '4 -3'],
    answer: 0,
    explain: 'trunc 直接砍掉小数部分（向 0 取整）：3.9 → 3，-3.9 → -3。注意它和 floor 对负数的结果不同。' });

  add({ id: 'd-math-08', header: 'math.h', level: 3, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <math.h>\nint main(void) {\n    printf("%.1f", fmod(5.5, 2.0));\n    return 0;\n}',
    options: ['1.5', '1.0', '2.5', '0.5'],
    answer: 0,
    explain: 'fmod 是小数的取余：5.5 ÷ 2 = 2 余 1.5。整数的 % 不能用于小数。' });

  add({ id: 'd-math-09', header: 'math.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <math.h>\nint main(void) {\n    printf("%.2f %.2f %.2f", log(1.0), log10(1000.0), log2(8.0));\n    return 0;\n}',
    options: ['0.00 3.00 3.00', '1.00 3.00 8.00', '0.00 2.00 3.00', '1.00 10.00 8.00'],
    answer: 0,
    explain: 'log 是自然对数 ln，ln(1)=0；log10(1000)=3；log2(8)=3。' });

  add({ id: 'd-math-10', header: 'math.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <math.h>\nint main(void) {\n    printf("%.2f %.2f", exp(0.0), sin(0.0));\n    return 0;\n}',
    options: ['1.00 0.00', '0.00 1.00', '1.00 1.00', '2.72 0.00'],
    answer: 0,
    explain: 'exp(0) = e^0 = 1；sin(0) = 0。' });

  add({ id: 'd-math-11', header: 'math.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <math.h>\nint main(void) {\n    printf("%.2f %.2f", cos(0.0), atan2(1.0, 1.0));\n    return 0;\n}',
    options: ['1.00 0.79', '0.00 0.79', '1.00 1.57', '0.00 3.14'],
    answer: 0,
    explain: 'cos(0)=1；atan2(y, x) 求 (1,1) 的方向角，等于 π/4 ≈ 0.79 弧度。' });

  add({ id: 'd-math-12', header: 'math.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <math.h>\nint main(void) {\n    printf("%.1f", hypot(3.0, 4.0));\n    return 0;\n}',
    options: ['5.0', '7.0', '12.0', '25.0'],
    answer: 0,
    explain: 'hypot(x, y) 求直角三角形的斜边 √(x²+y²)：√(9+16)=5。' });

  add({ id: 'd-math-13', header: 'math.h', level: 3, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <math.h>\nint main(void) {\n    printf("%d %d", isnan(log(-1.0)) != 0, isinf(exp(1000.0)) != 0);\n    return 0;\n}',
    options: ['1 1', '0 1', '1 0', '0 0'],
    answer: 0,
    explain: 'log 的负参数超出定义域，结果是 NaN（不是数字）；exp(1000) 太大，溢出成无穷大 inf。isnan / isinf 成立时返回非 0（不一定正好是 1），所以这里用 != 0 得到 1。' });

  add({ id: 'd-math-14', header: 'math.h', level: 2, kind: 'concept',
    q: '求整数绝对值用 abs，求小数绝对值应该用？',
    options: ['fabs（math.h）', 'abs', 'sqrt', 'floor'],
    answer: 0,
    explain: 'abs 的参数是整数，传小数会被隐式转成整数（丢小数）；小数绝对值用 fabs。' });

  add({ id: 'd-math-15', header: 'math.h', level: 3, kind: 'concept',
    q: 'sqrt(-1.0) 在标准 C 里会怎样？',
    options: ['产生定义域错误，返回 NaN', '返回 -1', '返回 1', '编译失败'],
    answer: 0,
    explain: '负数开平方超出定义域，标准规定返回 NaN（具体实现可能同时设置 errno）。使用前应先判断参数 >= 0。' });

  add({ id: 'd-math-16', header: 'math.h', level: 3, kind: 'concept',
    q: '关于 M_PI，下面哪种说法是对的？',
    options: ['它不是 C 标准的一部分，是很多实现额外提供的扩展', '它一定存在于所有 C 编译器', '它是 math.h 里的函数', '它等于 22/7 的精确值'],
    answer: 0,
    explain: 'C 标准没有规定 M_PI；它常见于 POSIX/各平台扩展。可移植写法是自己 #define PI 3.14159265358979323846。' });

  // ======================= 综合 / limits.h =======================
  add({ id: 'd-misc-01', header: '综合', level: 2, kind: 'concept',
    q: 'int x = INT_MAX; x = x + 1; 会怎样？',
    options: ['有符号整数溢出，属于未定义行为', '变成 INT_MIN，安全', '变成 0', '会抛异常'],
    answer: 0,
    explain: '有符号整数溢出在 C 里是未定义行为（不能依赖「回绕」）。需要装更大的数时用 long long，或者先判断。' });

  add({ id: 'd-misc-02', header: '综合', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\nint main(void) {\n    printf("%d", (int)sizeof(char));\n    return 0;\n}',
    options: ['1', '2', '4', '平台相关，无法确定'],
    answer: 0,
    explain: 'sizeof(char) 标准规定恒为 1（一个字节）。' });

  add({ id: 'd-misc-03', header: '综合', level: 2, kind: 'concept',
    q: 'int 一定是 4 个字节吗？',
    options: ['不一定，标准只保证至少 16 位，常见平台是 4 字节', '一定 4 字节', '一定 2 字节', '一定 8 字节'],
    answer: 0,
    explain: 'C 标准只规定最小范围；具体大小依赖平台。用 sizeof(int) 查当前平台，或要固定宽度时用 stdint.h 的 int32_t。' });

  add({ id: 'd-misc-04', header: '综合', level: 1, kind: 'concept',
    q: 'time(NULL) 返回的是什么？',
    options: ['从 1970-01-01 起经过的秒数（time_t）', '当前年份', '当前毫秒数（总是）', '程序运行了多少秒'],
    answer: 0,
    explain: 'time 返回日历时间（通常是从 Unix 纪元起的秒数），类型是 time_t。给程序计时用 clock()。' });

  add({ id: 'd-misc-05', header: '综合', level: 1, kind: 'concept',
    q: '要写 srand(time(NULL)); 需要包含哪些头文件？',
    options: ['<stdlib.h> 和 <time.h>', '只要 <stdio.h>', '只要 <math.h>', '不需要头文件'],
    answer: 0,
    explain: 'srand 在 stdlib.h，time 在 time.h，两个都要 include。' });

  add({ id: 'd-misc-06', header: '综合', level: 2, kind: 'concept',
    q: 'NULL 表示什么？',
    options: ['空指针常量，表示指针不指向任何对象', '数字 0 的别名，只能用于整数', '空字符串', '未初始化的变量'],
    answer: 0,
    explain: 'NULL 是空指针常量（通常定义为 ((void*)0) 或 0）。判断指针是否有效用 if (p == NULL)，空指针不能解引用。' });

  add({ id: 'd-misc-07', header: '综合', level: 2, kind: 'concept',
    q: 'C99 里要使用 bool / true / false，需要？',
    options: ['#include <stdbool.h>', '#include <stdio.h>', '#include <boolean.h>', '什么都不用'],
    answer: 0,
    explain: 'stdbool.h 定义了 bool、true、false（内部就是整数 1/0）。本站解释器里 true/false 也可以直接用。' });

  add({ id: 'd-misc-08', header: '综合', level: 3, kind: 'concept',
    q: 'int x = -1; printf("%u", x); 在 32 位 unsigned int 的平台上通常会打印？',
    options: ['4294967295', '-1', '0', '1'],
    answer: 0,
    explain: '%u 按无符号整数解释；-1 的二进制全 1，按 32 位无符号就是 4294967295。用 %d/%u 要小心类型匹配。' });

  add({ id: 'd-misc-09', header: '综合', level: 3, kind: 'concept',
    q: 'LONG_MAX 的值？',
    options: ['平台相关：long 可能是 4 字节也可能是 8 字节', '一定是 2147483647', '一定是 9223372036854775807', '等于 INT_MAX'],
    answer: 0,
    explain: 'long 的大小由平台决定（Windows 常见 4 字节，64 位 Linux 常见 8 字节）。要固定宽度请用 stdint.h。' });

  add({ id: 'd-misc-10', header: '综合', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\nint main(void) {\n    int a[5];\n    printf("%d", (int)(sizeof(a) / sizeof(a[0])));\n    return 0;\n}',
    options: ['5', '4', '20', '0'],
    answer: 0,
    explain: 'sizeof(a) 是整个数组的字节数（5×4=20），sizeof(a[0]) 是一个元素的字节数（4），相除就是元素个数 5。' });

  add({ id: 'd-misc-11', header: '综合', level: 3, kind: 'concept',
    q: 'char 类型一定是有符号的吗？',
    options: ['不一定：char 是否有符号由实现决定', '一定是有符号的', '一定是无符号的', '一定是 8 位无符号'],
    answer: 0,
    explain: '标准只规定 char 至少 8 位，是否有符号由实现定义。需要明确符号时用 signed char / unsigned char。' });

  add({ id: 'd-misc-12', header: '综合', level: 2, kind: 'concept',
    q: 'scanf("%s", buf); 有什么潜在风险？',
    options: ['不限制长度，输入比 buf 长就会缓冲区溢出', '不能读空格', '不能读中文', '会自动分配内存'],
    answer: 0,
    explain: '%s 不知道 buf 多大，输入过长会写越界。应写 scanf("%19s", buf)（宽度 = 数组长度-1），或改用 fgets。' });
})(typeof globalThis !== 'undefined' ? globalThis : this);