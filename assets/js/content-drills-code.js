/*!
 * 粉猫捉虫 · 函数闯关：在线编程题（PTA 风格）
 * 24 道完整编程题，每题提供题面、输入输出格式、样例、隐藏测试点、提示与参考答案。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});

  var P = [
    {
      id: 'code-stdio-01', kind: 'code', header: 'stdio.h', level: 1,
      title: '猫咪温度播报',
      functions: ['printf', 'scanf'],
      story: '捉虫在门口装了一块温度牌。它想让你读入温度，再播报给大家听。',
      goal: '读入一个整数温度，按指定格式输出。',
      inputFormat: '一行，一个整数 t（-100 ≤ t ≤ 100）。',
      outputFormat: '输出一行：当前温度：t℃',
      constraints: 't 在 int 范围内；格式中的中文和全角冒号要一模一样。',
      examples: [{ stdin: '26\n', stdout: '当前温度：26℃\n', note: '直接套公式：冒号、数字、℃。' }],
      tests: [
        { name: '样例：26 度', stdin: '26\n', expect: '当前温度：26℃\n' },
        { name: '零下温度', stdin: '-5\n', expect: '当前温度：-5℃\n' },
        { name: '零度', stdin: '0\n', expect: '当前温度：0℃\n' },
        { name: '高温', stdin: '36\n', expect: '当前温度：36℃\n' }
      ],
      starter: '#include <stdio.h>\n\nint main() {\n    int t;\n    // TODO: 读入 t，然后按格式输出\n\n    return 0;\n}\n',
      hints: ['读取整数：scanf("%d", &t);', '输出：printf("当前温度：%d℃\\n", t);'],
      solution: '#include <stdio.h>\n\nint main() {\n    int t;\n    scanf("%d", &t);\n    printf("当前温度：%d℃\\n", t);\n    return 0;\n}\n',
      explain: 'scanf 把键盘输入写进变量，printf 再把变量替换进格式字符串。'
    },
    {
      id: 'code-stdio-02', kind: 'code', header: 'stdio.h', level: 1,
      title: '三袋鱼干的平均分',
      functions: ['scanf', 'printf'],
      story: '捉虫今天收到了三袋鱼干。它想先知道总数，再算平均每袋有多少。',
      goal: '读入三个整数，输出总数和平均值，平均值保留两位小数。',
      inputFormat: '一行，三个整数 a、b、c。',
      outputFormat: '两行：总数：sum 和 平均：average（两位小数）。',
      constraints: '结果在 double 能表示的范围内。',
      examples: [{ stdin: '3 4 5\n', stdout: '总数：12\n平均：4.00\n', note: '12 / 3 = 4，保留两位小数写成 4.00。' }],
      tests: [
        { name: '样例', stdin: '3 4 5\n', expect: '总数：12\n平均：4.00\n' },
        { name: '除不尽', stdin: '10 20 31\n', expect: '总数：61\n平均：20.33\n' },
        { name: '含 0', stdin: '0 0 1\n', expect: '总数：1\n平均：0.33\n' },
        { name: '三袋大数', stdin: '100 99 98\n', expect: '总数：297\n平均：99.00\n' }
      ],
      starter: '#include <stdio.h>\n\nint main() {\n    int a, b, c;\n    // TODO: 读入三个数，算总和与平均值\n\n    return 0;\n}\n',
      hints: ['总和是 a + b + c。', '平均值要写成 (a + b + c) / 3.0，不能除以整数 3。'],
      solution: '#include <stdio.h>\n\nint main() {\n    int a, b, c;\n    scanf("%d %d %d", &a, &b, &c);\n    int sum = a + b + c;\n    printf("总数：%d\\n", sum);\n    printf("平均：%.2f\\n", sum / 3.0);\n    return 0;\n}\n',
      explain: '整数除以整数会丢掉小数；把除数写成 3.0，整个除法就会按 double 计算。'
    },
    {
      id: 'code-stdio-03', kind: 'code', header: 'stdio.h', level: 1,
      title: '会拆时间的秒表',
      functions: ['scanf', 'printf'],
      story: '工坊里的秒表只会显示总秒数，但捉虫想知道它到底走了几个小时、几分钟、几秒。',
      goal: '把总秒数拆成 HH:MM:SS。',
      inputFormat: '一行，一个非负整数 total（0 ≤ total ≤ 359999）。',
      outputFormat: '输出一行 HH:MM:SS，每个部分至少两位，不足两位补 0。',
      constraints: '1 小时 = 60 分钟，1 分钟 = 60 秒。',
      examples: [{ stdin: '3661\n', stdout: '01:01:01\n', note: '3661 秒 = 1 小时 1 分 1 秒。' }],
      tests: [
        { name: '样例', stdin: '3661\n', expect: '01:01:01\n' },
        { name: '不足一分钟', stdin: '59\n', expect: '00:00:59\n' },
        { name: '超过一天', stdin: '90061\n', expect: '25:01:01\n' },
        { name: '整一小时', stdin: '3600\n', expect: '01:00:00\n' }
      ],
      starter: '#include <stdio.h>\n\nint main() {\n    int total;\n    // TODO: 拆成小时、分钟、秒\n\n    return 0;\n}\n',
      hints: ['小时 = total / 3600；分钟 = (total % 3600) / 60；秒 = total % 60。', 'printf("%02d:%02d:%02d\\n", h, m, s); 中的 02 表示补零到两位。'],
      solution: '#include <stdio.h>\n\nint main() {\n    int total;\n    scanf("%d", &total);\n    int h = total / 3600;\n    int m = (total % 3600) / 60;\n    int s = total % 60;\n    printf("%02d:%02d:%02d\\n", h, m, s);\n    return 0;\n}\n',
      explain: '/ 取整、% 取余，正好可以把一个大单位拆成小单位。'
    },
    {
      id: 'code-stdio-04', kind: 'code', header: 'stdio.h', level: 2,
      title: '收银台的最少纸币',
      functions: ['scanf', 'printf'],
      story: '猫猫便利店只收整元。找零时，捉虫想用尽量少的纸币，把零钱递给客人。',
      goal: '计算找零金额，并求出用 20、10、5、1 元纸币找零时的最少张数。',
      inputFormat: '一行，两个整数 price 和 paid（0 ≤ price ≤ paid ≤ 10000）。',
      outputFormat: '两行：找零：change 元 和 最少纸币：count 张。',
      constraints: '纸币面额为 20、10、5、1 元；每种面额想用多少张都可以。',
      examples: [{ stdin: '37 100\n', stdout: '找零：63 元\n最少纸币：6 张\n', note: '63 = 20 + 20 + 20 + 1 + 1 + 1，共 6 张。' }],
      tests: [
        { name: '样例', stdin: '37 100\n', expect: '找零：63 元\n最少纸币：6 张\n' },
        { name: '十元以内', stdin: '12 20\n', expect: '找零：8 元\n最少纸币：4 张\n' },
        { name: '整一百', stdin: '0 100\n', expect: '找零：100 元\n最少纸币：5 张\n' },
        { name: '不需要找零', stdin: '50 50\n', expect: '找零：0 元\n最少纸币：0 张\n' }
      ],
      starter: '#include <stdio.h>\n\nint main() {\n    int price, paid;\n    // TODO: 先算 change，再贪心地用大面额纸币\n\n    return 0;\n}\n',
      hints: ['先算 change = paid - price。', '从 20 元开始：每次都拿尽可能多张，再对剩余金额继续处理。'],
      solution: '#include <stdio.h>\n\nint main() {\n    int price, paid;\n    scanf("%d %d", &price, &paid);\n    int change = paid - price;\n    int rest = change;\n    int count = 0;\n    count += rest / 20; rest %= 20;\n    count += rest / 10; rest %= 10;\n    count += rest / 5;  rest %= 5;\n    count += rest;\n    printf("找零：%d 元\\n", change);\n    printf("最少纸币：%d 张\\n", count);\n    return 0;\n}\n',
      explain: '这是贪心算法：能拿大面额就拿大面额。本题的面额 20、10、5、1 正好保证贪心得到最少张数。'
    },
    {
      id: 'code-stdio-05', kind: 'code', header: 'stdio.h', level: 1,
      title: '会打印小票的猫',
      functions: ['scanf', 'printf'],
      story: '猫猫便利店的第一张小票要由你打印。商品名、数量、单价都从输入里来。',
      goal: '按固定格式输出商品、数量和金额。',
      inputFormat: '一行：商品名（不含空格）、整数数量、浮点单价。',
      outputFormat: '三行，依次是商品名、数量和金额；金额保留两位小数。',
      constraints: '商品名长度不超过 30，数量在 0～999 之间，单价不小于 0。',
      examples: [{ stdin: '鱼干 3 12.5\n', stdout: '商品：鱼干\n数量：3\n金额：37.50\n', note: '3 × 12.5 = 37.5，按两位小数打印成 37.50。' }],
      tests: [
        { name: '样例', stdin: '鱼干 3 12.5\n', expect: '商品：鱼干\n数量：3\n金额：37.50\n' },
        { name: '猫罐头', stdin: '猫罐头 2 9.9\n', expect: '商品：猫罐头\n数量：2\n金额：19.80\n' },
        { name: '零数量', stdin: '毛线球 0 4.25\n', expect: '商品：毛线球\n数量：0\n金额：0.00\n' },
        { name: '多件商品', stdin: '猫薄荷 7 3.2\n', expect: '商品：猫薄荷\n数量：7\n金额：22.40\n' }
      ],
      starter: '#include <stdio.h>\n\nint main() {\n    char name[31];\n    int qty;\n    double price;\n    // TODO: 读入并计算总金额\n\n    return 0;\n}\n',
      hints: ['商品名是字符串，用 %s 读取；数量用 %d；单价用 %lf 读取到 double。', '金额 = qty * price。'],
      solution: '#include <stdio.h>\n\nint main() {\n    char name[31];\n    int qty;\n    double price;\n    scanf("%s %d %lf", name, &qty, &price);\n    printf("商品：%s\\n", name);\n    printf("数量：%d\\n", qty);\n    printf("金额：%.2f\\n", qty * price);\n    return 0;\n}\n',
      explain: 'scanf 读字符串时，数组名 name 本身就是地址，不需要再写 &name。'
    },
    {
      id: 'code-string-01', kind: 'code', header: 'string.h', level: 1,
      title: '名字有多长',
      functions: ['scanf', 'strlen', 'printf'],
      story: '捉虫要在木牌上刻名字，得先知道名字占几个字节。',
      goal: '读入一个不含空格的字符串，输出它的字符数。',
      inputFormat: '一行，一个长度不超过 99 的非空字符串。',
      outputFormat: '输出：名字 有 n 个字符',
      constraints: '字符数为 ASCII 字符的个数。',
      examples: [{ stdin: 'Mimi\n', stdout: 'Mimi 有 4 个字符\n', note: 'M-i-m-i 一共 4 个字符。' }],
      tests: [
        { name: '样例', stdin: 'Mimi\n', expect: 'Mimi 有 4 个字符\n' },
        { name: '单字符', stdin: 'C\n', expect: 'C 有 1 个字符\n' },
        { name: '长名字', stdin: 'FenmaoZhuochong\n', expect: 'FenmaoZhuochong 有 15 个字符\n' },
        { name: '带数字', stdin: 'cat2026\n', expect: 'cat2026 有 7 个字符\n' }
      ],
      starter: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100];\n    // TODO: 读入字符串并求长度\n\n    return 0;\n}\n',
      hints: ['strlen(s) 返回字符串长度。', 'printf("%s 有 %d 个字符\\n", s, (int)strlen(s));'],
      solution: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100];\n    scanf("%s", s);\n    printf("%s 有 %d 个字符\\n", s, (int)strlen(s));\n    return 0;\n}\n',
      explain: 'strlen 从字符串开头数到 \\0 之前，不计入结尾的 \\0。'
    },
    {
      id: 'code-string-02', kind: 'code', header: 'string.h', level: 2,
      title: '把名字倒着念',
      functions: ['scanf', 'strlen', 'printf'],
      story: '门上的魔咒要求把名字倒着念。捉虫想请你写一个小程序帮忙。',
      goal: '读入一个单词并原地反转，再输出反转后的字符串。',
      inputFormat: '一行，一个长度不超过 99 的非空字符串。',
      outputFormat: '输出反转后的字符串。',
      constraints: '字符串中不含空格。',
      examples: [{ stdin: 'Mimi\n', stdout: 'imiM\n', note: '第一个和最后一个字符交换，再向中间靠拢。' }],
      tests: [
        { name: '样例', stdin: 'Mimi\n', expect: 'imiM\n' },
        { name: '回文', stdin: 'level\n', expect: 'level\n' },
        { name: '英文单词', stdin: 'coding\n', expect: 'gnidoc\n' },
        { name: '单字符', stdin: 'C\n', expect: 'C\n' }
      ],
      starter: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100];\n    // TODO: 交换首尾字符\n\n    return 0;\n}\n',
      hints: ['用 left = 0、right = strlen(s) - 1 两个下标。', '只要 left < right，就交换 s[left] 和 s[right]，然后各自向中间移动。'],
      solution: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100];\n    scanf("%s", s);\n    int left = 0;\n    int right = (int)strlen(s) - 1;\n    while (left < right) {\n        char t = s[left];\n        s[left] = s[right];\n        s[right] = t;\n        left++;\n        right--;\n    }\n    printf("%s\\n", s);\n    return 0;\n}\n',
      explain: '原地反转只用了常数个额外变量，是双指针的经典练习。'
    },
    {
      id: 'code-string-03', kind: 'code', header: 'string.h', level: 2,
      title: '回文暗号',
      functions: ['scanf', 'strlen'],
      story: '森林石门只接受回文暗号。正着念和倒着念一样，才能打开。',
      goal: '判断输入字符串是否为回文，区分大小写。',
      inputFormat: '一行，一个长度不超过 99 的非空字符串。',
      outputFormat: '是回文则输出「是回文」，否则输出「不是回文」。',
      constraints: '严格区分大小写，A 与 a 不相同。',
      examples: [{ stdin: 'level\n', stdout: '是回文\n', note: '首尾依次相等。' }],
      tests: [
        { name: '样例', stdin: 'level\n', expect: '是回文\n' },
        { name: '不是回文', stdin: 'mimi\n', expect: '不是回文\n' },
        { name: '单字符', stdin: 'a\n', expect: '是回文\n' },
        { name: '区分大小写', stdin: 'Abcba\n', expect: '不是回文\n' }
      ],
      starter: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100];\n    // TODO: 从两端向中间比较\n\n    return 0;\n}\n',
      hints: ['两个下标分别从 0 和 strlen(s)-1 出发。', '一旦对应字符不同，就可以立刻判定不是回文。'],
      solution: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100];\n    scanf("%s", s);\n    int left = 0;\n    int right = (int)strlen(s) - 1;\n    int ok = 1;\n    while (left < right) {\n        if (s[left] != s[right]) { ok = 0; break; }\n        left++;\n        right--;\n    }\n    printf(ok ? "是回文\\n" : "不是回文\\n");\n    return 0;\n}\n',
      explain: '回文判断不需要创建反串，双指针比较就已经足够。'
    },
    {
      id: 'code-string-04', kind: 'code', header: 'string.h', level: 2,
      title: '失踪字符的座位号',
      functions: ['scanf', 'strchr', 'printf'],
      story: '猫咪列车要找某个字符坐在第几个座位。找到了就报座位号，找不到就说没来。',
      goal: '查找字符在字符串中第一次出现的位置。',
      inputFormat: '一行：一个不含空格的字符串，以及一个要查找的字符。',
      outputFormat: '找到则输出「位置：i」（从 0 开始），找不到则输出「没找到」。',
      constraints: '字符串长度不超过 99；字符区分大小写。',
      examples: [{ stdin: 'banana a\n', stdout: '位置：1\n', note: '第一个 a 的下标是 1。' }],
      tests: [
        { name: '样例', stdin: 'banana a\n', expect: '位置：1\n' },
        { name: '没找到', stdin: 'mimi z\n', expect: '没找到\n' },
        { name: '在开头', stdin: 'cat c\n', expect: '位置：0\n' },
        { name: '连续字符', stdin: 'apple p\n', expect: '位置：1\n' }
      ],
      starter: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100], ch;\n    // TODO: 用 strchr 查找，再找下标\n\n    return 0;\n}\n',
      hints: ['scanf("%s %c", s, &ch); 会先跳过空白再读字符。', 'strchr(s, ch) 找不到时返回 NULL；找到后可以从 s[0] 开始数位置。'],
      solution: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100], ch;\n    scanf("%s %c", s, &ch);\n    char *p = strchr(s, ch);\n    if (p == NULL) {\n        printf("没找到\\n");\n    } else {\n        int i = 0;\n        while (s[i] != ch) i++;\n        printf("位置：%d\\n", i);\n    }\n    return 0;\n}\n',
      explain: 'strchr 返回指向第一个匹配字符的指针；字符串下标从 0 开始。'
    },
    {
      id: 'code-string-05', kind: 'code', header: 'string.h', level: 2,
      title: '把空格压缩掉',
      functions: ['getchar', 'putchar'],
      story: '传送带太窄，只允许没有空格的句子通过。把每个字符检查一遍，空格就不要放行。',
      goal: '读入一整行，删除其中所有空格和制表符后输出。',
      inputFormat: '一行字符串，可能包含空格，长度不超过 199。',
      outputFormat: '输出删除空格和制表符后的字符串。',
      constraints: '保留其他字符的原始顺序。',
      examples: [{ stdin: 'I love C\n', stdout: 'IloveC\n', note: '两个空格被删除。' }],
      tests: [
        { name: '样例', stdin: 'I love C\n', expect: 'IloveC\n' },
        { name: '前后都有空格', stdin: '  cat  \n', expect: 'cat\n' },
        { name: '只有空格', stdin: '     \n', expect: '\n' },
        { name: '无空格', stdin: 'fenmao\n', expect: 'fenmao\n' }
      ],
      starter: '#include <stdio.h>\n\nint main() {\n    int c;\n    // TODO: 逐个读字符，跳过空格和制表符\n\n    return 0;\n}\n',
      hints: ['getchar() 一次读一个字符，读到换行或 -1 就停止。', '只有 c != \' \' 且 c != \'\\t\' 时才 putchar(c)。'],
      solution: '#include <stdio.h>\n\nint main() {\n    int c;\n    while ((c = getchar()) != -1 && c != \'\\n\') {\n        if (c != \' \' && c != \'\\t\') putchar(c);\n    }\n    printf("\\n");\n    return 0;\n}\n',
      explain: 'getchar 的返回值是 int，这样才能同时表示普通字符和 EOF（通常是 -1）。'
    },
    {
      id: 'code-stdlib-01', kind: 'code', header: 'stdlib.h', level: 1,
      title: '数字字符串翻倍机',
      functions: ['scanf', 'atoi', 'printf'],
      story: '门牌号码被写在纸条上。捉虫要把纸条上的数字读出来，再变出一个两倍大的数字。',
      goal: '读入一个数字字符串，转换成整数后输出它的两倍。',
      inputFormat: '一行，一个可带正负号的十进制整数字符串。',
      outputFormat: '输出：翻倍：value',
      constraints: '转换后的结果在 int 范围内；输入不含空格。',
      examples: [{ stdin: '-15\n', stdout: '翻倍：-30\n', note: 'atoi("-15") 得到 -15。' }],
      tests: [
        { name: '样例', stdin: '-15\n', expect: '翻倍：-30\n' },
        { name: '普通整数', stdin: '42\n', expect: '翻倍：84\n' },
        { name: '前导零', stdin: '007\n', expect: '翻倍：14\n' },
        { name: '显式正号', stdin: '+9\n', expect: '翻倍：18\n' }
      ],
      starter: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    char text[40];\n    // TODO: 读入字符串，用 atoi 转成整数\n\n    return 0;\n}\n',
      hints: ['先用 scanf("%s", text) 读字符串。', 'int n = atoi(text); 然后输出 n * 2。'],
      solution: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    char text[40];\n    scanf("%s", text);\n    int n = atoi(text);\n    printf("翻倍：%d\\n", n * 2);\n    return 0;\n}\n',
      explain: 'atoi 会把字符串开头的整数部分转换成 int；它不是通用的错误检查工具。'
    },
    {
      id: 'code-stdlib-02', kind: 'code', header: 'stdlib.h', level: 2,
      title: '小数纸条求和',
      functions: ['scanf', 'atof', 'printf'],
      story: '两张价格纸条被雨水打湿了，只剩下字符串。捉虫想把它们当成小数加在一起。',
      goal: '把两个数字字符串转换成 double 并求和。',
      inputFormat: '一行，两个可以带小数点的数字字符串。',
      outputFormat: '输出：合计：sum（保留两位小数）',
      constraints: '数字字符串都不含空格；结果在 double 范围内。',
      examples: [{ stdin: '12.50 7.25\n', stdout: '合计：19.75\n', note: '两个字符串先转成 double 再相加。' }],
      tests: [
        { name: '样例', stdin: '12.50 7.25\n', expect: '合计：19.75\n' },
        { name: '小数进位', stdin: '0.1 0.2\n', expect: '合计：0.30\n' },
        { name: '负数', stdin: '-5.5 2.25\n', expect: '合计：-3.25\n' },
        { name: '大数', stdin: '1000 0.99\n', expect: '合计：1000.99\n' }
      ],
      starter: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    char a[40], b[40];\n    // TODO: 读入两个字符串并用 atof 转换\n\n    return 0;\n}\n',
      hints: ['atof 返回 double。', 'double x = atof(a), y = atof(b); 再用 printf("%.2f", x + y)。'],
      solution: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    char a[40], b[40];\n    scanf("%s %s", a, b);\n    double x = atof(a);\n    double y = atof(b);\n    printf("合计：%.2f\\n", x + y);\n    return 0;\n}\n',
      explain: 'atof 把字符串转换成 double；和 atoi 一样，它适合教学和简单解析，不等于完整的输入校验。'
    },
    {
      id: 'code-stdlib-03', kind: 'code', header: 'stdlib.h', level: 1,
      title: '两箱猫粮差多少',
      functions: ['scanf', 'abs', 'printf'],
      story: '两个箱子里装着不同重量的猫粮。捉虫只关心它们相差多少，不关心谁更重。',
      goal: '读入两个整数，输出它们差的绝对值。',
      inputFormat: '一行，两个整数 a、b（-10000 ≤ a,b ≤ 10000）。',
      outputFormat: '输出：相差：d',
      constraints: '必须使用 abs 函数求绝对值。',
      examples: [{ stdin: '12 20\n', stdout: '相差：8\n', note: '12 - 20 = -8，绝对值是 8。' }],
      tests: [
        { name: '样例', stdin: '12 20\n', expect: '相差：8\n' },
        { name: '前一个更大', stdin: '30 7\n', expect: '相差：23\n' },
        { name: '相等', stdin: '-4 -4\n', expect: '相差：0\n' },
        { name: '一正一负', stdin: '-9 6\n', expect: '相差：15\n' }
      ],
      starter: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int a, b;\n    // TODO: 读入两个数，输出它们差的绝对值\n\n    return 0;\n}\n',
      hints: ['先算 a - b。', '把结果交给 abs：abs(a - b)。'],
      solution: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("相差：%d\\n", abs(a - b));\n    return 0;\n}\n',
      explain: 'abs 返回整数的绝对值；浮点数对应的是 math.h 里的 fabs。'
    },
    {
      id: 'code-ctype-01', kind: 'code', header: 'ctype.h', level: 2,
      title: '字符身份证统计',
      functions: ['getchar', 'isalpha', 'isdigit'],
      story: '猫猫海关要统计一整行文字里有多少个字母、数字和其他字符。',
      goal: '逐字符分类并统计三类字符数量。',
      inputFormat: '一行字符串，长度不超过 199。',
      outputFormat: '三行：字母：a　数字：b　其他：c（每项各占一行）。',
      constraints: '换行符本身不计入统计。',
      examples: [{ stdin: 'C99 is fun!\n', stdout: '字母：6\n数字：2\n其他：3\n', note: '空格和感叹号都算「其他」。' }],
      tests: [
        { name: '样例', stdin: 'C99 is fun!\n', expect: '字母：6\n数字：2\n其他：3\n' },
        { name: '纯字母数字', stdin: 'abc123\n', expect: '字母：3\n数字：3\n其他：0\n' },
        { name: '全是空格', stdin: '   \n', expect: '字母：0\n数字：0\n其他：3\n' },
        { name: '混合标点', stdin: 'Hello, 2026!\n', expect: '字母：5\n数字：4\n其他：3\n' }
      ],
      starter: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    int c;\n    // TODO: 用 isalpha 和 isdigit 分类\n\n    return 0;\n}\n',
      hints: ['用 while ((c = getchar()) != -1 && c != \'\\n\') 逐个读。', 'if (isalpha(c)) letters++; else if (isdigit(c)) digits++; else others++;'],
      solution: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    int c;\n    int letters = 0, digits = 0, others = 0;\n    while ((c = getchar()) != -1 && c != \'\\n\') {\n        if (isalpha(c)) letters++;\n        else if (isdigit(c)) digits++;\n        else others++;\n    }\n    printf("字母：%d\\n", letters);\n    printf("数字：%d\\n", digits);\n    printf("其他：%d\\n", others);\n    return 0;\n}\n',
      explain: 'isalpha 判断字母，isdigit 判断十进制数字；它们接收的是字符编码，不是字符串。'
    },
    {
      id: 'code-ctype-02', kind: 'code', header: 'ctype.h', level: 1,
      title: '狮子吼翻译机',
      functions: ['getchar', 'putchar', 'toupper'],
      story: '捉虫戴上了狮子帽，想把整句话都变成大写再吼出来。',
      goal: '读入一整行并把所有小写字母转换成大写，其他字符保持不变。',
      inputFormat: '一行字符串，长度不超过 199。',
      outputFormat: '转换后的字符串。',
      constraints: '保留原有空格和标点。',
      examples: [{ stdin: 'mimi is here!\n', stdout: 'MIMI IS HERE!\n', note: 'toupper 只改变字母。' }],
      tests: [
        { name: '样例', stdin: 'mimi is here!\n', expect: 'MIMI IS HERE!\n' },
        { name: '字母数字混合', stdin: 'C99 cat\n', expect: 'C99 CAT\n' },
        { name: '已经大写', stdin: 'MiXeD!\n', expect: 'MIXED!\n' },
        { name: '保留前后空格', stdin: '  hi  \n', expect: '  HI  \n' }
      ],
      starter: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    int c;\n    // TODO: 读一个字符，转大写，再输出\n\n    return 0;\n}\n',
      hints: ['getchar 读到 -1 或换行时停止。', 'putchar(toupper(c)) 会把结果写回屏幕。'],
      solution: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    int c;\n    while ((c = getchar()) != -1 && c != \'\\n\') {\n        putchar(toupper(c));\n    }\n    printf("\\n");\n    return 0;\n}\n',
      explain: 'toupper 对非小写字母通常原样返回，所以不需要额外写 if 判断。'
    },
    {
      id: 'code-ctype-03', kind: 'code', header: 'ctype.h', level: 3,
      title: '标题制造机',
      functions: ['getchar', 'isalpha', 'isspace', 'toupper', 'tolower'],
      story: '捉虫要给森林公告加一个漂亮的标题格式：每个单词首字母大写，其他字母小写。',
      goal: '把一行文字转换成标题格式，同时保留空格、数字和标点。',
      inputFormat: '一行字符串，长度不超过 199。',
      outputFormat: '转换后的标题格式字符串。',
      constraints: '单词之间可能有一个或多个空格；数字和标点不触发新单词。',
      examples: [{ stdin: 'hello world\n', stdout: 'Hello World\n', note: '每个单词首字母大写，其余字母小写。' }],
      tests: [
        { name: '样例', stdin: 'hello world\n', expect: 'Hello World\n' },
        { name: '大小写混合', stdin: 'c IS FUN\n', expect: 'C Is Fun\n' },
        { name: '多个空格', stdin: '  mixEd 42 abc\n', expect: '  Mixed 42 Abc\n' },
        { name: '撇号', stdin: "o'neil   code\n", expect: "O'neil   Code\n" }
      ],
      starter: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    int c;\n    int newWord = 1;\n    // TODO: 根据 newWord 决定 toupper 还是 tolower\n\n    return 0;\n}\n',
      hints: ['遇到空格时输出空格，并把 newWord 设为 1。', '遇到字母时：newWord 为真就用 toupper，否则用 tolower，然后设 newWord = 0。', '标点也保持原样，并让当前单词继续。'],
      solution: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    int c;\n    int newWord = 1;\n    while ((c = getchar()) != -1 && c != \'\\n\') {\n        if (isspace(c)) {\n            putchar(c);\n            newWord = 1;\n        } else if (isalpha(c)) {\n            putchar(newWord ? toupper(c) : tolower(c));\n            newWord = 0;\n        } else {\n            putchar(c);\n            newWord = 0;\n        }\n    }\n    printf("\\n");\n    return 0;\n}\n',
      explain: 'newWord 是状态变量：它记录「现在是不是正处在一个新单词的开头」。'
    },
    {
      id: 'code-math-01', kind: 'code', header: 'math.h', level: 1,
      title: '圆形地毯的布料',
      functions: ['scanf', 'acos', 'printf'],
      story: '捉虫要给圆形的猫窝剪一块地毯。它得先算清楚需要多少面积的布料。',
      goal: '根据半径计算圆面积，结果保留两位小数。',
      inputFormat: '一行，一个非负实数 r。',
      outputFormat: '输出：面积：area（两位小数）',
      constraints: '0 ≤ r ≤ 1000；用 acos(-1.0) 取得圆周率，避免依赖非标准宏。',
      examples: [{ stdin: '1\n', stdout: '面积：3.14\n', note: 'π × 1² ≈ 3.14。' }],
      tests: [
        { name: '样例', stdin: '1\n', expect: '面积：3.14\n' },
        { name: '小数半径', stdin: '2.5\n', expect: '面积：19.63\n' },
        { name: '零半径', stdin: '0\n', expect: '面积：0.00\n' },
        { name: '大圆', stdin: '10\n', expect: '面积：314.16\n' }
      ],
      starter: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    double r;\n    // TODO: 用 acos(-1.0) 求圆周率并计算面积\n\n    return 0;\n}\n',
      hints: ['面积公式是 πr²。', '用 double pi = acos(-1.0) 取得圆周率；不要写成 r^2，^ 在 C 里是按位异或。'],
      solution: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    double r;\n    scanf("%lf", &r);\n    double pi = acos(-1.0);\n    printf("面积：%.2f\\n", pi * r * r);\n    return 0;\n}\n',
      explain: 'M_PI 并不是 ISO C 标准保证提供的宏；用 acos(-1.0) 自己求圆周率更可移植。'
    },
    {
      id: 'code-math-02', kind: 'code', header: 'math.h', level: 2,
      title: '两只猫的直线距离',
      functions: ['scanf', 'hypot', 'printf'],
      story: '地图上，两只猫分别站在两个点。捉虫想知道它们之间最短的直线距离。',
      goal: '读入两个二维坐标，用 hypot 计算距离并保留三位小数。',
      inputFormat: '一行，四个实数 x1 y1 x2 y2。',
      outputFormat: '输出：距离：d（三位小数）',
      constraints: '坐标绝对值不超过 10000。',
      examples: [{ stdin: '0 0 3 4\n', stdout: '距离：5.000\n', note: '直角边 3 和 4，斜边为 5。' }],
      tests: [
        { name: '样例', stdin: '0 0 3 4\n', expect: '距离：5.000\n' },
        { name: '同一点', stdin: '2 2 2 2\n', expect: '距离：0.000\n' },
        { name: '负坐标', stdin: '-1 -1 2 3\n', expect: '距离：5.000\n' },
        { name: '小数坐标', stdin: '1.5 2.5 4.5 6.5\n', expect: '距离：5.000\n' }
      ],
      starter: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    double x1, y1, x2, y2;\n    // TODO: 计算 dx、dy，再调用 hypot\n\n    return 0;\n}\n',
      hints: ['dx = x2 - x1，dy = y2 - y1。', 'hypot(dx, dy) 等价于 sqrt(dx*dx + dy*dy)，但更稳。'],
      solution: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    double x1, y1, x2, y2;\n    scanf("%lf %lf %lf %lf", &x1, &y1, &x2, &y2);\n    printf("距离：%.3f\\n", hypot(x2 - x1, y2 - y1));\n    return 0;\n}\n',
      explain: 'hypot 直接计算直角三角形的斜边，适合求二维距离。'
    },
    {
      id: 'code-math-03', kind: 'code', header: 'math.h', level: 2,
      title: '断桥斜边长度',
      functions: ['scanf', 'sqrt', 'printf'],
      story: '木桥的支撑架是一个直角三角形。捉虫量到了两条直角边，还差斜边长度。',
      goal: '根据两条直角边，用 sqrt 计算斜边长度。',
      inputFormat: '一行，两个正整数 a、b。',
      outputFormat: '输出：斜边：c（三位小数）',
      constraints: '1 ≤ a,b ≤ 10000。',
      examples: [{ stdin: '3 4\n', stdout: '斜边：5.000\n', note: '3² + 4² = 25，sqrt(25) = 5。' }],
      tests: [
        { name: '样例', stdin: '3 4\n', expect: '斜边：5.000\n' },
        { name: '经典勾股数', stdin: '5 12\n', expect: '斜边：13.000\n' },
        { name: '等腰直角', stdin: '1 1\n', expect: '斜边：1.414\n' },
        { name: '另一组勾股数', stdin: '8 15\n', expect: '斜边：17.000\n' }
      ],
      starter: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    int a, b;\n    // TODO: 计算 sqrt(a*a + b*b)\n\n    return 0;\n}\n',
      hints: ['a*a 和 b*b 都是整数，相加后用 sqrt 会转成 double。', 'sqrt 需要 #include <math.h>。'],
      solution: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("斜边：%.3f\\n", sqrt(a * a + b * b));\n    return 0;\n}\n',
      explain: 'sqrt 返回 double；用 %.3f 控制输出的小数位数。'
    },
    {
      id: 'code-math-04', kind: 'code', header: 'math.h', level: 3,
      title: '二次方程的两把钥匙',
      functions: ['scanf', 'sqrt', 'printf'],
      story: '石门用二次方程上锁。只要算出两个实根，就能同时转动两把钥匙。',
      goal: '解一元二次方程 ax² + bx + c = 0，保证输入有两个实根。',
      inputFormat: '一行，三个整数 a、b、c，保证 a ≠ 0 且 b² - 4ac ≥ 0。',
      outputFormat: '两行：根1：r1 和 根2：r2，均保留两位小数；r1 对应加号分支。',
      constraints: 'a,b,c 绝对值不超过 1000；测试数据保证判别式非负。',
      examples: [{ stdin: '1 -5 6\n', stdout: '根1：3.00\n根2：2.00\n', note: 'x² - 5x + 6 = 0 的两个根是 3 和 2。' }],
      tests: [
        { name: '样例', stdin: '1 -5 6\n', expect: '根1：3.00\n根2：2.00\n' },
        { name: '重根', stdin: '1 -2 1\n', expect: '根1：1.00\n根2：1.00\n' },
        { name: '两个不同根', stdin: '1 2 -3\n', expect: '根1：1.00\n根2：-3.00\n' },
        { name: '系数 2', stdin: '2 -3 1\n', expect: '根1：1.00\n根2：0.50\n' }
      ],
      starter: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    int a, b, c;\n    // TODO: 先算判别式 d，再算两个根\n\n    return 0;\n}\n',
      hints: ['判别式 d = b*b - 4.0*a*c。', 'r1 = (-b + sqrt(d)) / (2.0*a)，r2 把加号换减号。'],
      solution: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    int a, b, c;\n    scanf("%d %d %d", &a, &b, &c);\n    double d = b * b - 4.0 * a * c;\n    double r1 = (-b + sqrt(d)) / (2.0 * a);\n    double r2 = (-b - sqrt(d)) / (2.0 * a);\n    printf("根1：%.2f\\n", r1);\n    printf("根2：%.2f\\n", r2);\n    return 0;\n}\n',
      explain: '分母写成 2.0 * a 才能得到浮点除法；题目保证 sqrt 的参数非负。'
    },
    {
      id: 'code-mix-01', kind: 'code', header: '综合', level: 2,
      title: '一袋鱼干的最大、最小和总和',
      functions: ['scanf', 'printf', 'for'],
      story: '捉虫把 n 袋鱼干排成一排，想快速知道最多的一袋、最少的一袋，以及全部加起来有多少。',
      goal: '读入 n 个整数，求最大值、最小值和总和。',
      inputFormat: '第一行一个整数 n（1 ≤ n ≤ 100）；第二行 n 个整数。',
      outputFormat: '三行：最大、最小、总和。',
      constraints: '每个整数绝对値不超过 100000。',
      examples: [{ stdin: '5\n4 9 2 7 5\n', stdout: '最大：9\n最小：2\n总和：27\n', note: '遍历数组时同时维护三个值。' }],
      tests: [
        { name: '样例', stdin: '5\n4 9 2 7 5\n', expect: '最大：9\n最小：2\n总和：27\n' },
        { name: '全相同', stdin: '3\n6 6 6\n', expect: '最大：6\n最小：6\n总和：18\n' },
        { name: '含负数', stdin: '4\n-5 -1 -9 -3\n', expect: '最大：-1\n最小：-9\n总和：-18\n' },
        { name: '只有一个数', stdin: '1\n42\n', expect: '最大：42\n最小：42\n总和：42\n' }
      ],
      starter: '#include <stdio.h>\n\nint main() {\n    int n;\n    int a[100];\n    // TODO: 读入数组，再遍历求三个结果\n\n    return 0;\n}\n',
      hints: ['先把 a[0] 同时设为 max 和 min。', '从 i = 1 开始遍历，比较并更新；sum 从 0 开始累加。'],
      solution: '#include <stdio.h>\n\nint main() {\n    int n;\n    int a[100];\n    scanf("%d", &n);\n    for (int i = 0; i < n; i++) scanf("%d", &a[i]);\n    int max = a[0], min = a[0], sum = 0;\n    for (int i = 0; i < n; i++) {\n        if (a[i] > max) max = a[i];\n        if (a[i] < min) min = a[i];\n        sum += a[i];\n    }\n    printf("最大：%d\\n", max);\n    printf("最小：%d\\n", min);\n    printf("总和：%d\\n", sum);\n    return 0;\n}\n',
      explain: '这是数组遍历的常见模式：准备初始值，每个元素来一次就比较或累加。'
    },
    {
      id: 'code-mix-02', kind: 'code', header: '综合', level: 2,
      title: '素数门卫',
      functions: ['scanf', 'sqrt', 'for'],
      story: '森林里的门卫只让素数通过。它给你一个整数，要你判断是不是素数。',
      goal: '判断 n 是否为素数。',
      inputFormat: '一行，一个整数 n（1 ≤ n ≤ 100000）。',
      outputFormat: '是素数则输出「是素数」，否则输出「不是素数」。',
      constraints: '1 不是素数；2 是素数。',
      examples: [{ stdin: '97\n', stdout: '是素数\n', note: '只需要试除到 sqrt(97) 附近。' }],
      tests: [
        { name: '样例', stdin: '97\n', expect: '是素数\n' },
        { name: '2 是素数', stdin: '2\n', expect: '是素数\n' },
        { name: '合数', stdin: '4\n', expect: '不是素数\n' },
        { name: '1 不是素数', stdin: '1\n', expect: '不是素数\n' },
        { name: '大合数', stdin: '561\n', expect: '不是素数\n' }
      ],
      starter: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    int n;\n    // TODO: 特殊处理 n < 2，然后试除到 sqrt(n)\n\n    return 0;\n}\n',
      hints: ['先判断 if (n < 2) 不是素数。', '令 limit = (int)sqrt(n)，从 i = 2 试到 i <= limit。'],
      solution: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    int prime = n >= 2;\n    int limit = (int)sqrt(n);\n    for (int i = 2; i <= limit; i++) {\n        if (n % i == 0) { prime = 0; break; }\n    }\n    printf(prime ? "是素数\\n" : "不是素数\\n");\n    return 0;\n}\n',
      explain: '如果 n 有大于 sqrt(n) 的因子，那么它一定也有一个小于 sqrt(n) 的配对因子，所以试除到这里就够了。'
    },
    {
      id: 'code-mix-03', kind: 'code', header: '综合', level: 2,
      title: '分鱼干的最大公约数',
      functions: ['scanf', 'while', 'printf'],
      story: '两群猫要公平地分鱼干，并且每份同样多。捉虫需要知道两组数量的最大公约数。',
      goal: '用辗转相除法求两个非负整数的最大公约数。',
      inputFormat: '一行，两个整数 a、b（0 ≤ a,b ≤ 100000，且不同时为 0）。',
      outputFormat: '输出：最大公约数：g',
      constraints: '若其中一个数为 0，另一个数就是答案。',
      examples: [{ stdin: '12 18\n', stdout: '最大公约数：6\n', note: '18 % 12 = 6，12 % 6 = 0，所以答案是 6。' }],
      tests: [
        { name: '样例', stdin: '12 18\n', expect: '最大公约数：6\n' },
        { name: '互质', stdin: '17 5\n', expect: '最大公约数：1\n' },
        { name: '含零', stdin: '0 9\n', expect: '最大公约数：9\n' },
        { name: '更大的数', stdin: '48 36\n', expect: '最大公约数：12\n' }
      ],
      starter: '#include <stdio.h>\n\nint main() {\n    int a, b;\n    // TODO: 用 b = a % b 交换，直到 b 为 0\n\n    return 0;\n}\n',
      hints: ['循环条件 while (b != 0)。', 't = a % b；a = b；b = t。循环结束后 a 就是答案。'],
      solution: '#include <stdio.h>\n\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    while (b != 0) {\n        int t = a % b;\n        a = b;\n        b = t;\n    }\n    printf("最大公约数：%d\\n", a);\n    return 0;\n}\n',
      explain: '辗转相除法每次把问题变小，直到余数为 0；最后一个非零余数就是最大公约数。'
    },
    {
      id: 'code-mix-04', kind: 'code', header: '综合', level: 3,
      title: '把乱糟糟的数字排好队',
      functions: ['scanf', 'for', 'printf'],
      story: '仓库里的编号全乱了。捉虫要把它们从小到大排好，之后找东西就快多啦。',
      goal: '读入 n 个整数，用冒泡排序升序输出。',
      inputFormat: '第一行一个整数 n（1 ≤ n ≤ 100）；第二行 n 个整数。',
      outputFormat: '一行，从小到大输出数字，相邻数字用一个空格隔开，行末不要多余空格。',
      constraints: '数字可能重复，也可能为负数。',
      examples: [{ stdin: '5\n5 1 4 2 3\n', stdout: '1 2 3 4 5\n', note: '每一轮把还没排好的最大值推到末尾。' }],
      tests: [
        { name: '样例', stdin: '5\n5 1 4 2 3\n', expect: '1 2 3 4 5\n' },
        { name: '带重复', stdin: '6\n3 1 3 2 1 2\n', expect: '1 1 2 2 3 3\n' },
        { name: '含负数', stdin: '4\n-1 7 -5 0\n', expect: '-5 -1 0 7\n' },
        { name: '单元素', stdin: '1\n42\n', expect: '42\n' }
      ],
      starter: '#include <stdio.h>\n\nint main() {\n    int n;\n    int a[100];\n    // TODO: 读入后用两层循环做冒泡排序\n\n    return 0;\n}\n',
      hints: ['外层 i 从 0 到 n-1，内层 j 从 0 到 n-2-i。', '如果 a[j] > a[j+1]，交换两个元素。', '输出时先打印 a[0]，后面每个数前面加一个空格。'],
      solution: '#include <stdio.h>\n\nint main() {\n    int n;\n    int a[100];\n    scanf("%d", &n);\n    for (int i = 0; i < n; i++) scanf("%d", &a[i]);\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - 1 - i; j++) {\n            if (a[j] > a[j + 1]) {\n                int t = a[j];\n                a[j] = a[j + 1];\n                a[j + 1] = t;\n            }\n        }\n    }\n    printf("%d", a[0]);\n    for (int i = 1; i < n; i++) printf(" %d", a[i]);\n    printf("\\n");\n    return 0;\n}\n',
      explain: '冒泡排序每轮把当前未排序部分的最大值放到末尾；时间复杂度是 O(n²)，适合入门理解。'
    }
  ];

  CC.CODE_DRILLS = P;
})(typeof globalThis !== 'undefined' ? globalThis : this);
