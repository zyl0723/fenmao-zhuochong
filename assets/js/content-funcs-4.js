/*!
 * 粉猫捉虫 · C 函数手册（四）：其余常用头文件 + 语言本身的小工具
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var FUNCS = CC.FUNCS || (CC.FUNCS = []);
  var HEADERS = CC.FUNC_HEADERS || (CC.FUNC_HEADERS = {});

  HEADERS['stdbool.h'] = {
    id: 'stdbool.h', icon: '✅', title: '布尔值（C99）',
    summary: '让 C 语言有 bool、true、false 这三个名字，专门表示「真 / 假」。',
    when: '想让代码更像「人话」时使用：bool ok = true; 比 int ok = 1; 更好读。',
    tips: [
      'C 语言本身没有真正的 bool 类型（C99 才加）。',
      '本站解释器里 true 就是 1、false 就是 0，用 int 也能表示真假。',
      '判断时任何非 0 都算真，0 算假。'
    ],
    table: { title: 'bool 三兄弟', head: ['名字', '含义', '本站'], rows: [['bool', '布尔类型', '可用 int 代替'], ['true', '真（1）', '支持'], ['false', '假（0）', '支持']] }
  };

  HEADERS['stdint.h'] = {
    id: 'stdint.h', icon: '🔢', title: '固定宽度整数（C99）',
    summary: '提供「明确知道几个字节」的整数类型，比如 int8_t、int32_t、uint64_t。',
    when: '写协议、二进制文件、需要跨平台保证位数时使用。',
    tips: [
      '普通 int 的大小与平台有关；int32_t 则是固定的 4 字节。',
      'u 开头是无符号：uint8_t 范围 0~255。',
      '本站不支持这些类型名，但你可以用 int / long 理解概念。'
    ],
    table: { title: '常见固定宽度类型', head: ['类型', '字节', '范围'], rows: [['int8_t', '1', '-128 ~ 127'], ['uint8_t', '1', '0 ~ 255'], ['int16_t', '2', '-32768 ~ 32767'], ['int32_t', '4', '约 ±21 亿'], ['int64_t', '8', '约 ±9.2×10^18'], ['uint64_t', '8', '0 ~ 约 1.8×10^19']] }
  };

  HEADERS['stddef.h'] = {
    id: 'stddef.h', icon: '📐', title: '基础定义',
    summary: 'NULL、size_t、ptrdiff_t 这些「底层小定义」都在这儿。',
    when: '很多头文件会间接包含它；写通用代码、sizeof 相关逻辑时会遇到。',
    tips: [
      'NULL 表示空指针，本质上是 0。',
      'size_t 是无符号整数，sizeof 的结果就是它。',
      '本站支持 NULL。'
    ]
  };

  HEADERS['assert.h'] = {
    id: 'assert.h', icon: '🚨', title: '断言（调试）',
    summary: 'assert(条件) 在条件不成立时直接终止程序并报错，用来抓「不该发生」的情况。',
    when: '写函数内部检查、调试程序时使用，可以快速定位问题。',
    tips: [
      '发布版常用 #define NDEBUG 关掉 assert。',
      'assert 里不要写有副作用的代码（比如 i++），因为发布版可能不执行。',
      '本站不支持 assert，请用真正的编译器练习。'
    ]
  };

  HEADERS['float.h'] = {
    id: 'float.h', icon: '🎯', title: '浮点范围与精度',
    summary: '告诉你会浮点数的精度极限，比如 DBL_EPSILON、DBL_MAX。',
    when: '比较两个小数是否相等、判断精度误差时使用。',
    tips: [
      '小数有精度误差：0.1 + 0.2 不一定精确等于 0.3。',
      '比较小数通常写 fabs(a - b) < 1e-9，而不是 a == b。'
    ],
    table: { title: '常见浮点常量', head: ['常量', '含义'], rows: [['FLT_MAX', 'float 最大值'], ['DBL_MAX', 'double 最大值'], ['DBL_EPSILON', 'double 最小可分辨差值'], ['FLT_DIG', 'float 保证的十进制位数']] }
  };

  HEADERS['errno.h'] = {
    id: 'errno.h', icon: '🐞', title: '错误码',
    summary: 'errno 是一个全局变量，库函数出错时会把错误码放进去。',
    when: '文件、数学函数调用失败后，想知道「为什么失败」时使用。',
    tips: [
      'errno 不会自动清零，检查前最好先设为 0。',
      'errno 配合 perror / strerror 可以打印人类能读的错误信息。'
    ]
  };

  HEADERS['conio.h'] = {
    id: 'conio.h', icon: '🪟', title: '控制台输入（非标准）',
    summary: 'Windows 上常见的 getch()、kbhit()，能实现「按键立即响应、不等回车」。',
    when: '写 Windows 控制台小游戏时常用。',
    tips: [
      '它不是 C 标准库的一部分，Linux / macOS 上没有。',
      '想要跨平台，改用 termios 或 ncurses（属于进阶内容）。',
      '本站不支持 conio.h。'
    ]
  };

  HEADERS['语言本身'] = {
    id: '语言本身', icon: '🧠', title: '语言本身的小工具',
    summary: '不是函数，但每天都在用：sizeof、三目运算符、类型转换。',
    when: '想知道一个东西占多少内存、想写简短条件、想把类型临时换掉时使用。',
    tips: [
      'sizeof 是运算符，不是函数；sizeof(int) 是 4。',
      '三目：条件 ? 成立时的值 : 不成立时的值。',
      '强制类型转换：(int)3.9 得到 3。'
    ]
  };

  function add(o) { FUNCS.push(o); }

  add({ id: 'assert', name: 'assert', header: 'assert.h', level: 2, supported: false, tags: ['调试'],
    proto: 'void assert(int expression);',
    brief: '断言：条件为假时立刻终止程序并报出位置。',
    params: 'expression：你希望一定成立的条件。',
    returns: '没有返回值（条件为真时什么也不做）。',
    notes: ['用来抓「程序不该走到这里」的情况。', '发布时可用 #define NDEBUG 关掉。', '本站暂不支持。'],
    example: '#include <stdio.h>\n#include <assert.h>\n\nint main() {\n    int age = -1;\n    assert(age >= 0);\n    printf("不会执行到这里\\n");\n    return 0;\n}',
    related: [] });

  add({ id: 'NULL', name: 'NULL', header: 'stddef.h', kind: 'macro', level: 1, supported: true, tags: ['常量', '指针', '最常用'],
    proto: '#define NULL ((void*)0)',
    brief: '空指针常量，表示「这个指针没有指向任何东西」。',
    params: '没有参数。',
    returns: '0（空指针）。',
    notes: ['判断指针是否为空：if (p == NULL) {...}', '空指针不能解引用。', '本站支持 NULL。'],
    example: '#include <stdio.h>\n\nint main() {\n    int *p = NULL;\n    if (p == NULL) {\n        printf("这是一个空指针\\n");\n    }\n    return 0;\n}',
    related: ['malloc'] });

  add({ id: 'sizeof', name: 'sizeof', header: '语言本身', kind: 'operator', level: 1, supported: true, tags: ['内存', '最常用'],
    proto: 'sizeof(类型或表达式)',
    brief: '求一个类型或变量占多少个字节（运算符，不是函数）。',
    params: '类型名（如 int）或一个表达式。',
    returns: '字节数（size_t）。',
    notes: ['sizeof(int) 通常是 4，sizeof(double) 是 8，sizeof(char) 是 1。', '对数组用 sizeof 可以得到整个数组的字节数：sizeof(a)。', '数组长度可以这样算：sizeof(a) / sizeof(a[0])。'],
    example: '#include <stdio.h>\n\nint main() {\n    int a[5];\n    printf("%d %d %d\\n", sizeof(int), sizeof(a), sizeof(a) / sizeof(a[0]));\n    return 0;\n}',
    related: ['NULL'] });

  add({ id: 'ternary', name: '?: 三目运算符', header: '语言本身', kind: 'operator', level: 1, supported: true, tags: ['条件', '运算符'],
    proto: '条件 ? 值1 : 值2',
    brief: '条件成立取「值1」，否则取「值2」，用来写简短的条件表达式。',
    params: '一个条件、两个候选值。',
    returns: '被选中的那个值。',
    notes: ['适合简单选择；复杂逻辑还是用 if 更清楚。', '例子：max = a > b ? a : b;'],
    example: '#include <stdio.h>\n\nint main() {\n    int a = 7, b = 12;\n    int max = a > b ? a : b;\n    printf("%d\\n", max);\n    return 0;\n}',
    related: ['sizeof'] });

  CC.FUNCS = FUNCS;
})(typeof globalThis !== 'undefined' ? globalThis : this);