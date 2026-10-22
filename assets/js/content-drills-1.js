/*!
 * 粉猫捉虫 · 函数题海（一）：stdio.h / string.h
 * 原创题；标准行为依据 ISO C 与 cppreference（见 CREDITS）。
 * 所有 kind: 'output' 的题都由真实 gcc 编译运行复核（tests/drills-gcc.test.mjs）。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var D = CC.DRILLS || (CC.DRILLS = []);
  function add(o) { D.push(o); }

  // ======================= stdio.h =======================
  add({ id: 'd-stdio-01', header: 'stdio.h', level: 1, kind: 'concept',
    q: 'printf("Hi"); 如果成功，它的返回值是多少？',
    options: ['2（打印出来的字符个数）', '0', '1', '没有返回值'],
    answer: 0,
    explain: 'printf 返回成功写出的字符数。"Hi" 是 2 个字符，所以返回 2；出错时返回负数。' });

  add({ id: 'd-stdio-02', header: 'stdio.h', level: 2, kind: 'concept',
    q: 'double x = 3.5; printf("%d", x); 会发生什么？',
    options: ['未定义行为：%d 要的是 int，传 double 类型不匹配', '输出 3', '输出 3.5', '编译一定失败'],
    answer: 0,
    explain: '"%d" 要求对应的参数是 int 类型。给 printf 传 double 属于未定义行为（可能输出乱码）。想打印 3，应该写 (int)x 并配 %d；想打印小数用 %f。' });

  add({ id: 'd-stdio-03', header: 'stdio.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\nint main(void) {\n    printf("[%5d][%-5d][%05d]", 42, 42, 42);\n    return 0;\n}',
    options: ['[   42][42   ][00042]', '[42   ][   42][42000]', '[42][42][42]', '[ 42 ][42  ][0042]'],
    answer: 0,
    explain: '%5d 右对齐、宽度 5；%-5d 左对齐、宽度 5；%05d 宽度 5、前面补 0。所以是 [   42][42   ][00042]。' });

  add({ id: 'd-stdio-04', header: 'stdio.h', level: 1, kind: 'output',
    q: 'printf("%.3f", 3.14159); 输出什么？',
    code: '#include <stdio.h>\nint main(void) {\n    printf("%.3f", 3.14159);\n    return 0;\n}',
    options: ['3.142', '3.141', '3', '3.1415'],
    answer: 0,
    explain: '%.3f 表示保留 3 位小数，并且会四舍五入：3.14159 → 3.142。' });

  add({ id: 'd-stdio-05', header: 'stdio.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\nint main(void) {\n    printf("100%% = %d%%", 100);\n    return 0;\n}',
    options: ['100% = 100%', '100%% = 100%%', '100% = 100%%', '100%% = 100%'],
    answer: 0,
    explain: 'printf 里 %% 表示输出一个百分号本身，所以两个 %% 都会变成一个 %。' });

  add({ id: 'd-stdio-06', header: 'stdio.h', level: 1, kind: 'concept',
    q: 'int a; scanf("%d", a); 的问题是什么？',
    options: ['少写了 &：scanf 需要变量的地址，应是 &a', '没有加换行符', '不能读 int', '应该用 %f'],
    answer: 0,
    explain: 'scanf 要把读到的值写进变量，所以需要地址，写成 scanf("%d", &a)。漏掉 & 属于未定义行为，可能直接崩溃。' });

  add({ id: 'd-stdio-07', header: 'stdio.h', level: 2, kind: 'concept',
    q: '先用 scanf("%d", &n) 读数字，再用 scanf("%c", &ch) 读字符，ch 很可能读到什么？',
    options: ['上一次输入留下的换行符 \\n', '数字 n 的最后一位', '空格', '程序会报错'],
    answer: 0,
    explain: '%d 读完数字后会把换行符留在输入缓冲区，%c 不会跳过空白，就把 \\n 读走了。写法改成 scanf(" %c", &ch)（%c 前加空格）可以跳过空白。' });

  add({ id: 'd-stdio-08', header: 'stdio.h', level: 2, kind: 'concept',
    q: 'int a, b; int n = scanf("%d %d", &a, &b); 如果两个整数都读成功，n 是多少？',
    options: ['2', '1', '0', 'EOF'],
    answer: 0,
    explain: 'scanf 返回成功赋值的项数，两个都成功就是 2。一个都没读到返回 0，遇到输入结束返回 EOF。' });

  add({ id: 'd-stdio-09', header: 'stdio.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\nint main(void) {\n    puts("A");\n    puts("B");\n    return 0;\n}',
    options: ['A\nB\n', 'AB', 'A\nB', 'A B'],
    answer: 0,
    explain: 'puts 会自动在字符串末尾补一个换行符，所以每行后面都有 \\n。' });

  add({ id: 'd-stdio-10', header: 'stdio.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\nint main(void) {\n    putchar(\'A\');\n    putchar(66);\n    putchar(\'\\n\');\n    return 0;\n}',
    options: ['AB\n', 'A66\n', 'AB', '66\n'],
    answer: 0,
    explain: 'putchar 输出一个字符；66 是字符 B 的 ASCII 码，所以输出 AB，再输出换行。' });

  add({ id: 'd-stdio-11', header: 'stdio.h', level: 2, kind: 'concept',
    q: 'getchar() 读到输入结束时返回什么？',
    options: ['EOF（通常是 -1）', '0', '空格', '\\n'],
    answer: 0,
    explain: 'getchar 的返回值是 int，读到输入结束返回 EOF（通常定义为 -1）。所以要用 int 接收，不能用 char，否则可能分不清 EOF。' });

  add({ id: 'd-stdio-12', header: 'stdio.h', level: 1, kind: 'concept',
    q: 'EOF 这个宏通常的值是？',
    options: ['-1', '0', '1', '255'],
    answer: 0,
    explain: '标准库里的 EOF 是一个负的整数常量，常见实现是 -1，用来表示「输入结束或出错」。' });

  add({ id: 'd-stdio-13', header: 'stdio.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\nint main(void) {\n    char buf[20];\n    int len = sprintf(buf, "%d+%d=%d", 2, 3, 5);\n    printf("%s|%d", buf, len);\n    return 0;\n}',
    options: ['2+3=5|5', '2+3=5|0', '2 3 5|5', '2+3=5|6'],
    answer: 0,
    explain: 'sprintf 把格式化结果写进 buf（"2+3=5"，共 5 个字符），并返回写出的字符数（不含 \\0）。' });

  add({ id: 'd-stdio-14', header: 'stdio.h', level: 2, kind: 'concept',
    q: '为什么现在不推荐用 gets() 读一行？',
    options: ['它不检查目标数组长度，容易造成缓冲区溢出', '它不能读空格', '它总会在末尾多加一个 \\0', '它在 C99 里被改名为 fgets'],
    answer: 0,
    explain: 'gets 不知道缓冲区有多大，输入过长就会写越界；它在 C11 中已经被移除。应该用 fgets(buf, sizeof(buf), stdin)。' });

  add({ id: 'd-stdio-15', header: 'stdio.h', level: 2, kind: 'concept',
    q: 'fopen("a.txt", "w") 和 fopen("a.txt", "a") 的区别是？',
    options: ['"w" 会清空原文件；"a" 在文件末尾追加', '"w" 只能读；"a" 只能写', '两个完全一样', '"w" 不会创建文件；"a" 会创建文件'],
    answer: 0,
    explain: '"w" 以写方式打开，文件存在会被截断清空；"a" 以追加方式打开，写入内容接在末尾。两个模式都可能创建不存在的文件。' });

  add({ id: 'd-stdio-16', header: 'stdio.h', level: 3, kind: 'concept',
    q: '用 fflush(stdin) 来「清空输入缓冲区」，在标准 C 里可以吗？',
    options: ['不可以：fflush 只对输出流有定义，fflush(stdin) 是未定义行为', '可以，标准里就是这么写的', '只能清空数字', '可以，但会清空文件'],
    answer: 0,
    explain: 'C 标准只规定 fflush 用于输出流；对输入流调用是未定义行为。清空输入要自己读掉字符（例如 while ((c = getchar()) != \'\\n\' && c != EOF) {}）。' });

  // ======================= string.h =======================
  add({ id: 'd-str-01', header: 'string.h', level: 1, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <string.h>\nint main(void) {\n    char s[] = "hello";\n    printf("%d %d", (int)strlen(s), (int)sizeof(s));\n    return 0;\n}',
    options: ['5 6', '6 6', '5 5', '6 5'],
    answer: 0,
    explain: 'strlen 数到 \\0 之前，共 5 个字符；sizeof(s) 是整个数组的字节数，"hello" 有 5 个字符 + 1 个 \\0 = 6。' });

  add({ id: 'd-str-02', header: 'string.h', level: 1, kind: 'concept',
    q: 'char s[5] = "hello"; 有什么问题？',
    options: ['数组太小：5 个字符还要再加 1 个 \\0，需要 6 个位置', '没有问题', '应该用 int 数组', '单引号才对'],
    answer: 0,
    explain: '字符串末尾必须有 \\0，所以 char s[5] 最多装 4 个字符。要装 "hello" 至少写 char s[6]，或者不写长度 char s[] = "hello";。' });

  add({ id: 'd-str-03', header: 'string.h', level: 1, kind: 'concept',
    q: 'strcpy(dest, src) 会复制哪些内容？',
    options: ['src 的字符以及结尾的 \\0', '只复制文字，不复制 \\0', '复制整个数组的全部字节', '复制后自动加两个 \\0'],
    answer: 0,
    explain: 'strcpy 会一直复制到 src 的 \\0，并且把 \\0 也复制过去。目标数组必须足够大。' });

  add({ id: 'd-str-04', header: 'string.h', level: 2, kind: 'concept',
    q: 'strncpy(dst, src, n) 在什么情况下可能「没有给 dst 补 \\0」？',
    options: ['src 的长度大于等于 n 时', 'src 的长度小于 n 时', '永远不会', 'n 等于 0 时一定会补'],
    answer: 0,
    explain: 'strncpy 最多复制 n 个字符；如果 src 长度 >= n，它不会额外补 \\0，需要自己写 dst[n] = \'\\0\'（并确保数组够大）。' });

  add({ id: 'd-str-05', header: 'string.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <string.h>\nint main(void) {\n    char s[20] = "ab";\n    strncat(s, "cdef", 2);\n    printf("%s", s);\n    return 0;\n}',
    options: ['abcd', 'abcdef', 'ab', 'cd'],
    answer: 0,
    explain: 'strncat 最多追加 n=2 个字符（"cd"），并在末尾补 \\0，所以结果是 "abcd"。' });

  add({ id: 'd-str-06', header: 'string.h', level: 1, kind: 'concept',
    q: 'strcmp("abc", "abd") 的返回值是什么特征？',
    options: ['负数（第一个不同的字符 c < d）', '正数', '一定等于 0', '一定等于 -1'],
    answer: 0,
    explain: 'strcmp 只保证「小于时返回负数、相等返回 0、大于返回正数」，不保证正好是 -1。判断相等要写 strcmp(a, b) == 0。' });

  add({ id: 'd-str-07', header: 'string.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <string.h>\nint main(void) {\n    printf("%d", strncmp("hello", "help", 3));\n    return 0;\n}',
    options: ['0', '1', '-1', '非零'],
    answer: 0,
    explain: 'strncmp 只比较前 3 个字符：hel 与 hel 完全相同，返回 0。' });

  add({ id: 'd-str-08', header: 'string.h', level: 2, kind: 'concept',
    q: 'strchr(s, c) 返回什么？',
    options: ['指向 s 中第一个 c 的指针；找不到返回 NULL', '返回 c 的下标', '返回 1 或 0', '返回字符串长度'],
    answer: 0,
    explain: 'strchr 返回指针。找到的位置可以用 p - s 算出下标；找不到时返回 NULL，使用返回值前要判断。' });

  add({ id: 'd-str-09', header: 'string.h', level: 2, kind: 'concept',
    q: 'strstr(s, "cat") 的作用是？',
    options: ['在 s 里找子串 "cat"，返回它第一次出现的位置指针', '统计 "cat" 出现次数', '把 "cat" 拼到 s 后面', '删除 "cat"'],
    answer: 0,
    explain: 'strstr 返回第一次找到的子串指针，找不到返回 NULL；它不会修改字符串。' });

  add({ id: 'd-str-10', header: 'string.h', level: 2, kind: 'concept',
    q: '用 == 比较两个字符串，例如 if (s1 == s2)，实际比较的是什么？',
    options: ['两个数组/指针的地址，不是字符串内容', '字符串的长度', '字符串的内容', '第一个字符'],
    answer: 0,
    explain: 'C 里的数组名会退化成指针，== 比较的是地址。比较内容要用 strcmp(s1, s2) == 0。' });

  add({ id: 'd-str-11', header: 'string.h', level: 1, kind: 'concept',
    q: 'char s[3] = {\'a\', \'b\', \'c\'}; 之后调用 strlen(s) 会怎样？',
    options: ['未定义行为：数组里没有 \\0，strlen 会一直往后读', '返回 3', '返回 0', '编译错误'],
    answer: 0,
    explain: 'strlen 靠 \\0 判断结束。这个数组没有任何 \\0，strlen 会越过数组继续找，属于未定义行为。' });

  add({ id: 'd-str-12', header: 'string.h', level: 3, kind: 'concept',
    q: 'memset(a, 1, sizeof(a)) 能把 int 数组 a 的每个元素都设成 1 吗？',
    options: ['不能：memset 按字节填充，每个字节变 0x01，int 会变成 0x01010101', '能，所有元素都变成 1', '能，但只能设成 0', '会编译错误'],
    answer: 0,
    explain: 'memset 是按字节操作的。把每个字节设为 0x01 后，一个 4 字节 int 就变成 0x01010101（16843009）。清零用 memset(a, 0, sizeof(a)) 是对的。' });

  add({ id: 'd-str-13', header: 'string.h', level: 3, kind: 'concept',
    q: 'memcpy(dst, src, n) 中如果 dst 和 src 指向的内存区域重叠，会怎样？',
    options: ['未定义行为，应该改用 memmove', '自动处理重叠，没有问题', '只复制一半', '编译失败'],
    answer: 0,
    explain: 'memcpy 不保证能处理重叠区域；需要处理重叠时用 memmove。' });

  add({ id: 'd-str-14', header: 'string.h', level: 2, kind: 'concept',
    q: 'strtok 有什么「副作用」需要特别注意？',
    options: ['它会修改原字符串（把分隔符替换成 \\0）', '它会复制一份新字符串', '它只能分割数字', '它返回下标'],
    answer: 0,
    explain: 'strtok 直接修改传入的字符串，把找到的分隔符改成 \\0。所以不能传字符串常量，分割后原串也会变。' });

  add({ id: 'd-str-15', header: 'string.h', level: 3, kind: 'concept',
    q: 'memcmp(a, b, n) 的作用是？',
    options: ['按字节比较两块内存，相等返回 0', '比较两个字符串的长度', '把 b 复制到 a', '只比较字母'],
    answer: 0,
    explain: 'memcmp 按字节比较，和字符串是否以 \\0 结尾无关，常用于比较结构体或二进制数据。' });

  add({ id: 'd-str-16', header: 'string.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <string.h>\nint main(void) {\n    char s[] = "abcdef";\n    char *p = strchr(s, \'c\');\n    printf("%s", p);\n    return 0;\n}',
    options: ['cdef', 'abcdef', 'c', 'def'],
    answer: 0,
    explain: 'strchr 返回指向字母 c 的指针；用 %s 打印这个指针，会从 c 一直打印到结尾，得到 "cdef"。' });

  add({ id: 'd-str-17', header: 'string.h', level: 3, kind: 'concept',
    q: 'char dst[4]; strcpy(dst, "hello"); 会怎样？',
    options: ['缓冲区溢出：目标是 4 字节，装不下 "hello" 加 \\0', '自动截断成 "hell"', '正常复制，自动扩容', '只会复制 4 个字符并补 \\0'],
    answer: 0,
    explain: 'strcpy 不知道目标多大，会一直写到 \\0，所以 4 字节的数组装不下 6 字节的内容，属于未定义行为（常见后果是破坏别的变量）。用 snprintf 或 strncpy 并手动补 \\0 更安全。' });

  add({ id: 'd-str-18', header: 'string.h', level: 2, kind: 'output',
    q: '下面这段程序的输出是什么？',
    code: '#include <stdio.h>\n#include <string.h>\nint main(void) {\n    char s[] = "abc";\n    printf("%c|%d", s[1], (int)strlen(s));\n    return 0;\n}',
    options: ['b|3', 'b|4', 'a|3', 'c|3'],
    answer: 0,
    explain: '下标从 0 开始：s[0]=\'a\'、s[1]=\'b\'、s[2]=\'c\'；strlen 不数结尾的 \\0，所以长度是 3。' });
})(typeof globalThis !== 'undefined' ? globalThis : this);