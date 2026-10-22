/*!
 * 粉猫捉虫 · 函数题海（二）：stdlib.h / ctype.h
 * 原创题；输出题由真实 gcc 编译运行复核。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var D = CC.DRILLS || (CC.DRILLS = []);
  function add(o) { D.push(o); }

  // ======================= stdlib.h =======================
  add({ id: 'd-stdlib-01', header: 'stdlib.h', level: 1, kind: 'concept',
    q: 'rand() 返回的随机整数范围是？',
    options: ['0 ~ RAND_MAX（至少 32767）', '1 ~ 100', '-1 ~ 1', '0.0 ~ 1.0'],
    answer: 0,
    explain: 'rand 返回 0 到 RAND_MAX 之间的伪随机整数，RAND_MAX 至少是 32767。要别的范围就自己取模，比如 rand() % 100 + 1。' });

  add({ id: 'd-stdlib-02', header: 'stdlib.h', level: 1, kind: 'concept',
    q: 'srand(time(NULL)); 的作用是？',
    options: ['给随机数设置种子，让每次运行得到不同的序列', '生成一个随机数', '让程序暂停一秒钟', '清空随机数'],
    answer: 0,
    explain: 'srand 设置随机数种子；用 time(NULL) 当前时间做种子，每次运行的结果都会不同。整程序通常只调用一次 srand。' });

  add({ id: 'd-stdlib-03', header: 'stdlib.h', level: 2, kind: 'concept',
    q: '想让 rand() 产生 1 ~ 100 的整数，应该写？',
    options: ['rand() % 100 + 1', 'rand() % 101', 'rand() % 100', 'rand() / 100'],
    answer: 0,
    explain: 'rand() % 100 得到 0~99，再 +1 就是 1~100。' });

  add({ id: 'd-stdlib-04', header: 'stdlib.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <stdlib.h>\nint main(void) {\n    int n = atoi("123abc");\n    printf("%d", n);\n    return 0;\n}',
    options: ['123', '0', '1', '123abc'],
    answer: 0,
    explain: 'atoi 转换开头的数字部分，遇到非数字字符就停下，所以 "123abc" 得到 123。' });

  add({ id: 'd-stdlib-05', header: 'stdlib.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <stdlib.h>\nint main(void) {\n    printf("%d", atoi("abc"));\n    return 0;\n}',
    options: ['0', '-1', '1', '未定义行为'],
    answer: 0,
    explain: 'atoi 一个数字都没读到就返回 0。注意它无法区分「输入就是 0」和「输入非法」，所以它不告诉你失败。' });

  add({ id: 'd-stdlib-06', header: 'stdlib.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <stdlib.h>\nint main(void) {\n    printf("%.2f", atof("3.14xyz"));\n    return 0;\n}',
    options: ['3.14', '3.00', '0.00', '3.14159'],
    answer: 0,
    explain: 'atof 转换开头的小数部分，遇到 x 就停下，得到 3.14。' });

  add({ id: 'd-stdlib-07', header: 'stdlib.h', level: 2, kind: 'concept',
    q: 'strtol 比 atoi 更好的地方是？',
    options: ['可以通过 endptr 判断是否转换成功、停在了哪里', '速度更快', '能读小数', '不需要字符串'],
    answer: 0,
    explain: 'strtol 的第二个参数 endptr 会指向第一个没被转换的字符，你能据此判断输入是否合法；atoi 失败只返回 0，无法区分。' });

  add({ id: 'd-stdlib-08', header: 'stdlib.h', level: 2, kind: 'concept',
    q: 'malloc 申请失败时会返回什么？',
    options: ['NULL', '-1', '0 字节内存块', '程序自动重试'],
    answer: 0,
    explain: 'malloc 失败返回 NULL，使用前必须判断：if (p == NULL) { ... }，否则后面解引用会崩溃。' });

  add({ id: 'd-stdlib-09', header: 'stdlib.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <stdlib.h>\nint main(void) {\n    int *p = (int *)calloc(3, sizeof(int));\n    if (p == NULL) return 1;\n    printf("%d", p[0]);\n    free(p);\n    return 0;\n}',
    options: ['0', '随机值', '1', '3'],
    answer: 0,
    explain: 'calloc 会把新申请的内存全部清零，所以 p[0] 是 0（malloc 则不会清零）。' });

  add({ id: 'd-stdlib-10', header: 'stdlib.h', level: 3, kind: 'concept',
    q: 'int *p = malloc(...); p = realloc(p, newSize); 这种写法有什么风险？',
    options: ['如果 realloc 失败返回 NULL，原来的 p 就丢了，内存泄漏', 'realloc 不能调整大小', '会重复释放', '没有风险'],
    answer: 0,
    explain: 'realloc 失败时返回 NULL 且原内存仍然有效；直接覆盖 p 会丢掉原指针。应该先 int *q = realloc(p, n); if (q) p = q;。' });

  add({ id: 'd-stdlib-11', header: 'stdlib.h', level: 2, kind: 'concept',
    q: 'free(NULL); 会怎样？',
    options: ['什么也不做，是安全的', '崩溃', '释放整个堆', '编译错误'],
    answer: 0,
    explain: '标准规定 free(NULL) 什么也不做，所以把指针置 NULL 后再次 free 是安全的；但重复 free 非 NULL 指针是未定义行为。' });

  add({ id: 'd-stdlib-12', header: 'stdlib.h', level: 3, kind: 'concept',
    q: 'qsort 的比较函数应该返回什么？',
    options: ['a < b 返回负数，相等返回 0，a > b 返回正数', '只能返回 0 或 1', '返回两个元素的和', '返回数组长度'],
    answer: 0,
    explain: '比较函数的返回值只需要符号有意义（负/零/正）。用 (*(int*)a - *(int*)b) 写法简单，但两个数相差太大时可能溢出，严谨写法是分别判断大小。' });

  add({ id: 'd-stdlib-13', header: 'stdlib.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <stdlib.h>\nint main(void) {\n    printf("%d %ld", abs(-5), labs(-7L));\n    return 0;\n}',
    options: ['5 7', '-5 -7', '5 -7', '-5 7'],
    answer: 0,
    explain: 'abs 求 int 的绝对值，labs 求 long 的绝对值，结果都是正数。' });

  add({ id: 'd-stdlib-14', header: 'stdlib.h', level: 2, kind: 'concept',
    q: '在 main 函数里，exit(1) 和 return 1; 有什么区别？',
    options: ['exit 立刻结束整个程序；return 从 main 返回，同样会结束程序，但不会执行 exit 之后的代码', 'exit 只结束当前函数', 'return 不会结束程序', '完全一样，没有区别'],
    answer: 0,
    explain: '两者都会以状态码 1 结束程序。exit 会立即终止并刷新/关闭文件；在 main 里写 return 更自然。注意 exit 之后的代码不会执行。' });

  // ======================= ctype.h =======================
  add({ id: 'd-ctype-01', header: 'ctype.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <ctype.h>\nint main(void) {\n    printf("%d", isdigit(\'5\') != 0);\n    return 0;\n}',
    options: ['1', '0', '5', '非零值'],
    answer: 0,
    explain: 'isdigit(\'5\') 判断字符 \'5\' 是不是数字字符，成立返回非 0；!= 0 的结果就是 1。' });

  add({ id: 'd-ctype-02', header: 'ctype.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <ctype.h>\nint main(void) {\n    printf("%d", isdigit(5) != 0);\n    return 0;\n}',
    options: ['0', '1', '5', '未定义行为'],
    answer: 0,
    explain: 'isdigit 的参数是「字符的编码」。数字 5 是控制字符 ENQ，不是字符 \'5\'（ASCII 53），所以判断不成立。' });

  add({ id: 'd-ctype-03', header: 'ctype.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <ctype.h>\nint main(void) {\n    printf("%d %d", isalpha(\'A\') != 0, isalpha(\'1\') != 0);\n    return 0;\n}',
    options: ['1 0', '0 1', '1 1', '0 0'],
    answer: 0,
    explain: 'isalpha 判断英文字母：\'A\' 是字母，\'1\' 不是。' });

  add({ id: 'd-ctype-04', header: 'ctype.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <ctype.h>\nint main(void) {\n    printf("%d", isalnum(\'7\') != 0);\n    return 0;\n}',
    options: ['1', '0', '7', '未定义'],
    answer: 0,
    explain: 'isalnum 判断「字母或数字」，字符 \'7\' 是数字字符，成立。' });

  add({ id: 'd-ctype-05', header: 'ctype.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <ctype.h>\nint main(void) {\n    printf("%d %d", isspace(\' \') != 0, isspace(\'\\n\') != 0);\n    return 0;\n}',
    options: ['1 1', '1 0', '0 1', '0 0'],
    answer: 0,
    explain: 'isspace 判断空格类字符：空格、制表符、换行、回车等都算。' });

  add({ id: 'd-ctype-06', header: 'ctype.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <ctype.h>\nint main(void) {\n    printf("%d", isupper(\'a\') != 0);\n    return 0;\n}',
    options: ['0', '1', '2', '未定义'],
    answer: 0,
    explain: 'isupper 判断大写字母；\'a\' 是小写，所以不成立，!= 0 得到 0。' });

  add({ id: 'd-ctype-07', header: 'ctype.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <ctype.h>\nint main(void) {\n    printf("%c%c", toupper(\'a\'), toupper(\'1\'));\n    return 0;\n}',
    options: ['A1', 'a1', 'A0', 'AA'],
    answer: 0,
    explain: 'toupper 把 a~z 转成大写；不是小写字母的字符原样返回，所以 \'1\' 仍然是 \'1\'。' });

  add({ id: 'd-ctype-08', header: 'ctype.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <ctype.h>\nint main(void) {\n    printf("%c", tolower(\'Z\'));\n    return 0;\n}',
    options: ['z', 'Z', '90', '未定义'],
    answer: 0,
    explain: 'tolower 把大写字母转成小写，\'Z\' → \'z\'。' });

  add({ id: 'd-ctype-09', header: 'ctype.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <ctype.h>\nint main(void) {\n    printf("%d %d", ispunct(\'!\') != 0, ispunct(\'a\') != 0);\n    return 0;\n}',
    options: ['1 0', '0 1', '1 1', '0 0'],
    answer: 0,
    explain: 'ispunct 判断标点符号：\'!\' 是标点，\'a\' 不是。' });

  add({ id: 'd-ctype-10', header: 'ctype.h', level: 3, kind: 'concept',
    q: '关于 ctype 函数的返回值，下面哪种说法最准确？',
    options: ['成立时返回非 0 值（不保证正好是 1），不成立返回 0', '成立一定返回 1', '只返回 true/false 两个关键字', '失败时返回 -1'],
    answer: 0,
    explain: 'C 标准只保证「非 0 表示真」，不要写 if (isalpha(c) == 1)，应该写 if (isalpha(c))。' });

  add({ id: 'd-ctype-11', header: 'ctype.h', level: 3, kind: 'concept',
    q: '为什么调用 ctype 函数时，参数最好先转成 unsigned char？',
    options: ['如果 char 是负数（例如某些扩展字符），直接传可能超出函数允许的范围，属于未定义行为', '为了运行更快', '因为函数只接受字符串', '不转也能保证正确，标准允许任意 int'],
    answer: 0,
    explain: '标准要求参数能表示为 unsigned char 或等于 EOF。char 在有些平台是有符号的，传负值可能出问题，写成 isalpha((unsigned char)c) 更稳。' });

  add({ id: 'd-ctype-12', header: 'ctype.h', level: 2, kind: 'concept',
    q: 'isprint(\' \') 和 isgraph(\' \') 的结果分别是？',
    options: ['isprint 为真，isgraph 为假', '两个都为真', '两个都为假', 'isprint 为假，isgraph 为真'],
    answer: 0,
    explain: 'isprint 包含空格（可打印字符），isgraph 不包含空格（可打印且非空格）。' });

  add({ id: 'd-ctype-13', header: 'ctype.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <ctype.h>\nint main(void) {\n    printf("%d", islower(\'z\') != 0);\n    return 0;\n}',
    options: ['1', '0', '26', '未定义'],
    answer: 0,
    explain: 'islower 判断小写字母，\'z\' 是小写，成立。' });
})(typeof globalThis !== 'undefined' ? globalThis : this);