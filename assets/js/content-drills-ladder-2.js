/*!
 * 粉猫捉虫 · 函数阶梯题（二）：stdlib + ctype
 * 每个函数单独 3 关：直接调用、处理结果、小型应用；起始代码保持空白。
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
        kind: 'code', stage: 'single', target: fn, familyLevel: i + 1,
        header: header, level: s.level || i + 1,
        title: s.title, functions: [fn],
        story: s.story || ('这是「' + fn + '」专练第 ' + (i + 1) + ' 关。只把这一个函数练到不用翻资料。'),
        goal: s.goal, inputFormat: s.input, outputFormat: s.output,
        constraints: '必须自己写 #include 和 main；本题重点只练 ' + fn + '。',
        examples: [{ stdin: cases[0][0], stdout: cases[0][1], note: '先跑通公开样例，再提交全部测试点。' }],
        tests: cases.map(function (c, j) { return { name: j === 0 ? '公开样例' : ('测试点 ' + (j + 1)), stdin: c[0], expect: c[1] }; }),
        starter: '', hints: s.hints, solution: s.code, explain: s.explain
      });
    });
  }

  addFamily('atoi', 'stdlib.h', [
    {
      title: 'atoi 第 1 关：字符串变整数',
      goal: '用 atoi 把数字字符串转换成整数。',
      input: '一行，一个十进制整数字符串。',
      output: '输出转换后的整数。',
      cases: [['123\n', '123\n'], ['-45\n', '-45\n'], ['007\n', '7\n'], ['+9\n', '9\n']],
      hints: ['需要 #include <stdlib.h>。', 'int n = atoi(text);'],
      code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    char text[50];\n    scanf("%s", text);\n    int n = atoi(text);\n    printf("%d\\n", n);\n    return 0;\n}\n',
      explain: 'atoi 会从字符串开头解析整数，前导 0 不会保留。'
    },
    {
      title: 'atoi 第 2 关：转换后加十',
      goal: '用 atoi 读数，再输出加 10 后的结果。',
      input: '一行，一个整数形式的字符串。',
      output: '输出：结果：n',
      cases: [['5\n', '结果：15\n'], ['-10\n', '结果：0\n'], ['100\n', '结果：110\n'], ['0\n', '结果：10\n']],
      hints: ['先转换，再做普通整数运算。', '不要直接把字符串和 10 相加。'],
      code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    char text[50];\n    scanf("%s", text);\n    printf("结果：%d\\n", atoi(text) + 10);\n    return 0;\n}\n',
      explain: 'atoi 的返回值是 int，可以继续参与算术运算。'
    },
    {
      title: 'atoi 第 3 关：三个数字字符串求和',
      goal: '用 atoi 分别转换三个字符串并求和。',
      input: '一行，三个数字字符串。',
      output: '输出三数之和。',
      cases: [['1 2 3\n', '6\n'], ['10 -5 2\n', '7\n'], ['007 008 009\n', '24\n'], ['100 200 300\n', '600\n']],
      hints: ['三个数都要先读成字符串。', 'sum = atoi(a) + atoi(b) + atoi(c);'],
      code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    char a[30], b[30], c[30];\n    scanf("%s %s %s", a, b, c);\n    int sum = atoi(a) + atoi(b) + atoi(c);\n    printf("%d\\n", sum);\n    return 0;\n}\n',
      explain: '多次调用同一函数处理一组字符串，是很常见的练习方式。'
    }
  ]);

  addFamily('atof', 'stdlib.h', [
    {
      title: 'atof 第 1 关：字符串变小数',
      goal: '用 atof 把数字字符串转换成 double。',
      input: '一行，一个十进制小数字符串。',
      output: '输出两位小数。',
      cases: [['3.14\n', '3.14\n'], ['-2.5\n', '-2.50\n'], ['10\n', '10.00\n'], ['0.126\n', '0.13\n']],
      hints: ['atof 返回 double。', 'printf 用 %.2f 输出。'],
      code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    char text[50];\n    scanf("%s", text);\n    printf("%.2f\\n", atof(text));\n    return 0;\n}\n',
      explain: 'atof 是“ASCII to float”的意思，返回类型是 double。'
    },
    {
      title: 'atof 第 2 关：两个小数求平均',
      goal: '用 atof 转换两个字符串，再求平均值。',
      input: '一行，两个小数字符串。',
      output: '输出平均值，保留两位小数。',
      cases: [['1.5 2.5\n', '2.00\n'], ['10 11\n', '10.50\n'], ['-2 2\n', '0.00\n'], ['0.1 0.2\n', '0.15\n']],
      hints: ['先分别保存 double x = atof(a), y = atof(b)。', '平均值除以 2.0。'],
      code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    char a[50], b[50];\n    scanf("%s %s", a, b);\n    double x = atof(a), y = atof(b);\n    printf("%.2f\\n", (x + y) / 2.0);\n    return 0;\n}\n',
      explain: 'atof 的转换结果适合继续做浮点运算。'
    },
    {
      title: 'atof 第 3 关：计算折扣价',
      goal: '用 atof 读价格字符串，再按 8 折输出。',
      input: '一行，一个价格字符串。',
      output: '输出折后价格，保留两位小数。',
      cases: [['100\n', '80.00\n'], ['12.5\n', '10.00\n'], ['0\n', '0.00\n'], ['99.9\n', '79.92\n']],
      hints: ['价格先转成 double。', '8 折就是乘以 0.8。'],
      code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    char text[50];\n    scanf("%s", text);\n    double price = atof(text);\n    printf("%.2f\\n", price * 0.8);\n    return 0;\n}\n',
      explain: '浮点字符串转成 double 后，才能进行精确到小数的折扣计算。'
    }
  ]);

  addFamily('abs', 'stdlib.h', [
    {
      title: 'abs 第 1 关：求整数绝对值',
      goal: '用 abs 输出一个整数的绝对值。',
      input: '一行，一个整数。',
      output: '输出绝对值。',
      cases: [['-5\n', '5\n'], ['7\n', '7\n'], ['0\n', '0\n'], ['-123\n', '123\n']],
      hints: ['需要 #include <stdlib.h>。', 'printf("%d", abs(n));'],
      code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n;\n    scanf("%d", &n);\n    printf("%d\\n", abs(n));\n    return 0;\n}\n',
      explain: 'abs 只接受并返回整数；浮点数要用 fabs。'
    },
    {
      title: 'abs 第 2 关：两个数的距离',
      goal: '用 abs 求两个整数之差的绝对值。',
      input: '一行，两个整数。',
      output: '输出：距离：d',
      cases: [['3 8\n', '距离：5\n'], ['10 2\n', '距离：8\n'], ['-4 1\n', '距离：5\n'], ['7 7\n', '距离：0\n']],
      hints: ['先算 a-b。', '把 a-b 交给 abs。'],
      code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("距离：%d\\n", abs(a - b));\n    return 0;\n}\n',
      explain: '绝对值可以消除先后顺序，得到两个点之间的距离。'
    },
    {
      title: 'abs 第 3 关：温度差',
      goal: '用 abs 输出两次温度记录相差多少度。',
      input: '一行，两个整数温度。',
      output: '输出：温差：d 度',
      cases: [['20 26\n', '温差：6 度\n'], ['-3 4\n', '温差：7 度\n'], ['10 10\n', '温差：0 度\n'], ['-10 -20\n', '温差：10 度\n']],
      hints: ['温差不会为负。', 'abs(t1 - t2) 得到非负温差。'],
      code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int t1, t2;\n    scanf("%d %d", &t1, &t2);\n    printf("温差：%d 度\\n", abs(t1 - t2));\n    return 0;\n}\n',
      explain: '温差、距离、误差这类“只关心大小不关心方向”的量常用绝对值。'
    }
  ]);

  addFamily('isalpha', 'ctype.h', [
    {
      title: 'isalpha 第 1 关：是不是字母',
      goal: '用 isalpha 判断一个字符是否为英文字母。',
      input: '一行，一个字符。',
      output: '是字母输出 YES，否则输出 NO。',
      cases: [['A\n', 'YES\n'], ['z\n', 'YES\n'], ['7\n', 'NO\n'], ['!\n', 'NO\n']],
      hints: ['需要 #include <ctype.h>。', '用 scanf(" %c", &ch) 读取字符。'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char ch;\n    scanf(" %c", &ch);\n    printf(isalpha(ch) ? "YES\\n" : "NO\\n");\n    return 0;\n}\n',
      explain: 'isalpha 对 A～Z 和 a～z 返回非 0。'
    },
    {
      title: 'isalpha 第 2 关：数一数字母',
      goal: '用 isalpha 统计字符串中有多少个字母。',
      input: '一行，一个不含空格的字符串。',
      output: '输出字母数量。',
      cases: [['abc123\n', '3\n'], ['A1B2C3\n', '3\n'], ['123\n', '0\n'], ['mimi\n', '4\n']],
      hints: ['遍历字符直到 s[i] == \'\\0\'。', 'if (isalpha(s[i])) count++;'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    int count = 0;\n    for (int i = 0; s[i] != \'\\0\'; i++) if (isalpha(s[i])) count++;\n    printf("%d\\n", count);\n    return 0;\n}\n',
      explain: '字符分类函数可以配合循环处理整个字符串。'
    },
    {
      title: 'isalpha 第 3 关：字母和非字母',
      goal: '用 isalpha 分别统计字母与非字母字符数量。',
      input: '一行，一个不含空格的字符串。',
      output: '输出：字母=x 非字母=y',
      cases: [['abc123!\n', '字母=3 非字母=4\n'], ['Mimi\n', '字母=4 非字母=0\n'], ['1234\n', '字母=0 非字母=4\n'], ['C99\n', '字母=1 非字母=2\n']],
      hints: ['只需要一个 if/else。', 'else 分支统计所有不是字母的字符。'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    int letters = 0, others = 0;\n    for (int i = 0; s[i] != \'\\0\'; i++) {\n        if (isalpha(s[i])) letters++;\n        else others++;\n    }\n    printf("字母=%d 非字母=%d\\n", letters, others);\n    return 0;\n}\n',
      explain: '明确区分两个计数分支，可以避免漏数或重复计数。'
    }
  ]);

  addFamily('isdigit', 'ctype.h', [
    {
      title: 'isdigit 第 1 关：是不是数字字符',
      goal: '用 isdigit 判断字符是否为 0～9。',
      input: '一行，一个字符。',
      output: '是数字字符输出 YES，否则输出 NO。',
      cases: [['7\n', 'YES\n'], ['0\n', 'YES\n'], ['A\n', 'NO\n'], ['-\n', 'NO\n']],
      hints: ['数字字符和数字值不同，\'7\' 是字符。', 'isdigit(ch) 返回非 0 表示是十进制数字。'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char ch;\n    scanf(" %c", &ch);\n    printf(isdigit(ch) ? "YES\\n" : "NO\\n");\n    return 0;\n}\n',
      explain: 'isdigit 判断的是字符是否落在 0～9 范围内。'
    },
    {
      title: 'isdigit 第 2 关：数一数数字',
      goal: '用 isdigit 统计字符串中的数字字符数量。',
      input: '一行，一个不含空格的字符串。',
      output: '输出数字字符数量。',
      cases: [['abc123\n', '3\n'], ['2026\n', '4\n'], ['mimi\n', '0\n'], ['a1b2c3d4\n', '4\n']],
      hints: ['循环遍历字符串。', 'if (isdigit(s[i])) count++;'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    int count = 0;\n    for (int i = 0; s[i] != \'\\0\'; i++) if (isdigit(s[i])) count++;\n    printf("%d\\n", count);\n    return 0;\n}\n',
      explain: 'isdigit 适合检查输入字符中有哪些是数字。'
    },
    {
      title: 'isdigit 第 3 关：全是数字吗',
      goal: '用 isdigit 判断整个字符串是否全部由数字字符组成。',
      input: '一行，一个非空字符串。',
      output: '全是数字输出 YES，否则输出 NO。',
      cases: [['12345\n', 'YES\n'], ['12a45\n', 'NO\n'], ['0\n', 'YES\n'], ['-12\n', 'NO\n']],
      hints: ['先假设 ok = 1。', '遇到非数字字符时把 ok 设为 0 并 break。'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    int ok = 1;\n    for (int i = 0; s[i] != \'\\0\'; i++) {\n        if (!isdigit(s[i])) { ok = 0; break; }\n    }\n    printf(ok ? "YES\\n" : "NO\\n");\n    return 0;\n}\n',
      explain: '这是输入校验的常见模式：发现第一个非法字符就停止。'
    }
  ]);

  addFamily('isspace', 'ctype.h', [
    {
      title: 'isspace 第 1 关：是不是空白',
      goal: '用 isspace 判断字符是不是空白字符。',
      input: '一行，一个字符。',
      output: '是空白输出 YES，否则输出 NO。',
      cases: [[' \n', 'YES\n'], ['\t\n', 'YES\n'], ['A\n', 'NO\n'], ['7\n', 'NO\n']],
      hints: ['用 int c = getchar(); 读取第一个字符。', '空格、制表符、换行等在 C 里都属于空白字符。'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    int c = getchar();\n    printf(isspace(c) ? "YES\\n" : "NO\\n");\n    return 0;\n}\n',
      explain: 'isspace 覆盖空格、制表符、换行、回车等空白字符。'
    },
    {
      title: 'isspace 第 2 关：数空格',
      goal: '用 isspace 统计一整行里有多少个空白字符。',
      input: '一行字符串。',
      output: '输出空白字符数量。',
      cases: [['a b c\n', '2\n'], ['no_space\n', '0\n'], ['  x  \n', '4\n'], ['a\tb\n', '1\n']],
      hints: ['逐字符读到换行或 -1 为止。', 'if (isspace(c)) count++;'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    int c, count = 0;\n    while ((c = getchar()) != -1 && c != \'\\n\') {\n        if (isspace(c)) count++;\n    }\n    printf("%d\\n", count);\n    return 0;\n}\n',
      explain: '使用 getchar 能完整处理带空格的一行文本。'
    },
    {
      title: 'isspace 第 3 关：压缩连续空白',
      goal: '用 isspace 把连续空白压缩成一个空格。',
      input: '一行字符串。',
      output: '输出压缩后的字符串，末尾不带空格。',
      cases: [['a   b  c\n', 'a b c\n'], ['  hello   world  \n', 'hello world\n'], ['abc\n', 'abc\n'], ['   \n', '\n']],
      hints: ['用 inSpace 记录刚才是否处于空白中。', '只在第一次遇到连续空白时输出一个空格。', '最后如果输出过空格，可以用退格逻辑避免末尾空格；本题简单做法是标记 pendingSpace。'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    int c;\n    int started = 0;\n    int pendingSpace = 0;\n    while ((c = getchar()) != -1 && c != \'\\n\') {\n        if (isspace(c)) {\n            if (started) pendingSpace = 1;\n        } else {\n            if (pendingSpace) { putchar(\' \'); pendingSpace = 0; }\n            putchar(c);\n            started = 1;\n        }\n    }\n    printf("\\n");\n    return 0;\n}\n',
      explain: 'pendingSpace 让空白延迟输出，从而自动丢掉开头和末尾的多余空白。'
    }
  ]);

  addFamily('isupper', 'ctype.h', [
    {
      title: 'isupper 第 1 关：是不是大写字母',
      goal: '用 isupper 判断字符是否为大写字母。',
      input: '一行，一个字符。',
      output: '是大写输出 YES，否则输出 NO。',
      cases: [['A\n', 'YES\n'], ['Z\n', 'YES\n'], ['a\n', 'NO\n'], ['7\n', 'NO\n']],
      hints: ['只判断大写字母，不判断小写。', 'isupper(ch) 返回非 0 表示成立。'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char ch;\n    scanf(" %c", &ch);\n    printf(isupper(ch) ? "YES\\n" : "NO\\n");\n    return 0;\n}\n',
      explain: 'isupper 和 isalpha 不同，它只认 A～Z。'
    },
    {
      title: 'isupper 第 2 关：数大写字母',
      goal: '用 isupper 统计字符串中的大写字母数量。',
      input: '一行，一个字符串。',
      output: '输出大写字母数量。',
      cases: [['AbC\n', '2\n'], ['ABC\n', '3\n'], ['abc\n', '0\n'], ['MimiC\n', '2\n']],
      hints: ['遍历字符串。', 'if (isupper(s[i])) count++;'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    int count = 0;\n    for (int i = 0; s[i] != \'\\0\'; i++) if (isupper(s[i])) count++;\n    printf("%d\\n", count);\n    return 0;\n}\n',
      explain: 'isupper 只统计大写字母，数字和标点不会计入。'
    },
    {
      title: 'isupper 第 3 关：首字母是大写吗',
      goal: '用 isupper 判断字符串第一个字符是否大写。',
      input: '一行，一个非空字符串。',
      output: '首字母大写输出 YES，否则输出 NO。',
      cases: [['Mimi\n', 'YES\n'], ['mimi\n', 'NO\n'], ['C99\n', 'YES\n'], ['7cat\n', 'NO\n']],
      hints: ['字符串第一个字符是 s[0]。', '只检查 s[0]，不需要循环。'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    printf(isupper(s[0]) ? "YES\\n" : "NO\\n");\n    return 0;\n}\n',
      explain: '字符串可以像数组一样用下标读取单个字符。'
    }
  ]);

  addFamily('islower', 'ctype.h', [
    {
      title: 'islower 第 1 关：是不是小写字母',
      goal: '用 islower 判断字符是否为小写字母。',
      input: '一行，一个字符。',
      output: '是小写输出 YES，否则输出 NO。',
      cases: [['a\n', 'YES\n'], ['z\n', 'YES\n'], ['A\n', 'NO\n'], ['7\n', 'NO\n']],
      hints: ['islower 只认 a～z。', 'scanf(" %c", &ch) 读取字符。'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char ch;\n    scanf(" %c", &ch);\n    printf(islower(ch) ? "YES\\n" : "NO\\n");\n    return 0;\n}\n',
      explain: 'isupper 和 islower 是两个独立的分类函数。'
    },
    {
      title: 'islower 第 2 关：数小写字母',
      goal: '用 islower 统计字符串中的小写字母数量。',
      input: '一行，一个字符串。',
      output: '输出小写字母数量。',
      cases: [['AbC\n', '1\n'], ['abc\n', '3\n'], ['ABC\n', '0\n'], ['Mimi\n', '3\n']],
      hints: ['循环到 \\0。', 'if (islower(s[i])) count++;'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    int count = 0;\n    for (int i = 0; s[i] != \'\\0\'; i++) if (islower(s[i])) count++;\n    printf("%d\\n", count);\n    return 0;\n}\n',
      explain: '小写字母计数是大写/小写格式检查的基础。'
    },
    {
      title: 'islower 第 3 关：首字母是小写吗',
      goal: '用 islower 判断字符串第一个字符是否小写。',
      input: '一行，一个非空字符串。',
      output: '首字母小写输出 YES，否则输出 NO。',
      cases: [['mimi\n', 'YES\n'], ['Mimi\n', 'NO\n'], ['c99\n', 'YES\n'], ['9cat\n', 'NO\n']],
      hints: ['只检查 s[0]。', 'isdigit 等其他函数不需要用到。'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    printf(islower(s[0]) ? "YES\\n" : "NO\\n");\n    return 0;\n}\n',
      explain: '用下标选出一个字符，再交给字符分类函数。'
    }
  ]);

  addFamily('toupper', 'ctype.h', [
    {
      title: 'toupper 第 1 关：小写变大写',
      goal: '用 toupper 把一个小写字母转换成大写。',
      input: '一行，一个字符。',
      output: '输出转换后的字符。',
      cases: [['a\n', 'A\n'], ['m\n', 'M\n'], ['Z\n', 'Z\n'], ['7\n', '7\n']],
      hints: ['toupper 返回字符编码。', '用 %c 输出 toupper(ch)。'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char ch;\n    scanf(" %c", &ch);\n    printf("%c\\n", toupper(ch));\n    return 0;\n}\n',
      explain: 'toupper 通常会把非小写字母原样返回。'
    },
    {
      title: 'toupper 第 2 关：整词大写',
      goal: '用 toupper 把字符串中的小写字母全部转成大写。',
      input: '一行，一个字符串。',
      output: '输出大写字符串。',
      cases: [['Mimi\n', 'MIMI\n'], ['abc123\n', 'ABC123\n'], ['C99\n', 'C99\n'], ['hello\n', 'HELLO\n']],
      hints: ['逐个字符调用 toupper。', '其它字符可以原样输出。'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    for (int i = 0; s[i] != \'\\0\'; i++) s[i] = (char)toupper((unsigned char)s[i]);\n    printf("%s\\n", s);\n    return 0;\n}\n',
      explain: '修改字符串本身需要逐个字符赋值。'
    },
    {
      title: 'toupper 第 3 关：首字母大写',
      goal: '只把字符串第一个字符用 toupper 转成大写。',
      input: '一行，一个非空字符串。',
      output: '输出首字母大写后的字符串。',
      cases: [['mimi\n', 'Mimi\n'], ['cat\n', 'Cat\n'], ['C99\n', 'C99\n'], ['7up\n', '7up\n']],
      hints: ['s[0] = (char)toupper((unsigned char)s[0]);', '然后输出整个字符串。'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    s[0] = (char)toupper((unsigned char)s[0]);\n    printf("%s\\n", s);\n    return 0;\n}\n',
      explain: 'toupper 的参数转换为 unsigned char，是处理任意输入字符的稳妥写法。'
    }
  ]);

  addFamily('tolower', 'ctype.h', [
    {
      title: 'tolower 第 1 关：大写变小写',
      goal: '用 tolower 把一个大写字母转换成小写。',
      input: '一行，一个字符。',
      output: '输出转换后的字符。',
      cases: [['A\n', 'a\n'], ['M\n', 'm\n'], ['z\n', 'z\n'], ['7\n', '7\n']],
      hints: ['tolower 返回转换后的字符编码。', 'printf("%c", tolower(ch));'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char ch;\n    scanf(" %c", &ch);\n    printf("%c\\n", tolower(ch));\n    return 0;\n}\n',
      explain: 'tolower 主要影响 A～Z，其他字符通常不变。'
    },
    {
      title: 'tolower 第 2 关：整词小写',
      goal: '用 tolower 把字符串中的大写字母全部转成小写。',
      input: '一行，一个字符串。',
      output: '输出小写字符串。',
      cases: [['MIMI\n', 'mimi\n'], ['ABC123\n', 'abc123\n'], ['c99\n', 'c99\n'], ['Hello\n', 'hello\n']],
      hints: ['循环处理每个字符。', 's[i] = (char)tolower((unsigned char)s[i]);'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    for (int i = 0; s[i] != \'\\0\'; i++) s[i] = (char)tolower((unsigned char)s[i]);\n    printf("%s\\n", s);\n    return 0;\n}\n',
      explain: 'tolower 与 toupper 常用于统一输入格式。'
    },
    {
      title: 'tolower 第 3 关：首字母小写',
      goal: '只把字符串第一个字符用 tolower 转成小写。',
      input: '一行，一个非空字符串。',
      output: '输出首字母小写后的字符串。',
      cases: [['Mimi\n', 'mimi\n'], ['Cat\n', 'cat\n'], ['c99\n', 'c99\n'], ['7Up\n', '7Up\n']],
      hints: ['只修改 s[0]。', '其余字符保持原样。'],
      code: '#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char s[100];\n    scanf("%s", s);\n    s[0] = (char)tolower((unsigned char)s[0]);\n    printf("%s\\n", s);\n    return 0;\n}\n',
      explain: '只处理第一个字符可以用于变量名风格或句子开头检查。'
    }
  ]);

  CC.CODE_DRILLS = (CC.CODE_DRILLS || []).concat(tasks);
})(typeof globalThis !== 'undefined' ? globalThis : this);
