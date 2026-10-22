/*!
 * 粉猫捉虫 · C 函数手册（二）：string.h / ctype.h
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var FUNCS = CC.FUNCS || (CC.FUNCS = []);
  var HEADERS = CC.FUNC_HEADERS || (CC.FUNC_HEADERS = {});

  HEADERS['string.h'] = {
    id: 'string.h',
    icon: '🧵',
    title: '字符串处理',
    summary: '求长度、复制、拼接、比较、查找——所有对「字符数组」的操作都在这儿。',
    when: '只要你要处理一段文字（名字、句子、密码），就 include 它。',
    tips: [
      'C 的字符串用 \\0 结尾，所以数组长度必须比字符数多 1。',
      '不要用 == 比较两个字符串（那比的是地址），要用 strcmp。',
      'strcpy / strcat 不检查目标够不够大，是缓冲区溢出的经典来源。'
    ],
    table: {
      title: '字符串函数速览',
      head: ['函数', '一句话', '返回值'],
      rows: [
        ['strlen', '数长度（不含 \\0）', 'size_t'],
        ['strcpy / strncpy', '复制字符串', '目标指针'],
        ['strcat / strncat', '拼接字符串', '目标指针'],
        ['strcmp / strncmp', '比较两个字符串', '负数/0/正数'],
        ['strchr / strstr', '查找字符 / 子串', '指针或 NULL'],
        ['memset / memcpy', '按字节填充 / 复制内存', '目标指针']
      ]
    }
  };

  HEADERS['ctype.h'] = {
    id: 'ctype.h',
    icon: '🔤',
    title: '字符分类与大小写',
    summary: '判断一个字符是不是字母、数字、空格、标点，以及把字母转大小写。',
    when: '处理用户输入、做输入校验、统计字母数字个数时非常常用。',
    tips: [
      '这些函数接收的是「字符的整数值」，可以直接传 char，也可以传 ASCII 码。',
      'C 标准要求参数是 unsigned char 或 EOF；传负 char 在某些平台会出问题。',
      '它们返回的是「非 0 表示真」或 0，不要硬记成一定返回 1（本站统一返回 1/0）。'
    ]
  };

  function add(o) { FUNCS.push(o); }

  // ======================= string.h =======================
  add({ id: 'strlen', name: 'strlen', header: 'string.h', level: 1, supported: true, tags: ['字符串', '最常用'],
    proto: 'size_t strlen(const char *s);',
    brief: '数一个字符串有多少个字符（不包含结尾的 \\0）。',
    params: 's：字符串。',
    returns: '字符个数（size_t，可以当成整数用）。',
    notes: ['"hello" 返回 5，不是 6。', '如果字符串没有 \\0，strlen 会一直往下数，很危险。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[] = "hello";\n    printf("长度：%d\\n", (int)strlen(s));\n    return 0;\n}',
    related: ['strcpy', 'strcmp'] });

  add({ id: 'strcpy', name: 'strcpy', header: 'string.h', level: 1, supported: true, tags: ['字符串', '复制'],
    proto: 'char *strcpy(char *dest, const char *src);',
    brief: '把 src 复制到 dest（连同结尾的 \\0）。',
    params: 'dest：目标数组；src：来源字符串。',
    returns: 'dest 指针。',
    notes: ['目标数组必须够大，否则会写越界。', '不能复制到字符串常量上（比如 strcpy("abc", s) 是错的）。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char src[] = "pink cat";\n    char dst[20];\n    strcpy(dst, src);\n    printf("%s\\n", dst);\n    return 0;\n}',
    related: ['strncpy', 'strcat', 'strlen'] });

  add({ id: 'strncpy', name: 'strncpy', header: 'string.h', level: 2, supported: true, tags: ['字符串', '复制', '安全'],
    proto: 'char *strncpy(char *dest, const char *src, size_t n);',
    brief: '最多复制 n 个字符，防止写越界。',
    params: 'dest：目标；src：来源；n：最多复制多少个字符。',
    returns: 'dest 指针。',
    notes: ['如果 src 长度 >= n，它不会自动补 \\0，后面用 %s 打印会出错，要自己补。', '如果 src 比 n 短，剩余位置会被填 \\0。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char dst[6];\n    strncpy(dst, "abcdefg", 5);\n    dst[5] = 0;\n    printf("%s\\n", dst);\n    return 0;\n}',
    related: ['strcpy', 'strncat'] });

  add({ id: 'strcat', name: 'strcat', header: 'string.h', level: 1, supported: true, tags: ['字符串', '拼接'],
    proto: 'char *strcat(char *dest, const char *src);',
    brief: '把 src 接到 dest 的末尾。',
    params: 'dest：目标字符串（必须已经有 \\0）；src：要接上去的字符串。',
    returns: 'dest 指针。',
    notes: ['dest 必须有足够的剩余空间，否则会写越界。', '不能自己接自己，结果未定义。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[30] = "你好";\n    strcat(s, "，小猫");\n    printf("%s\\n", s);\n    return 0;\n}',
    related: ['strncat', 'strcpy', 'strlen'] });

  add({ id: 'strncat', name: 'strncat', header: 'string.h', level: 2, supported: true, tags: ['字符串', '拼接', '安全'],
    proto: 'char *strncat(char *dest, const char *src, size_t n);',
    brief: '最多把 src 的前 n 个字符接到 dest 末尾。',
    params: 'dest：目标；src：来源；n：最多追加多少个字符。',
    returns: 'dest 指针。',
    notes: ['它会在末尾补一个 \\0，但目标仍然要留够空间。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[20] = "ab";\n    strncat(s, "cdef", 2);\n    printf("%s\\n", s);   // abcd\n    return 0;\n}',
    related: ['strcat', 'strncpy'] });

  add({ id: 'strcmp', name: 'strcmp', header: 'string.h', level: 1, supported: true, tags: ['字符串', '比较', '最常用'],
    proto: 'int strcmp(const char *s1, const char *s2);',
    brief: '按字典序比较两个字符串的内容。',
    params: 's1、s2：要比较的字符串。',
    returns: '相等返回 0；s1 小返回负数；s1 大返回正数。',
    notes: ['判断相等要写 strcmp(a, b) == 0，不能写 a == b。', '比较是区分大小写的。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char a[] = "apple";\n    char b[] = "banana";\n    if (strcmp(a, b) < 0) {\n        printf("%s 排在前面\\n", a);\n    }\n    return 0;\n}',
    related: ['strncmp', 'strlen'] });

  add({ id: 'strncmp', name: 'strncmp', header: 'string.h', level: 2, supported: true, tags: ['字符串', '比较'],
    proto: 'int strncmp(const char *s1, const char *s2, size_t n);',
    brief: '只比较两个字符串的前 n 个字符。',
    params: 's1、s2：字符串；n：最多比较几个字符。',
    returns: '同 strcmp：0 / 负数 / 正数。',
    notes: ['常用来判断「前缀」：strncmp(s, "http", 4) == 0。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    printf("%d\\n", strncmp("hello", "help!", 3)); // 0\n    printf("%d\\n", strncmp("hello", "help!", 4)); // 负数\n    return 0;\n}',
    related: ['strcmp'] });

  add({ id: 'strchr', name: 'strchr', header: 'string.h', level: 2, supported: true, tags: ['字符串', '查找'],
    proto: 'char *strchr(const char *s, int c);',
    brief: '在字符串里找「第一次出现」的某个字符。',
    params: 's：字符串；c：要找的字符（传字符或 ASCII 码）。',
    returns: '指向该字符的指针；找不到返回 NULL。',
    notes: ['找到的位置可以用 str - s 算下标。', '传 0 会返回指向结尾 \\0 的指针。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[] = "hello world";\n    char *p = strchr(s, \'w\');\n    if (p != NULL) printf("%s\\n", p);\n    return 0;\n}',
    related: ['strstr', 'strrchr'] });

  add({ id: 'strstr', name: 'strstr', header: 'string.h', level: 2, supported: true, tags: ['字符串', '查找'],
    proto: 'char *strstr(const char *haystack, const char *needle);',
    brief: '在一个字符串里找另一个子串。',
    params: 'haystack：大字符串；needle：要找的小字符串。',
    returns: '指向子串第一次出现的位置；找不到返回 NULL。',
    notes: ['返回的是指针，不是下标，可以用 p - s 求下标。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[] = "i love pink cats";\n    char *p = strstr(s, "pink");\n    if (p != NULL) printf("从第 %d 个字符开始\\n", (int)(p - s));\n    return 0;\n}',
    related: ['strchr'] });

  add({ id: 'strrchr', name: 'strrchr', header: 'string.h', level: 2, supported: false, tags: ['字符串', '查找'],
    proto: 'char *strrchr(const char *s, int c);',
    brief: '找某个字符「最后一次」出现的位置。',
    params: 's：字符串；c：要找的字符。',
    returns: '指针；找不到返回 NULL。',
    notes: ['常用来找文件名的扩展名：strrchr(path, \'.\')。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char path[] = "a/b/c.txt";\n    char *p = strrchr(path, \'/\');\n    if (p) printf("%s\\n", p + 1);   // c.txt\n    return 0;\n}',
    related: ['strchr'] });

  add({ id: 'strtok', name: 'strtok', header: 'string.h', level: 3, supported: false, tags: ['字符串', '分割'],
    proto: 'char *strtok(char *str, const char *delim);',
    brief: '按分隔符把字符串切成一段一段（会修改原字符串）。',
    params: 'str：第一次传字符串，之后传 NULL；delim：分隔符集合。',
    returns: '下一段字符串；没有了返回 NULL。',
    notes: ['它会修改原串，把分隔符变成 \\0。', '它不是线程安全的；现代代码更推荐 strtok_r 或手动解析。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[] = "apple,banana,cat";\n    char *tok = strtok(s, ",");\n    while (tok != NULL) {\n        printf("%s\\n", tok);\n        tok = strtok(NULL, ",");\n    }\n    return 0;\n}',
    related: ['strchr'] });

  add({ id: 'memset', name: 'memset', header: 'string.h', level: 3, supported: false, tags: ['内存'],
    proto: 'void *memset(void *s, int c, size_t n);',
    brief: '把一段内存的每个字节都设成同一个值。',
    params: 's：起始地址；c：要填的值（按字节）；n：多少个字节。',
    returns: 's 指针。',
    notes: ['常用来清零：memset(a, 0, sizeof(a))。', '它按字节填，所以 memset(a, 1, ...) 不会把 int 设成 1，而是 0x01010101。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    int a[5];\n    memset(a, 0, sizeof(a));\n    printf("%d\\n", a[3]);\n    return 0;\n}',
    related: ['memcpy'] });

  add({ id: 'memcpy', name: 'memcpy', header: 'string.h', level: 3, supported: false, tags: ['内存'],
    proto: 'void *memcpy(void *dest, const void *src, size_t n);',
    brief: '按字节复制一段内存（比字符串复制更通用）。',
    params: 'dest：目标；src：来源；n：复制多少字节。',
    returns: 'dest 指针。',
    notes: ['源和目标不能重叠，重叠要用 memmove。', '常用于复制数组：memcpy(b, a, sizeof(a))。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    int a[3] = {1, 2, 3};\n    int b[3];\n    memcpy(b, a, sizeof(a));\n    printf("%d\\n", b[1]);\n    return 0;\n}',
    related: ['memmove', 'memcmp'] });

  add({ id: 'memmove', name: 'memmove', header: 'string.h', level: 3, supported: false, tags: ['内存'],
    proto: 'void *memmove(void *dest, const void *src, size_t n);',
    brief: '和 memcpy 一样，但允许源和目标重叠。',
    params: '同 memcpy。',
    returns: 'dest 指针。',
    notes: ['移动数组元素时更安全。', '稍微慢一点，但大多数情况下差别可以忽略。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[] = "abcdef";\n    memmove(s + 1, s, 4);\n    printf("%s\\n", s);\n    return 0;\n}',
    related: ['memcpy'] });

  add({ id: 'memcmp', name: 'memcmp', header: 'string.h', level: 3, supported: false, tags: ['内存', '比较'],
    proto: 'int memcmp(const void *s1, const void *s2, size_t n);',
    brief: '按字节比较两块内存。',
    params: 's1、s2：内存地址；n：比较多少字节。',
    returns: '0 表示相同；否则返回第一个不同字节的差值符号。',
    notes: ['适合比较结构体或二进制数据，不关心 \\0。'],
    example: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    int a[2] = {1, 2}, b[2] = {1, 2};\n    printf("%d\\n", memcmp(a, b, sizeof(a)));\n    return 0;\n}',
    related: ['memcpy'] });

  add({ id: 'strerror', name: 'strerror', header: 'string.h', level: 3, supported: false, tags: ['错误处理'],
    proto: 'char *strerror(int errnum);',
    brief: '把错误码翻译成一句人能读的说明。',
    params: 'errnum：错误码（通常是 errno）。',
    returns: '描述字符串的指针。',
    notes: ['常与 errno 配合：printf("%s", strerror(errno))。'],
    example: '#include <stdio.h>\n#include <string.h>\n#include <errno.h>\n\nint main() {\n    FILE *fp = fopen("nope.txt", "r");\n    if (fp == NULL) printf("%s\\n", strerror(errno));\n    return 0;\n}',
    related: ['perror'] });

  add({ id: 'strdup', name: 'strdup', header: 'string.h', level: 3, supported: false, tags: ['字符串', '内存'],
    proto: 'char *strdup(const char *s);',
    brief: '复制一份字符串（自己申请内存）。',
    params: 's：要复制的字符串。',
    returns: '新字符串的指针；失败返回 NULL。',
    notes: ['它不是 C 标准函数，是 POSIX 的，Windows 上叫 _strdup。', '用完后要 free。'],
    example: '#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n\nint main() {\n    char *p = strdup("hello");\n    if (p) {\n        printf("%s\\n", p);\n        free(p);\n    }\n    return 0;\n}',
    related: ['strcpy', 'free'] });

  // ======================= ctype.h =======================
  add({ id: 'isalpha', name: 'isalpha', header: 'ctype.h', level: 1, supported: true, tags: ['字符判断'],
    proto: 'int isalpha(int c);',
    brief: '判断一个字符是不是英文字母（a-z / A-Z）。',
    params: 'c：字符（传 char 或 ASCII 码）。',
    returns: '是字母返回非 0，否则返回 0。',
    notes: ['中文不算字母（它按字节判断）。'],
    example: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    printf("%d %d\\n", isalpha(\'A\'), isalpha(\'3\'));\n    return 0;\n}',
    related: ['isdigit', 'isalnum'] });

  add({ id: 'isdigit', name: 'isdigit', header: 'ctype.h', level: 1, supported: true, tags: ['字符判断', '最常用'],
    proto: 'int isdigit(int c);',
    brief: '判断一个字符是不是数字 0-9。',
    params: 'c：字符。',
    returns: '是数字返回非 0，否则 0。',
    notes: ['\'5\' 是数字字符，5 不是字符；isdigit(5) 是错的。', '统计数字字符数常用它。'],
    example: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    int count = 0;\n    char s[] = "a1b2c3";\n    for (int i = 0; s[i] != 0; i++) {\n        if (isdigit(s[i])) count++;\n    }\n    printf("数字字符有 %d 个\\n", count);\n    return 0;\n}',
    related: ['isalpha', 'isalnum'] });

  add({ id: 'isalnum', name: 'isalnum', header: 'ctype.h', level: 1, supported: true, tags: ['字符判断'],
    proto: 'int isalnum(int c);',
    brief: '判断是不是字母或数字。',
    params: 'c：字符。',
    returns: '是字母/数字返回非 0，否则 0。',
    notes: ['相当于 isalpha(c) || isdigit(c)。'],
    example: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    printf("%d %d %d\\n", isalnum(\'a\'), isalnum(\'7\'), isalnum(\'!\'));\n    return 0;\n}',
    related: ['isalpha', 'isdigit'] });

  add({ id: 'isspace', name: 'isspace', header: 'ctype.h', level: 2, supported: true, tags: ['字符判断'],
    proto: 'int isspace(int c);',
    brief: '判断是不是空白字符（空格、\\t、\\n、\\r 等）。',
    params: 'c：字符。',
    returns: '是空白返回非 0，否则 0。',
    notes: ['包括空格、制表符、换行、回车、换页、垂直制表符。'],
    example: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    printf("%d %d %d\\n", isspace(\' \'), isspace(\'\\n\'), isspace(\'x\'));\n    return 0;\n}',
    related: ['isalpha'] });

  add({ id: 'isupper', name: 'isupper', header: 'ctype.h', level: 1, supported: true, tags: ['字符判断'],
    proto: 'int isupper(int c);',
    brief: '判断是不是大写字母 A-Z。',
    params: 'c：字符。',
    returns: '是大写返回非 0，否则 0。',
    notes: ['只判断，不改变字符。'],
    example: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    printf("%d %d\\n", isupper(\'A\'), isupper(\'a\'));\n    return 0;\n}',
    related: ['islower', 'toupper'] });

  add({ id: 'islower', name: 'islower', header: 'ctype.h', level: 1, supported: true, tags: ['字符判断'],
    proto: 'int islower(int c);',
    brief: '判断是不是小写字母 a-z。',
    params: 'c：字符。',
    returns: '是小写返回非 0，否则 0。',
    notes: ['配合 toupper 可以统一转成大写。'],
    example: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    printf("%d %d\\n", islower(\'a\'), islower(\'A\'));\n    return 0;\n}',
    related: ['isupper', 'tolower'] });

  add({ id: 'ispunct', name: 'ispunct', header: 'ctype.h', level: 2, supported: true, tags: ['字符判断'],
    proto: 'int ispunct(int c);',
    brief: '判断是不是标点符号（可打印、但不是字母/数字/空格）。',
    params: 'c：字符。',
    returns: '是标点返回非 0，否则 0。',
    notes: ['统计句子里的标点常用它。'],
    example: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    printf("%d %d\\n", ispunct(\'!\'), ispunct(\'a\'));\n    return 0;\n}',
    related: ['isalnum'] });

  add({ id: 'toupper', name: 'toupper', header: 'ctype.h', level: 1, supported: true, tags: ['字符转换', '最常用'],
    proto: 'int toupper(int c);',
    brief: '把小写字母转成大写；其它字符原样返回。',
    params: 'c：字符。',
    returns: '转换后的字符（int）。',
    notes: ['a-z 会变成 A-Z，其它字符不变。', '想改字符串本身要写 s[i] = toupper(s[i]);'],
    example: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    char s[] = "hello";\n    for (int i = 0; s[i] != 0; i++) s[i] = toupper(s[i]);\n    printf("%s\\n", s);\n    return 0;\n}',
    related: ['tolower', 'isupper'] });

  add({ id: 'tolower', name: 'tolower', header: 'ctype.h', level: 1, supported: true, tags: ['字符转换'],
    proto: 'int tolower(int c);',
    brief: '把大写字母转成小写；其它字符原样返回。',
    params: 'c：字符。',
    returns: '转换后的字符（int）。',
    notes: ['常用于把输入统一成小写再比较。'],
    example: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    char s[] = "HeLLo";\n    for (int i = 0; s[i] != 0; i++) s[i] = tolower(s[i]);\n    printf("%s\\n", s);\n    return 0;\n}',
    related: ['toupper', 'islower'] });

  add({ id: 'isprint', name: 'isprint', header: 'ctype.h', level: 2, supported: false, tags: ['字符判断'],
    proto: 'int isprint(int c);',
    brief: '判断是不是可打印字符（包括空格）。',
    params: 'c：字符。',
    returns: '可打印返回非 0，否则 0。',
    notes: ['换行、制表符、\0 都不可打印。'],
    example: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    printf("%d %d\\n", isprint(\'A\'), isprint(\'\\n\'));\n    return 0;\n}',
    related: ['isgraph', 'isspace'] });

  add({ id: 'isgraph', name: 'isgraph', header: 'ctype.h', level: 2, supported: false, tags: ['字符判断'],
    proto: 'int isgraph(int c);',
    brief: '判断是不是可打印、且不是空格的字符。',
    params: 'c：字符。',
    returns: '是返回非 0，否则 0。',
    notes: ['isgraph 比 isprint 少了空格。'],
    example: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    printf("%d %d\\n", isgraph(\'A\'), isgraph(\' \'));\n    return 0;\n}',
    related: ['isprint'] });

  CC.FUNCS = FUNCS;
})(typeof globalThis !== 'undefined' ? globalThis : this);