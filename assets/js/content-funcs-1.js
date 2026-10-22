/*!
 * 粉猫捉虫 · C 函数手册（一）：stdio.h / stdlib.h
 * 每个函数都写清楚：原型、作用、参数、返回值、常见坑、示例、本站能不能直接运行。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var FUNCS = CC.FUNCS || (CC.FUNCS = []);
  var HEADERS = CC.FUNC_HEADERS || (CC.FUNC_HEADERS = {});

  HEADERS['stdio.h'] = {
    id: 'stdio.h',
    icon: '🖨️',
    title: '标准输入输出',
    summary: '和屏幕、键盘、文件打交道的函数都住在这里：printf、scanf、文件读写。',
    when: '只要你要打印东西、读用户输入，就需要 #include <stdio.h>。它几乎是每个 C 程序的第一个头文件。',
    tips: [
      'printf / scanf 的「格式字符串」是这一章的命根子：一个 % 对应一个参数。',
      'scanf 读进变量时，变量前面要加 &（数组名除外）。',
      '文件操作、fgets、fprintf 本站解释器不支持，需要用真正的编译器练习。'
    ],
    table: {
      title: 'printf / scanf 常用格式符',
      head: ['格式', '打印/读取什么', '例子'],
      rows: [
        ['%d / %i', '十进制整数', 'printf("%d", 42)'],
        ['%u', '无符号整数', 'printf("%u", 42)'],
        ['%ld', 'long 整数', 'printf("%ld", 123456L)'],
        ['%f / %.2f', '小数（默认 6 位，可指定小数位）', 'printf("%.2f", 3.14159)'],
        ['%e / %g', '科学计数法 / 自动选择', 'printf("%e", 12345.6)'],
        ['%c', '单个字符', 'printf("%c", 65)'],
        ['%s', '字符串', 'printf("%s", "hi")'],
        ['%x / %o', '十六进制 / 八进制', 'printf("%x", 255)'],
        ['%%', '百分号本身', 'printf("100%%")'],
        ['%5d / %-5d', '宽度 5、右对齐 / 左对齐', 'printf("[%5d]", 42)'],
        ['%05d', '宽度 5、前面补 0', 'printf("%05d", 42)']
      ]
    }
  };

  HEADERS['stdlib.h'] = {
    id: 'stdlib.h',
    icon: '🧰',
    title: '通用工具',
    summary: '随机数、字符串转数字、内存申请、排序、程序退出……这些「杂活」都归它管。',
    when: '需要 rand() 做随机数、atoi() 把字符串变数字、malloc() 动态申请内存时使用。',
    tips: [
      '用 rand() 前一般先 srand(time(NULL)) 播种，否则每次运行都是同一串随机数。',
      'atoi / atof 遇到不是数字的字符会停下，不会报错，所以它不会告诉你「输入不合法」。',
      'malloc 申请的内存必须 free；初学者建议先把数组用熟，再碰动态内存。'
    ]
  };

  function add(o) { FUNCS.push(o); }

  // ======================= stdio.h =======================
  add({ id: 'printf', name: 'printf', header: 'stdio.h', level: 1, supported: true, tags: ['输出', '最常用'],
    proto: 'int printf(const char *format, ...);',
    brief: '按格式把内容打印到屏幕上。',
    params: 'format：格式字符串；后面的参数会依次填进格式里的 % 中。',
    returns: '成功时返回打印出来的字符个数。',
    notes: ['格式符和参数必须一一对应：printf("%d %d", a, b);', '想在输出里显示 % 本身，要写 %%。'],
    example: '#include <stdio.h>\n\nint main() {\n    int score = 95;\n    double pi = 3.14159;\n    printf("分数：%d，圆周率：%.2f\\n", score, pi);\n    return 0;\n}',
    related: ['puts', 'putchar', 'scanf', 'sprintf'] });

  add({ id: 'puts', name: 'puts', header: 'stdio.h', level: 1, supported: true, tags: ['输出'],
    proto: 'int puts(const char *s);',
    brief: '打印一个字符串，并自动换行。',
    params: 's：要打印的字符串。',
    returns: '成功时返回非负数，失败返回 EOF。',
    notes: ['puts 会自动加一个 \\n，所以不用自己写换行。', '它只能打印字符串，不能像 printf 那样插值。'],
    example: '#include <stdio.h>\n\nint main() {\n    puts("你好，C 语言");\n    puts("puts 会自动换行");\n    return 0;\n}',
    related: ['printf', 'putchar'] });

  add({ id: 'putchar', name: 'putchar', header: 'stdio.h', level: 1, supported: true, tags: ['输出', '字符'],
    proto: 'int putchar(int c);',
    brief: '输出一个字符。',
    params: 'c：要输出的字符（可以直接传字符常量，也可以传 ASCII 码）。',
    returns: '成功时返回输出的那个字符，失败返回 EOF。',
    notes: ['putchar(\'A\') 和 putchar(65) 效果一样。', '它不会自动换行，需要换行要 putchar(\'\\n\')。'],
    example: '#include <stdio.h>\n\nint main() {\n    putchar(\'H\');\n    putchar(\'i\');\n    putchar(\'!\');\n    putchar(\'\\n\');\n    return 0;\n}',
    related: ['printf', 'puts', 'getchar'] });

  add({ id: 'getchar', name: 'getchar', header: 'stdio.h', level: 2, supported: true, demoStdin: 'A', tags: ['输入', '字符'],
    proto: 'int getchar(void);',
    brief: '从标准输入读一个字符。',
    params: '没有参数。',
    returns: '成功时返回读到的字符（int）；读到文件结尾返回 EOF。',
    notes: ['它会读走换行符 \\n，和 scanf 混用时要注意。', '返回值是 int 而不是 char，这样才能表示 EOF。'],
    example: '#include <stdio.h>\n\nint main() {\n    int c = getchar();\n    printf("你输入的是：%c\\n", c);\n    return 0;\n}',
    related: ['putchar', 'scanf', 'fgets'] });

  add({ id: 'scanf', name: 'scanf', header: 'stdio.h', level: 1, supported: true, demoStdin: '3 4', tags: ['输入', '最常用'],
    proto: 'int scanf(const char *format, ...);',
    brief: '按格式从键盘读数据，存进变量。',
    params: 'format：格式字符串；后面的参数是「变量的地址」（&变量）。',
    returns: '成功读到的数据个数；失败或遇到 EOF 返回更小的数。',
    notes: ['变量前面必须加 &，除非是字符数组（数组名本身就是地址）。', '%c 会读走上一次输入留下的换行，必要时写成 " %c"。', '读 double 用 %lf。'],
    example: '#include <stdio.h>\n\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("%d + %d = %d\\n", a, b, a + b);\n    return 0;\n}',
    related: ['printf', 'gets', 'fgets'] });

  add({ id: 'sprintf', name: 'sprintf', header: 'stdio.h', level: 2, supported: true, tags: ['字符串', '格式化'],
    proto: 'int sprintf(char *str, const char *format, ...);',
    brief: '像 printf 一样格式化，但结果写进一个字符数组，而不是打印出来。',
    params: 'str：目标字符数组；format：格式字符串；后面是要格式化的值。',
    returns: '写进去的字符个数（不含结尾的 \\0）。',
    notes: ['目标数组一定要够大，否则会写越界。', '更安全的版本是 snprintf，它会限制最多写多少个字符。'],
    example: '#include <stdio.h>\n\nint main() {\n    char buf[50];\n    int n = 42;\n    sprintf(buf, "数字是 %d", n);\n    printf("%s\\n", buf);\n    return 0;\n}',
    related: ['printf', 'snprintf'] });

  add({ id: 'snprintf', name: 'snprintf', header: 'stdio.h', level: 2, supported: false, tags: ['字符串', '安全'],
    proto: 'int snprintf(char *str, size_t size, const char *format, ...);',
    brief: '带长度限制的 sprintf：最多写 size 个字符，更安全。',
    params: 'str：目标数组；size：最多写多少个字节（包含结尾的 \\0）；format 和值同上。',
    returns: '如果空间够，返回「本来想写」的字符数；被截断时返回的值可能 >= size。',
    notes: ['它是防缓冲区溢出的标准做法。', '本站解释器暂不支持，请用真正的编译器练习。'],
    example: '#include <stdio.h>\n\nint main() {\n    char buf[8];\n    snprintf(buf, sizeof(buf), "数字 %d", 123456);\n    printf("%s\\n", buf);\n    return 0;\n}',
    related: ['sprintf', 'printf'] });

  add({ id: 'fprintf', name: 'fprintf', header: 'stdio.h', level: 2, supported: false, tags: ['文件', '输出'],
    proto: 'int fprintf(FILE *stream, const char *format, ...);',
    brief: '把格式化内容写到文件或 stderr 等「流」里。',
    params: 'stream：文件指针（fopen 得到），或 stderr / stdout；format 和值同 printf。',
    returns: '写成功的字符数；出错返回负数。',
    notes: ['fprintf(stderr, ...) 常用来打印错误信息。', '需要文件操作，本站不支持。'],
    example: '#include <stdio.h>\n\nint main() {\n    fprintf(stderr, "发生了一个错误！\\n");\n    return 0;\n}',
    related: ['printf', 'fopen'] });

  add({ id: 'fgets', name: 'fgets', header: 'stdio.h', level: 2, supported: false, tags: ['文件', '字符串输入'],
    proto: 'char *fgets(char *s, int size, FILE *stream);',
    brief: '从文件或键盘读一行（比 gets 安全）。',
    params: 's：存放结果的数组；size：最多读 size-1 个字符；stream：stdin 或文件指针。',
    returns: '成功返回 s；失败或到文件结尾返回 NULL。',
    notes: ['它会保留行尾的 \\n。', '绝对不要用 gets——它不检查长度，已经废弃。'],
    example: '#include <stdio.h>\n\nint main() {\n    char line[100];\n    if (fgets(line, sizeof(line), stdin) != NULL) {\n        printf("读到：%s", line);\n    }\n    return 0;\n}',
    related: ['gets', 'scanf', 'fopen'] });

  add({ id: 'fopen', name: 'fopen', header: 'stdio.h', level: 2, supported: false, tags: ['文件'],
    proto: 'FILE *fopen(const char *filename, const char *mode);',
    brief: '打开一个文件，得到一个文件指针。',
    params: 'filename：文件名；mode："r" 读、"w" 写（清空）、"a" 追加、"rb" 二进制读等。',
    returns: '成功返回 FILE*；失败返回 NULL。',
    notes: ['用完一定要 fclose。', '打开失败要检查 NULL，否则后面会崩。'],
    example: '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("data.txt", "w");\n    if (fp == NULL) {\n        printf("打不开文件\\n");\n        return 1;\n    }\n    fprintf(fp, "hello\\n");\n    fclose(fp);\n    return 0;\n}',
    related: ['fclose', 'fprintf', 'fgets'] });

  add({ id: 'fclose', name: 'fclose', header: 'stdio.h', level: 2, supported: false, tags: ['文件'],
    proto: 'int fclose(FILE *stream);',
    brief: '关闭文件，把缓冲区的数据真正写出去。',
    params: 'stream：fopen 得到的文件指针。',
    returns: '成功返回 0，失败返回 EOF。',
    notes: ['打开的文件用完必须关闭。', '关闭后不要再用这个指针。'],
    example: '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("a.txt", "w");\n    if (fp) {\n        fputs("hi", fp);\n        fclose(fp);\n    }\n    return 0;\n}',
    related: ['fopen', 'fflush'] });

  add({ id: 'fread', name: 'fread', header: 'stdio.h', level: 3, supported: false, tags: ['文件', '二进制'],
    proto: 'size_t fread(void *ptr, size_t size, size_t nmemb, FILE *stream);',
    brief: '从文件里按块读取二进制数据。',
    params: 'ptr：放数据的缓冲区；size：每块字节数；nmemb：块数；stream：文件指针。',
    returns: '实际读到的块数（可能小于 nmemb）。',
    notes: ['常和 fwrite 配对使用。', '要判断返回值，别假设一次就读完了。'],
    example: '#include <stdio.h>\n\nint main() {\n    int nums[3] = {1, 2, 3};\n    FILE *fp = fopen("nums.bin", "wb");\n    if (fp) {\n        fwrite(nums, sizeof(int), 3, fp);\n        fclose(fp);\n    }\n    return 0;\n}',
    related: ['fwrite', 'fopen'] });

  add({ id: 'fwrite', name: 'fwrite', header: 'stdio.h', level: 3, supported: false, tags: ['文件', '二进制'],
    proto: 'size_t fwrite(const void *ptr, size_t size, size_t nmemb, FILE *stream);',
    brief: '把内存里的数据按块写进文件。',
    params: 'ptr：数据地址；size：每块字节数；nmemb：块数；stream：文件指针。',
    returns: '实际写出的块数。',
    notes: ['二进制文件要用 "wb" / "rb" 模式。', '结构体写文件时要注意内存对齐。'],
    example: '#include <stdio.h>\n\nint main() {\n    int nums[3] = {10, 20, 30};\n    FILE *fp = fopen("nums.bin", "wb");\n    if (fp) {\n        fwrite(nums, sizeof(int), 3, fp);\n        fclose(fp);\n    }\n    return 0;\n}',
    related: ['fread', 'fopen'] });

  add({ id: 'fseek', name: 'fseek', header: 'stdio.h', level: 3, supported: false, tags: ['文件', '定位'],
    proto: 'int fseek(FILE *stream, long offset, int whence);',
    brief: '把文件读写位置移动到指定地方。',
    params: 'offset：偏移量；whence：SEEK_SET 开头、SEEK_CUR 当前位置、SEEK_END 结尾。',
    returns: '成功返回 0，失败返回非 0。',
    notes: ['文本文件里不要随便乱跳，二进制文件更合适。', '移动后可以用 ftell 看看当前位置。'],
    example: '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("a.txt", "rb");\n    if (fp) {\n        fseek(fp, 0, SEEK_END);\n        long size = ftell(fp);\n        printf("文件大小：%ld\\n", size);\n        fclose(fp);\n    }\n    return 0;\n}',
    related: ['ftell', 'rewind'] });

  add({ id: 'ftell', name: 'ftell', header: 'stdio.h', level: 3, supported: false, tags: ['文件', '定位'],
    proto: 'long ftell(FILE *stream);',
    brief: '返回当前的文件读写位置。',
    params: 'stream：文件指针。',
    returns: '当前位置（字节偏移）；出错返回 -1L。',
    notes: ['配合 fseek(fp, 0, SEEK_END) 可以求文件大小。'],
    example: '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("a.txt", "w");\n    if (fp) {\n        fprintf(fp, "hello");\n        printf("写入后位置：%ld\\n", ftell(fp));\n        fclose(fp);\n    }\n    return 0;\n}',
    related: ['fseek'] });

  add({ id: 'feof', name: 'feof', header: 'stdio.h', level: 3, supported: false, tags: ['文件'],
    proto: 'int feof(FILE *stream);',
    brief: '判断是不是已经读到文件结尾。',
    params: 'stream：文件指针。',
    returns: '到结尾返回非 0，否则返回 0。',
    notes: ['常见错误：先 while (!feof(fp)) 再读，会多读一次。正确做法是判断读取函数的返回值。'],
    example: '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("a.txt", "r");\n    if (fp) {\n        char buf[100];\n        while (fgets(buf, sizeof(buf), fp) != NULL) {\n            printf("%s", buf);\n        }\n        fclose(fp);\n    }\n    return 0;\n}',
    related: ['fgets', 'ferror'] });

  add({ id: 'fflush', name: 'fflush', header: 'stdio.h', level: 3, supported: false, tags: ['文件', '缓冲'],
    proto: 'int fflush(FILE *stream);',
    brief: '立刻把输出缓冲区里的内容写出去。',
    params: 'stream：文件指针；传 NULL 会刷新所有输出流（部分平台行为不同）。',
    returns: '成功返回 0，失败返回 EOF。',
    notes: ['fflush(stdin) 是未定义行为，不要用来清空输入。'],
    example: '#include <stdio.h>\n\nint main() {\n    printf("先写出来");\n    fflush(stdout);\n    return 0;\n}',
    related: ['fclose'] });

  add({ id: 'remove', name: 'remove', header: 'stdio.h', level: 3, supported: false, tags: ['文件'],
    proto: 'int remove(const char *filename);',
    brief: '删除一个文件。',
    params: 'filename：文件名。',
    returns: '成功返回 0，失败返回非 0。',
    notes: ['删了就没了，练习时小心一点。'],
    example: '#include <stdio.h>\n\nint main() {\n    if (remove("temp.txt") == 0) {\n        printf("删除成功\\n");\n    } else {\n        printf("没删掉（可能文件不存在）\\n");\n    }\n    return 0;\n}',
    related: ['rename'] });

  add({ id: 'rename', name: 'rename', header: 'stdio.h', level: 3, supported: false, tags: ['文件'],
    proto: 'int rename(const char *oldname, const char *newname);',
    brief: '给文件改名（也可以移动位置）。',
    params: 'oldname：旧名字；newname：新名字。',
    returns: '成功返回 0，失败返回非 0。',
    notes: ['目标文件已存在时，不同平台行为可能不同。'],
    example: '#include <stdio.h>\n\nint main() {\n    if (rename("a.txt", "b.txt") == 0) {\n        printf("改名成功\\n");\n    }\n    return 0;\n}',
    related: ['remove'] });

  add({ id: 'perror', name: 'perror', header: 'stdio.h', level: 3, supported: false, tags: ['错误处理'],
    proto: 'void perror(const char *s);',
    brief: '打印一条错误信息（会带上系统给出的原因）。',
    params: 's：你自己想加的前缀，比如 "打开文件失败"。',
    returns: '没有返回值。',
    notes: ['通常在某个库函数失败后立刻调用，用来看 errno 对应的文字说明。'],
    example: '#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("no_such_file.txt", "r");\n    if (fp == NULL) {\n        perror("打开文件失败");\n    }\n    return 0;\n}',
    related: ['fopen', 'strerror'] });

  // ======================= stdlib.h =======================
  add({ id: 'rand', name: 'rand', header: 'stdlib.h', level: 1, supported: true, tags: ['随机数', '常用'],
    proto: 'int rand(void);',
    brief: '生成一个伪随机整数（0 ~ RAND_MAX）。',
    params: '没有参数。',
    returns: '一个伪随机整数。',
    notes: ['想得到 1~100：rand() % 100 + 1。', '不调用 srand 的话，每次运行都是同一串数字。', '本站的 rand 是固定算法的伪随机数，方便判题复现。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    srand(1);\n    for (int i = 0; i < 3; i++) {\n        printf("%d ", rand() % 100 + 1);\n    }\n    printf("\\n");\n    return 0;\n}',
    related: ['srand', 'time'] });

  add({ id: 'srand', name: 'srand', header: 'stdlib.h', level: 1, supported: true, tags: ['随机数'],
    proto: 'void srand(unsigned int seed);',
    brief: '给随机数设置「种子」，同一个种子会产生同一串随机数。',
    params: 'seed：种子。常用 time(NULL) 让每次运行都不一样。',
    returns: '没有返回值。',
    notes: ['整个程序通常只调用一次 srand。', 'srand(1) 常用来让结果可复现（方便调试）。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n#include <time.h>\n\nint main() {\n    srand(42);\n    printf("%d\\n", rand() % 10);\n    return 0;\n}',
    related: ['rand', 'time'] });

  add({ id: 'abs', name: 'abs', header: 'stdlib.h', level: 1, supported: true, tags: ['数学', '整数'],
    proto: 'int abs(int x);',
    brief: '求一个整数的绝对值。',
    params: 'x：整数。',
    returns: '|x|（绝对值）。',
    notes: ['小数要用 math.h 的 fabs，long 用 labs。', '注意 abs(INT_MIN) 会溢出。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    printf("%d %d\\n", abs(-5), abs(3));\n    return 0;\n}',
    related: ['fabs', 'labs'] });

  add({ id: 'labs', name: 'labs', header: 'stdlib.h', level: 2, supported: true, tags: ['数学', '整数'],
    proto: 'long labs(long x);',
    brief: '求 long 整数的绝对值。',
    params: 'x：long 整数。',
    returns: '|x|。',
    notes: ['在 32 位平台上 long 和 int 可能一样大，在 64 位 Linux 上 long 是 8 字节。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    long x = -123456L;\n    printf("%ld\\n", labs(x));\n    return 0;\n}',
    related: ['abs', 'fabs'] });

  add({ id: 'atoi', name: 'atoi', header: 'stdlib.h', level: 1, supported: true, tags: ['字符串转数字'],
    proto: 'int atoi(const char *str);',
    brief: '把字符串开头的整数部分转成 int。',
    params: 'str：字符串。',
    returns: '转换出的整数；不是数字就返回 0。',
    notes: ['不会告诉你失败，出错时只是返回 0。', '要判断错误请用 strtol。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n = atoi("123abc");\n    printf("%d\\n", n);       // 123\n    printf("%d\\n", atoi("abc")); // 0\n    return 0;\n}',
    related: ['atof', 'strtol', 'sprintf'] });

  add({ id: 'atof', name: 'atof', header: 'stdlib.h', level: 1, supported: true, tags: ['字符串转数字', '小数'],
    proto: 'double atof(const char *str);',
    brief: '把字符串开头的小数部分转成 double。',
    params: 'str：字符串。',
    returns: '转换出的 double；不能转换时返回 0。',
    notes: ['支持小数和科学计数法，比如 "3.14"、"1e3"。', '同样不能区分「输入 0」和「输入非法」。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    double x = atof("3.14abc");\n    printf("%.2f\\n", x);\n    return 0;\n}',
    related: ['atoi', 'strtod'] });

  add({ id: 'strtol', name: 'strtol', header: 'stdlib.h', level: 2, supported: false, tags: ['字符串转数字', '安全'],
    proto: 'long strtol(const char *str, char **endptr, int base);',
    brief: '把字符串转成 long，并且能告诉你「停在了哪里」。',
    params: 'str：字符串；endptr：指向「第一个没被转换的字符」的指针（可传 NULL）；base：进制（10、16、2…）。',
    returns: '转换结果；没转换到数字返回 0。',
    notes: ['比 atoi 安全：可以通过 endptr 判断是否转换成功。', 'base=0 时会自动识别 0x 十六进制、0 八进制。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    char *end;\n    long n = strtol("123abc", &end, 10);\n    printf("%ld 剩余部分：%s\\n", n, end);\n    return 0;\n}',
    related: ['atoi', 'strtod'] });

  add({ id: 'strtod', name: 'strtod', header: 'stdlib.h', level: 2, supported: false, tags: ['字符串转数字'],
    proto: 'double strtod(const char *str, char **endptr);',
    brief: '把字符串转成 double，并告诉你停在了哪里。',
    params: 'str：字符串；endptr：同上，可传 NULL。',
    returns: '转换出的 double。',
    notes: ['比 atof 安全，能检查转换是否成功。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    char *end;\n    double x = strtod("2.5kg", &end);\n    printf("%.1f 剩余：%s\\n", x, end);\n    return 0;\n}',
    related: ['atof', 'strtol'] });

  add({ id: 'malloc', name: 'malloc', header: 'stdlib.h', level: 3, supported: false, tags: ['内存', '指针'],
    proto: 'void *malloc(size_t size);',
    brief: '在堆上申请一块指定字节数的内存。',
    params: 'size：要多少字节，常用 n * sizeof(int)。',
    returns: '成功返回指向这块内存的指针；失败返回 NULL。',
    notes: ['用完必须 free。', '返回值是 void*，赋值给 int* 时通常要强转：int *p = (int*)malloc(...)。', 'new 出来的是「垃圾值」，记得初始化。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n = 5;\n    int *p = (int*)malloc(n * sizeof(int));\n    if (p == NULL) return 1;\n    for (int i = 0; i < n; i++) p[i] = i * i;\n    printf("%d\\n", p[4]);\n    free(p);\n    return 0;\n}',
    related: ['calloc', 'realloc', 'free'] });

  add({ id: 'calloc', name: 'calloc', header: 'stdlib.h', level: 3, supported: false, tags: ['内存'],
    proto: 'void *calloc(size_t nmemb, size_t size);',
    brief: '申请内存，并自动把每个字节清零。',
    params: 'nmemb：元素个数；size：每个元素多少字节。',
    returns: '成功返回指针，失败返回 NULL。',
    notes: ['malloc 不清零，calloc 会清零。', '同样需要 free。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int *a = (int*)calloc(5, sizeof(int));\n    if (a == NULL) return 1;\n    printf("%d\\n", a[3]);   // 0\n    free(a);\n    return 0;\n}',
    related: ['malloc', 'free'] });

  add({ id: 'realloc', name: 'realloc', header: 'stdlib.h', level: 3, supported: false, tags: ['内存'],
    proto: 'void *realloc(void *ptr, size_t size);',
    brief: '把原来申请的内存改成新的长度。',
    params: 'ptr：原来 malloc/calloc 得到的指针；size：新的大小。',
    returns: '成功返回新指针（可能和原来不一样！），失败返回 NULL 且原内存不变。',
    notes: ['千万不要 p = realloc(p, ...) 直接覆盖，失败会丢掉原来的指针。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int *p = (int*)malloc(2 * sizeof(int));\n    int *q = (int*)realloc(p, 4 * sizeof(int));\n    if (q != NULL) p = q;\n    free(p);\n    return 0;\n}',
    related: ['malloc', 'free'] });

  add({ id: 'free', name: 'free', header: 'stdlib.h', level: 3, supported: false, tags: ['内存'],
    proto: 'void free(void *ptr);',
    brief: '释放 malloc/calloc/realloc 申请的内存。',
    params: 'ptr：要释放的指针（可以传 NULL，什么也不做）。',
    returns: '没有返回值。',
    notes: ['只能释放堆上申请的内存，不能 free 局部变量。', '释放后不要再使用这个指针（悬空指针）。', '不要重复 free。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int *p = (int*)malloc(sizeof(int));\n    if (p == NULL) return 1;\n    *p = 7;\n    printf("%d\\n", *p);\n    free(p);\n    p = NULL;\n    return 0;\n}',
    related: ['malloc', 'calloc'] });

  add({ id: 'qsort', name: 'qsort', header: 'stdlib.h', level: 3, supported: false, tags: ['排序', '函数指针'],
    proto: 'void qsort(void *base, size_t nmemb, size_t size, int (*compar)(const void *, const void *));',
    brief: '对数组快速排序（需要自己写比较函数）。',
    params: 'base：数组首地址；nmemb：元素个数；size：每个元素字节数；compar：比较函数。',
    returns: '没有返回值。',
    notes: ['比较函数返回负数 / 0 / 正数，表示 a<b、a==b、a>b。', '这是函数指针的典型用法，属于进阶内容。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint cmp(const void *a, const void *b) {\n    return (*(int*)a - *(int*)b);\n}\n\nint main() {\n    int a[5] = {5, 2, 9, 1, 3};\n    qsort(a, 5, sizeof(int), cmp);\n    for (int i = 0; i < 5; i++) printf("%d ", a[i]);\n    return 0;\n}',
    related: ['bsearch'] });

  add({ id: 'bsearch', name: 'bsearch', header: 'stdlib.h', level: 3, supported: false, tags: ['查找'],
    proto: 'void *bsearch(const void *key, const void *base, size_t nmemb, size_t size, int (*compar)(const void *, const void *));',
    brief: '在已排序的数组里二分查找。',
    params: 'key：要找的值；base/nmemb/size：数组信息；compar：比较函数。',
    returns: '找到返回指向元素的指针，找不到返回 NULL。',
    notes: ['数组必须先排好序，否则结果没有意义。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint cmp(const void *a, const void *b) {\n    return (*(int*)a - *(int*)b);\n}\n\nint main() {\n    int a[5] = {1, 2, 3, 5, 9};\n    int key = 5;\n    int *p = (int*)bsearch(&key, a, 5, sizeof(int), cmp);\n    if (p) printf("找到了 %d\\n", *p);\n    return 0;\n}',
    related: ['qsort'] });

  add({ id: 'exit', name: 'exit', header: 'stdlib.h', level: 2, supported: false, tags: ['程序控制'],
    proto: 'void exit(int status);',
    brief: '立刻结束整个程序。',
    params: 'status：退出码，0 表示正常，非 0 表示出错。',
    returns: '不会返回。',
    notes: ['会刷新并关闭文件。', '在 main 里更推荐直接 return。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int age = -1;\n    if (age < 0) {\n        printf("年龄不合法\\n");\n        exit(1);\n    }\n    return 0;\n}',
    related: ['return'] });

  add({ id: 'system', name: 'system', header: 'stdlib.h', level: 3, supported: false, tags: ['系统'],
    proto: 'int system(const char *command);',
    brief: '执行一条系统命令（平台相关，慎用）。',
    params: 'command：要执行的命令字符串；传 NULL 可以检测有没有命令解释器。',
    returns: '命令的返回状态，具体含义依赖平台。',
    notes: ['不同操作系统命令不一样，移植性差。', '在真实项目里要非常小心，别把用户输入直接拼进去。'],
    example: '#include <stdlib.h>\n\nint main() {\n    system("echo hello");\n    return 0;\n}',
    related: [] });

  add({ id: 'getenv', name: 'getenv', header: 'stdlib.h', level: 3, supported: false, tags: ['环境变量'],
    proto: 'char *getenv(const char *name);',
    brief: '读取环境变量的值。',
    params: 'name：环境变量名，比如 "PATH"。',
    returns: '找到返回字符串指针，找不到返回 NULL。',
    notes: ['返回的字符串不要修改。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    char *path = getenv("PATH");\n    if (path) printf("%s\\n", path);\n    return 0;\n}',
    related: [] });

  add({ id: 'div', name: 'div', header: 'stdlib.h', level: 3, supported: false, tags: ['数学'],
    proto: 'div_t div(int numer, int denom);',
    brief: '一次算出整除的商和余数。',
    params: 'numer：被除数；denom：除数。',
    returns: 'div_t 结构体，里面有 quot（商）和 rem（余数）。',
    notes: ['相当于同时做 a / b 和 a % b。', '结构体本站不支持，用真正的编译器练习。'],
    example: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    div_t d = div(17, 5);\n    printf("商 %d 余 %d\\n", d.quot, d.rem);\n    return 0;\n}',
    related: [] });

  CC.FUNCS = FUNCS;
})(typeof globalThis !== 'undefined' ? globalThis : this);