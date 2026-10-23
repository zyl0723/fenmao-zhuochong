/*!
 * 粉猫捉虫 · 函数阶梯题（一）：stdio + string
 * 每个常用函数单独成组，每组由「直接调用 → 处理结果 → 小型应用」3 关组成。
 * 所有起始代码保持空白：头文件、main 和变量声明都必须由学习者自己写。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var tasks = [];

  function addFamily(fn, header, specs) {
    specs.forEach(function (s, i) {
      var cases = s.cases;
      tasks.push({
        id: 'ladder-' + fn + '-' + (i + 1),
        kind: 'code',
        stage: 'single',
        target: fn,
        familyLevel: i + 1,
        header: header,
        level: s.level || i + 1,
        title: s.title,
        functions: [fn],
        story: s.story || ('这是「' + fn + '」专练第 ' + (i + 1) + ' 关。先只盯住这一个函数，把它用熟。'),
        goal: s.goal,
        inputFormat: s.input,
        outputFormat: s.output,
        constraints: '必须自己写 #include 和 main；本题重点只练 ' + fn + '。',
        examples: [{ stdin: cases[0][0], stdout: cases[0][1], note: '先把公开样例跑通，再提交全部测试点。' }],
        tests: cases.map(function (c, j) {
          return { name: j === 0 ? '公开样例' : ('测试点 ' + (j + 1)), stdin: c[0], expect: c[1] };
        }),
        starter: '',
        hints: s.hints,
        solution: s.code,
        explain: s.explain
      });
    });
  }

  addFamily('printf', 'stdio.h', [
    {
      title: 'printf 第 1 关：把名字印出来',
      goal: '读入一个名字，用 printf 输出问候语。',
      input: '一行，一个不含空格的字符串。',
      output: '输出：你好，名字！',
      cases: [['Mimi\n', '你好，Mimi！\n'], ['C\n', '你好，C！\n'], ['Fenmao\n', '你好，Fenmao！\n'], ['cat2026\n', '你好，cat2026！\n']],
      hints: ['scanf("%s", name) 读取字符串。', 'printf("你好，%s！\\n", name);'],
      code: '#include <stdio.h>\n\nint main(void) {\n    char name[50];\n    scanf("%s", name);\n    printf("你好，%s！\\n", name);\n    return 0;\n}\n',
      explain: '%s 会被后面的字符串替换，中文和标点原样输出。'
    },
    {
      title: 'printf 第 2 关：补齐编号',
      goal: '用 printf 的宽度格式把整数输出成 5 位编号。',
      input: '一行，一个 0～99999 的整数。',
      output: '输出五位编号，不足五位时前面补 0。',
      cases: [['42\n', '00042\n'], ['7\n', '00007\n'], ['12345\n', '12345\n'], ['9\n', '00009\n']],
      hints: ['格式符 %05d 中的 0 表示补零，5 表示总宽度。', '不要自己手写补零循环，先掌握 printf 的格式控制。'],
      code: '#include <stdio.h>\n\nint main(void) {\n    int n;\n    scanf("%d", &n);\n    printf("%05d\\n", n);\n    return 0;\n}\n',
      explain: '宽度只限制最少字符数；原数字更长时不会被截断。'
    },
    {
      title: 'printf 第 3 关：价格牌',
      goal: '用 printf 把小数金额格式化成两位小数。',
      input: '一行，一个非负实数。',
      output: '输出：价格：x.xx 元',
      cases: [['12.5\n', '价格：12.50 元\n'], ['0\n', '价格：0.00 元\n'], ['3.14159\n', '价格：3.14 元\n'], ['99.9\n', '价格：99.90 元\n']],
      hints: ['用 double 接收，scanf 格式是 %lf。', 'printf 里用 %.2f 保留两位小数。'],
      code: '#include <stdio.h>\n\nint main(void) {\n    double price;\n    scanf("%lf", &price);\n    printf("价格：%.2f 元\\n", price);\n    return 0;\n}\n',
      explain: 'scanf 读 double 用 %lf，printf 输出 double 用 %f，这是常见区别。'
    }
  ]);

  addFamily('scanf', 'stdio.h', [
    {
      title: 'scanf 第 1 关：把整数带回来',
      goal: '用 scanf 读取一个整数，再用 printf 原样输出。',
      input: '一行，一个整数。',
      output: '输出：你输入了：n',
      cases: [['42\n', '你输入了：42\n'], ['-7\n', '你输入了：-7\n'], ['0\n', '你输入了：0\n'], ['10086\n', '你输入了：10086\n']],
      hints: ['scanf 读取 int 时要写 &n。', '先声明 int n，再 scanf("%d", &n)。'],
      code: '#include <stdio.h>\n\nint main(void) {\n    int n;\n    scanf("%d", &n);\n    printf("你输入了：%d\\n", n);\n    return 0;\n}\n',
      explain: 'scanf 需要变量地址，所以普通变量前要加 &。'
    },
    {
      title: 'scanf 第 2 关：一次读两个数',
      goal: '用一次 scanf 读入两个整数并输出和。',
      input: '一行，两个整数。',
      output: '输出两个数的和。',
      cases: [['3 4\n', '7\n'], ['-5 8\n', '3\n'], ['0 0\n', '0\n'], ['10 -2\n', '8\n']],
      hints: ['scanf("%d %d", &a, &b) 可以一次读两个整数。', '格式字符串中的空格只是分隔写法，输入时可以有空白。'],
      code: '#include <stdio.h>\n\nint main(void) {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("%d\\n", a + b);\n    return 0;\n}\n',
      explain: 'scanf 按顺序把两个整数写进 a 和 b 的地址中。'
    },
    {
      title: 'scanf 第 3 关：读入一个字符',
      goal: '用 scanf 读取一个字符并输出。',
      input: '一行，一个可见字符。',
      output: '输出：字符：c',
      cases: [['A\n', '字符：A\n'], ['7\n', '字符：7\n'], ['x\n', '字符：x\n'], ['@\n', '字符：@\n']],
      hints: ['格式 " %c" 前面的空格会跳过输入前的空白。', '读取字符时仍要传变量地址 &ch。'],
      code: '#include <stdio.h>\n\nint main(void) {\n    char ch;\n    scanf(" %c", &ch);\n    printf("字符：%c\\n", ch);\n    return 0;\n}\n',
      explain: '%c 不会自动跳过空白，所以教学代码常用 " %c" 避免读到上一行换行。'
    }
  ]);

  addFamily('sprintf', 'stdio.h', [
    {
      title: 'sprintf 第 1 关：把整数写进字符串',
      goal: '用 sprintf 把整数 42 写成字符串并输出。',
      input: '无输入。',
      output: '输出：[42]',
      cases: [['', '[42]\n'], ['', '[42]\n'], ['', '[42]\n'], ['', '[42]\n']],
      hints: ['先准备 char text[50];。', 'sprintf(text, "%d", 42); 会把结果写进字符数组。'],
      code: '#include <stdio.h>\n\nint main(void) {\n    char text[50];\n    sprintf(text, "%d", 42);\n    printf("[%s]\\n", text);\n    return 0;\n}\n',
      explain: 'sprintf 和 printf 的格式很像，但第一个参数是目标字符数组。'
    },
    {
      title: 'sprintf 第 2 关：名字和分数',
      goal: '用 sprintf 拼出“名字:分数”格式的字符串。',
      input: '一行：名字、整数分数。',
      output: '输出拼好的字符串。',
      cases: [['Mimi 95\n', 'Mimi:95\n'], ['Tom 60\n', 'Tom:60\n'], ['C 100\n', 'C:100\n'], ['cat 0\n', 'cat:0\n']],
      hints: ['char out[100];', 'sprintf(out, "%s:%d", name, score);'],
      code: '#include <stdio.h>\n\nint main(void) {\n    char name[50], out[100];\n    int score;\n    scanf("%s %d", name, &score);\n    sprintf(out, "%s:%d", name, score);\n    printf("%s\\n", out);\n    return 0;\n}\n',
      explain: 'sprintf 可以按多个格式符组合不同类型的数据。'
    },
    {
      title: 'sprintf 第 3 关：生成算式',
      goal: '用 sprintf 生成“a+b=和”的算式字符串。',
      input: '一行，两个整数。',
      output: '输出生成的算式。',
      cases: [['3 4\n', '3+4=7\n'], ['-1 5\n', '-1+5=4\n'], ['0 0\n', '0+0=0\n'], ['10 20\n', '10+20=30\n']],
      hints: ['先把 a+b 算出来。', 'sprintf(buf, "%d+%d=%d", a, b, a+b);'],
      code: '#include <stdio.h>\n\nint main(void) {\n    int a, b;\n    char buf[100];\n    scanf("%d %d", &a, &b);\n    sprintf(buf, "%d+%d=%d", a, b, a + b);\n    printf("%s\\n", buf);\n    return 0;\n}\n',
      explain: 'sprintf 的第 3 个及之后的参数按格式符顺序被替换。'
    }
  ]);

  addFamily('strlen', 'string.h', [
    {
      title: 'strlen 第 1 关：数单词长度',
      goal: '用 strlen 输出字符串长度。',
      input: '一行，一个不含空格的字符串。',
      output: '输出：长度：n',
      cases: [['Mimi\n', '长度：4\n'], ['C\n', '长度：1\n'], ['abc123\n', '长度：6\n'], ['Fenmao\n', '长度：6\n']],
      hints: ['需要 #include <string.h>。', 'printf("%d", (int)strlen(s));'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    printf("长度：%d\\n", (int)strlen(s));\n    return 0;\n}\n',
      explain: 'strlen 从字符串开头数到 \\0 之前。'
    },
    {
      title: 'strlen 第 2 关：比较两个长度',
      goal: '分别用 strlen 计算两个单词长度并输出。',
      input: '一行，两个字符串。',
      output: '输出：A=x B=y',
      cases: [['cat dog\n', 'A=3 B=3\n'], ['hi hello\n', 'A=2 B=5\n'], ['C language\n', 'A=1 B=8\n'], ['one two\n', 'A=3 B=3\n']],
      hints: ['两个数组都要预留空间。', 'strlen 返回 size_t，格式输出时转成 int 更直观。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char a[100], b[100];\n    scanf("%s %s", a, b);\n    printf("A=%d B=%d\\n", (int)strlen(a), (int)strlen(b));\n    return 0;\n}\n',
      explain: 'strlen 不修改字符串，只是一次计数。'
    },
    {
      title: 'strlen 第 3 关：长度达标吗',
      goal: '用 strlen 判断字符串长度是否不少于给定值。',
      input: '一行：字符串 word、整数 limit。',
      output: '长度不少于 limit 输出 YES，否则输出 NO。',
      cases: [['hello 5\n', 'YES\n'], ['cat 4\n', 'NO\n'], ['abcd 4\n', 'YES\n'], ['a 2\n', 'NO\n']],
      hints: ['先读字符串，再读整数。', '条件写成 (int)strlen(word) >= limit。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char word[100];\n    int limit;\n    scanf("%s %d", word, &limit);\n    printf((int)strlen(word) >= limit ? "YES\\n" : "NO\\n");\n    return 0;\n}\n',
      explain: '这是把函数返回值放进条件判断的典型用法。'
    }
  ]);

  addFamily('strcpy', 'string.h', [
    {
      title: 'strcpy 第 1 关：复制一个单词',
      goal: '用 strcpy 把输入字符串复制到另一个数组。',
      input: '一行，一个字符串。',
      output: '输出：copy=原字符串',
      cases: [['Mimi\n', 'copy=Mimi\n'], ['C\n', 'copy=C\n'], ['hello\n', 'copy=hello\n'], ['cat2026\n', 'copy=cat2026\n']],
      hints: ['目标数组要足够大。', 'strcpy(dest, src); 会把 src 连同 \\0 一起复制。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char src[100], dest[100];\n    scanf("%s", src);\n    strcpy(dest, src);\n    printf("copy=%s\\n", dest);\n    return 0;\n}\n',
      explain: 'strcpy 不检查目标容量，真实项目中必须确保目标数组放得下。'
    },
    {
      title: 'strcpy 第 2 关：复制后分别输出',
      goal: '用 strcpy 复制字符串，再输出原串和副本。',
      input: '一行，一个字符串。',
      output: '两行：原串=... 和 副本=...',
      cases: [['cat\n', '原串=cat\n副本=cat\n'], ['dog\n', '原串=dog\n副本=dog\n'], ['C99\n', '原串=C99\n副本=C99\n'], ['mimi\n', '原串=mimi\n副本=mimi\n']],
      hints: ['两个 char 数组都要声明。', '复制后两个数组的内容独立存放。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char a[100], b[100];\n    scanf("%s", a);\n    strcpy(b, a);\n    printf("原串=%s\\n", a);\n    printf("副本=%s\\n", b);\n    return 0;\n}\n',
      explain: '数组复制不是赋值 a=b；字符串复制应使用 strcpy。'
    },
    {
      title: 'strcpy 第 3 关：保存口令副本',
      goal: '读取口令并复制到 saved 数组，再输出保存结果。',
      input: '一行，一个字符串。',
      output: '输出：已保存：字符串',
      cases: [['fish123\n', '已保存：fish123\n'], ['cat\n', '已保存：cat\n'], ['C_lang\n', '已保存：C_lang\n'], ['mimi2026\n', '已保存：mimi2026\n']],
      hints: ['saved 数组需要足够大。', '先 strcpy(saved, input)，再输出 saved。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char input[100], saved[100];\n    scanf("%s", input);\n    strcpy(saved, input);\n    printf("已保存：%s\\n", saved);\n    return 0;\n}\n',
      explain: '把输入保存到另一个缓冲区，是 strcpy 最常见的用途之一。'
    }
  ]);

  addFamily('strcat', 'string.h', [
    {
      title: 'strcat 第 1 关：接上后缀',
      goal: '用 strcat 把后缀接到前缀后面。',
      input: '一行，两个字符串。',
      output: '输出拼接后的字符串。',
      cases: [['cat s\n', 'cats\n'], ['hello !\n', 'hello!\n'], ['C 99\n', 'C99\n'], ['mi mi\n', 'mimi\n']],
      hints: ['目标数组要能容纳两个字符串。', '先把 first 读入目标数组，再 strcat(dest, suffix)。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char dest[100], suffix[50];\n    scanf("%s %s", dest, suffix);\n    strcat(dest, suffix);\n    printf("%s\\n", dest);\n    return 0;\n}\n',
      explain: 'strcat 从目标字符串的 \\0 位置开始追加内容。'
    },
    {
      title: 'strcat 第 2 关：中间加空格',
      goal: '仅使用 strcat 把两个单词拼成“单词 单词”。',
      input: '一行，两个字符串。',
      output: '输出两个单词，中间一个空格。',
      cases: [['hello world\n', 'hello world\n'], ['C language\n', 'C language\n'], ['mimi cat\n', 'mimi cat\n'], ['fen mao\n', 'fen mao\n']],
      hints: ['从空字符串 char out[100] = ""; 开始。', '依次 strcat(out, a); strcat(out, " "); strcat(out, b);'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char a[50], b[50];\n    char out[100] = "";\n    scanf("%s %s", a, b);\n    strcat(out, a);\n    strcat(out, " ");\n    strcat(out, b);\n    printf("%s\\n", out);\n    return 0;\n}\n',
      explain: '多次 strcat 可以按顺序搭建一个字符串。'
    },
    {
      title: 'strcat 第 3 关：重复拼单词',
      goal: '用循环和 strcat 把单词重复指定次数。',
      input: '一行：字符串 word、整数 times（1～5）。',
      output: '输出重复拼接后的字符串。',
      cases: [['mi 2\n', 'mimi\n'], ['cat 1\n', 'cat\n'], ['ab 3\n', 'ababab\n'], ['x 5\n', 'xxxxx\n']],
      hints: ['结果是 char out[200] = "";。', '循环 times 次，每次 strcat(out, word)。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char word[50];\n    char out[250] = "";\n    int times;\n    scanf("%s %d", word, &times);\n    for (int i = 0; i < times; i++) strcat(out, word);\n    printf("%s\\n", out);\n    return 0;\n}\n',
      explain: '目标缓冲区必须按最大总长度预留空间。'
    }
  ]);

  addFamily('strcmp', 'string.h', [
    {
      title: 'strcmp 第 1 关：判断是否相同',
      goal: '用 strcmp 判断两个字符串是否完全相等。',
      input: '一行，两个字符串。',
      output: '相同输出 SAME，不同输出 DIFF。',
      cases: [['cat cat\n', 'SAME\n'], ['cat dog\n', 'DIFF\n'], ['C C\n', 'SAME\n'], ['abc ab\n', 'DIFF\n']],
      hints: ['不要用 == 比较字符串内容。', 'strcmp(a, b) == 0 表示两个字符串相同。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char a[100], b[100];\n    scanf("%s %s", a, b);\n    printf(strcmp(a, b) == 0 ? "SAME\\n" : "DIFF\\n");\n    return 0;\n}\n',
      explain: 'strcmp 按字典序比较，返回 0 表示内容完全相同。'
    },
    {
      title: 'strcmp 第 2 关：谁排在前面',
      goal: '用 strcmp 输出两个字符串的字典序关系。',
      input: '一行，两个字符串。',
      output: '前者小输出 A<B，前者大输出 A>B，相等输出 A==B。',
      cases: [['apple banana\n', 'A<B\n'], ['cat ant\n', 'A>B\n'], ['mimi mimi\n', 'A==B\n'], ['C C++\n', 'A<B\n']],
      hints: ['strcmp 小于 0 表示前一个字典序更小。', '分别判断 result < 0、> 0、== 0。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char a[100], b[100];\n    scanf("%s %s", a, b);\n    int r = strcmp(a, b);\n    if (r < 0) printf("A<B\\n");\n    else if (r > 0) printf("A>B\\n");\n    else printf("A==B\\n");\n    return 0;\n}\n',
      explain: 'strcmp 返回负数、0 或正数，并不保证一定是 -1 或 1。'
    },
    {
      title: 'strcmp 第 3 关：口令校验',
      goal: '用 strcmp 判断输入口令是否等于正确口令。',
      input: '一行，一个字符串口令。',
      output: '正确输出 登录成功，否则输出 登录失败。',
      cases: [['fish123\n', '登录成功\n'], ['cat\n', '登录失败\n'], ['mimi\n', '登录失败\n'], ['Fish123\n', '登录失败\n']],
      hints: ['正确口令可写成字符串常量 "fish123"。', 'strcmp(password, "fish123") == 0 时成功。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char password[100];\n    scanf("%s", password);\n    if (strcmp(password, "fish123") == 0) printf("登录成功\\n");\n    else printf("登录失败\\n");\n    return 0;\n}\n',
      explain: 'strcmp 区分大小写，所以 Fish123 和 fish123 不相同。'
    }
  ]);

  addFamily('strchr', 'string.h', [
    {
      title: 'strchr 第 1 关：字符在吗',
      goal: '用 strchr 判断字符是否出现在字符串中。',
      input: '一行：字符串 word、字符 ch。',
      output: '找到输出 FOUND，找不到输出 NOT。',
      cases: [['banana a\n', 'FOUND\n'], ['cat z\n', 'NOT\n'], ['mimi i\n', 'FOUND\n'], ['C 9\n', 'NOT\n']],
      hints: ['strchr(word, ch) 找不到时返回 NULL。', 'if (strchr(word, ch) != NULL) 表示找到。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char word[100], ch;\n    scanf("%s %c", word, &ch);\n    printf(strchr(word, ch) != NULL ? "FOUND\\n" : "NOT\\n");\n    return 0;\n}\n',
      explain: 'strchr 返回指向第一次出现位置的指针，找不到返回空指针。'
    },
    {
      title: 'strchr 第 2 关：从这里开始打印',
      goal: '用 strchr 找到字符并输出从该字符开始的子串。',
      input: '一行：字符串 word、字符 ch。',
      output: '找到时输出后缀；找不到输出 NOT。',
      cases: [['banana n\n', 'nana\n'], ['hello l\n', 'llo\n'], ['cat z\n', 'NOT\n'], ['abc b\n', 'bc\n']],
      hints: ['保存 char *p = strchr(word, ch);。', '找到后直接 printf("%s", p)。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char word[100], ch;\n    scanf("%s %c", word, &ch);\n    char *p = strchr(word, ch);\n    if (p == NULL) printf("NOT\\n");\n    else printf("%s\\n", p);\n    return 0;\n}\n',
      explain: '字符指针指向字符串中间时，用 %s 会从那里一直打印到 \\0。'
    },
    {
      title: 'strchr 第 3 关：切成两段',
      goal: '用 strchr 找到分隔字符，把字符串切成前后两段。',
      input: '一行：字符串 word、分隔字符 ch。',
      output: '找到输出“前段|后段”，找不到输出 NOT。',
      cases: [['cat:tiger :\n', 'cat|tiger\n'], ['a-b -\n', 'a|b\n'], ['hello! !\n', 'hello|\n'], ['abc z\n', 'NOT\n']],
      hints: ['找到指针 p 后，可以先打印 p+1。', '要在 p 处放入 \\0 来临时截断前段：*p = \'\\0\'。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char word[100], ch;\n    scanf("%s %c", word, &ch);\n    char *p = strchr(word, ch);\n    if (p == NULL) {\n        printf("NOT\\n");\n    } else {\n        char *tail = p + 1;\n        *p = \'\\0\';\n        printf("%s|%s\\n", word, tail);\n    }\n    return 0;\n}\n',
      explain: 'strchr 返回的指针可以定位字符串内部，并通过写入 \\0 临时分割字符串。'
    }
  ]);

  addFamily('strstr', 'string.h', [
    {
      title: 'strstr 第 1 关：找找小字符串',
      goal: '用 strstr 判断一个字符串是否包含另一个字符串。',
      input: '一行：主字符串 text、待查找字符串 needle。',
      output: '包含输出 YES，不包含输出 NO。',
      cases: [['helloworld llo\n', 'YES\n'], ['catdog bird\n', 'NO\n'], ['banana an\n', 'YES\n'], ['abcabc abc\n', 'YES\n']],
      hints: ['strstr(text, needle) 找的是连续子串。', '返回 NULL 表示没找到。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char text[200], needle[100];\n    scanf("%s %s", text, needle);\n    printf(strstr(text, needle) != NULL ? "YES\\n" : "NO\\n");\n    return 0;\n}\n',
      explain: 'strstr 对大小写敏感，并查找完整的子串。'
    },
    {
      title: 'strstr 第 2 关：从匹配处输出',
      goal: '用 strstr 找到子串并输出从匹配位置开始的剩余内容。',
      input: '一行：主字符串 text、子串 needle。',
      output: '找到时输出后缀，找不到输出 NOT。',
      cases: [['helloworld world\n', 'world\n'], ['banana nana\n', 'nana\n'], ['abcdef gh\n', 'NOT\n'], ['Clanguage language\n', 'language\n']],
      hints: ['char *p = strstr(text, needle);', 'p 可以直接交给 printf 的 %s。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char text[200], needle[100];\n    scanf("%s %s", text, needle);\n    char *p = strstr(text, needle);\n    if (p == NULL) printf("NOT\\n");\n    else printf("%s\\n", p);\n    return 0;\n}\n',
      explain: 'strstr 返回的是子串第一次出现的位置。'
    },
    {
      title: 'strstr 第 3 关：数一数出现几次',
      goal: '用循环和 strstr 统计子串出现了多少次。',
      input: '一行：主字符串 text、非空子串 needle。',
      output: '输出出现次数。',
      cases: [['aaaa aa\n', '3\n'], ['banana ana\n', '2\n'], ['cdef ab\n', '0\n'], ['xxxxx x\n', '5\n']],
      hints: ['从 p = text 开始，每次调用 strstr(p, needle)。', '找到一个后让 p = 匹配位置 + 1，允许重叠匹配。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char text[200], needle[100];\n    scanf("%s %s", text, needle);\n    char *p = text;\n    int count = 0;\n    while ((p = strstr(p, needle)) != NULL) {\n        count++;\n        p++;\n    }\n    printf("%d\\n", count);\n    return 0;\n}\n',
      explain: '每次只移动一个字符，因此像 aaaa 中的 aa 会按重叠位置统计。'
    }
  ]);

  addFamily('strncmp', 'string.h', [
    {
      title: 'strncmp 第 1 关：比较前三个字符',
      goal: '用 strncmp 比较两个字符串的前三个字符。',
      input: '一行，两个字符串。',
      output: '前三个字符相同输出 SAME，否则输出 DIFF。',
      cases: [['cat car\n', 'DIFF\n'], ['cat dog\n', 'DIFF\n'], ['C C++\n', 'DIFF\n'], ['hello help\n', 'SAME\n']],
      hints: ['strncmp(a, b, 3) 只比较前 3 个字符。', '返回 0 表示指定长度内相同。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char a[100], b[100];\n    scanf("%s %s", a, b);\n    printf(strncmp(a, b, 3) == 0 ? "SAME\\n" : "DIFF\\n");\n    return 0;\n}\n',
      explain: 'strncmp 适合只比较前缀，不要求整个字符串相同。'
    },
    {
      title: 'strncmp 第 2 关：自定义比较长度',
      goal: '用 strncmp 比较两个字符串的前 n 个字符。',
      input: '一行：字符串 a、字符串 b、整数 n。',
      output: '前 n 个字符相同输出 SAME，否则输出 DIFF。',
      cases: [['abcdef abcxyz 3\n', 'SAME\n'], ['abcdef abcxyz 4\n', 'DIFF\n'], ['cat car 2\n', 'SAME\n'], ['C C 1\n', 'SAME\n']],
      hints: ['n 用 scanf 读入。', 'strncmp 的第三个参数直接传 n。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char a[100], b[100];\n    int n;\n    scanf("%s %s %d", a, b, &n);\n    printf(strncmp(a, b, n) == 0 ? "SAME\\n" : "DIFF\\n");\n    return 0;\n}\n',
      explain: '当 n 大于字符串长度时，比较会包含 \\0 及其后的有效判断边界。'
    },
    {
      title: 'strncmp 第 3 关：识别命令前缀',
      goal: '用 strncmp 判断输入是否以 get 开头。',
      input: '一行，一个命令字符串。',
      output: '以 get 开头输出 GET，否则输出 OTHER。',
      cases: [['get\n', 'GET\n'], ['getcat\n', 'GET\n'], ['set\n', 'OTHER\n'], ['Get\n', 'OTHER\n']],
      hints: ['只比较前 3 个字符。', 'strncmp(cmd, "get", 3) == 0。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char cmd[100];\n    scanf("%s", cmd);\n    printf(strncmp(cmd, "get", 3) == 0 ? "GET\\n" : "OTHER\\n");\n    return 0;\n}\n',
      explain: '大小写敏感，所以 Get 不会通过。'
    }
  ]);

  addFamily('strncpy', 'string.h', [
    {
      title: 'strncpy 第 1 关：只复制前三个字符',
      goal: '用 strncpy 复制字符串前 3 个字符。',
      input: '一行，一个长度至少 3 的字符串。',
      output: '输出前三个字符。',
      cases: [['abcdef\n', 'abc\n'], ['MimiCat\n', 'Mim\n'], ['12345\n', '123\n'], ['xyz\n', 'xyz\n']],
      hints: ['char out[4]; 为目标预留 3 个字符加 \\0。', 'strncpy(out, src, 3); out[3] = \'\\0\';'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char src[100], out[4];\n    scanf("%s", src);\n    strncpy(out, src, 3);\n    out[3] = \'\\0\';\n    printf("%s\\n", out);\n    return 0;\n}\n',
      explain: 'strncpy 不保证在目标末尾自动补 \\0，复制后要手动终止。'
    },
    {
      title: 'strncpy 第 2 关：复制指定数量',
      goal: '用 strncpy 复制输入字符串的前 n 个字符。',
      input: '一行：字符串 word、整数 n（1～10）。',
      output: '输出复制出的前缀。',
      cases: [['abcdef 2\n', 'ab\n'], ['hello 4\n', 'hell\n'], ['C 1\n', 'C\n'], ['mimi 4\n', 'mimi\n']],
      hints: ['目标数组按 11 个字符预留。', '复制后写 dest[n] = \'\\0\'。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char word[100], dest[11];\n    int n;\n    scanf("%s %d", word, &n);\n    strncpy(dest, word, n);\n    dest[n] = \'\\0\';\n    printf("%s\\n", dest);\n    return 0;\n}\n',
      explain: 'strncpy 的第三个参数是最多复制的字符数。'
    },
    {
      title: 'strncpy 第 3 关：截短长名字',
      goal: '用 strncpy 把长名字保留前 5 个字符。',
      input: '一行，一个字符串。',
      output: '输出最多 5 个字符的前缀。',
      cases: [['FenmaoZhuochong\n', 'Fenma\n'], ['Mimi\n', 'Mimi\n'], ['abcdefghi\n', 'abcde\n'], ['1234567\n', '12345\n']],
      hints: ['目标数组 char out[6];。', '复制 n = 5，随后 out[5] = \'\\0\'；源串更短时也要终止。'],
      code: '#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char in[100], out[6];\n    scanf("%s", in);\n    strncpy(out, in, 5);\n    out[5] = \'\\0\';\n    printf("%s\\n", out);\n    return 0;\n}\n',
      explain: 'strncpy 遇到源字符串结尾时会补 \\0，但目标容量仍要留出终止位置。'
    }
  ]);

  CC.CODE_DRILLS = (CC.CODE_DRILLS || []).concat(tasks);
})(typeof globalThis !== 'undefined' ? globalThis : this);
