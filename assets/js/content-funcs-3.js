/*!
 * 粉猫捉虫 · C 函数手册（三）：math.h / time.h / limits.h
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var FUNCS = CC.FUNCS || (CC.FUNCS = []);
  var HEADERS = CC.FUNC_HEADERS || (CC.FUNC_HEADERS = {});

  HEADERS['math.h'] = {
    id: 'math.h',
    icon: '📐',
    title: '数学函数',
    summary: '开方、乘方、三角函数、对数、取整、绝对值……所有「算数学」的函数。',
    when: '算面积、求距离、做游戏物理、处理小数时使用。',
    tips: [
      '三角函数吃的是「弧度」，不是角度。角度转弧度：角度 × M_PI / 180。',
      'sqrt 不能对负数开方；log 的参数必须大于 0。',
      '在 Linux 上用 gcc 编译时，链接阶段要加 -lm（例如 gcc a.c -lm）。',
      'abs 是整数绝对值（stdlib.h），小数要用 fabs（math.h）。'
    ],
    table: {
      title: '角度 ↔ 弧度',
      head: ['角度', '弧度'],
      rows: [['0°', '0'], ['30°', 'M_PI / 6'], ['45°', 'M_PI / 4'], ['60°', 'M_PI / 3'], ['90°', 'M_PI / 2'], ['180°', 'M_PI']]
    }
  };

  HEADERS['time.h'] = {
    id: 'time.h',
    icon: '⏰',
    title: '日期与时间',
    summary: '获取当前时间、计算程序运行了多久、把时间格式化成文字。',
    when: '需要用时间做随机种子（srand(time(NULL))）、计时、显示日期时使用。',
    tips: [
      'time_t 通常是从 1970-01-01 起的秒数。',
      'localtime 返回的是指向 struct tm 的指针，结构体属于进阶内容。',
      '本站解释器只支持 time()，其余时间函数需要真正的编译器。'
    ]
  };

  HEADERS['limits.h'] = {
    id: 'limits.h',
    icon: '📏',
    title: '整数范围',
    summary: '告诉你每种整数类型最大、最小能装多少，防止溢出。',
    when: '想知道 int 最多能存多大、或者判断会不会溢出时使用。',
    tips: [
      'int 通常是 4 字节：约 -21 亿 ~ 21 亿。',
      'long 在不同平台可能是 4 或 8 字节（64 位 Linux 是 8）。',
      '这些是编译期常量，不需要函数调用，直接写 INT_MAX 就行。'
    ],
    table: {
      title: '常见整数范围',
      head: ['常量', '含义', '典型值'],
      rows: [
        ['CHAR_MAX', 'char 最大值', '127'],
        ['CHAR_MIN', 'char 最小值', '-128'],
        ['UCHAR_MAX', 'unsigned char 最大值', '255'],
        ['SHRT_MAX', 'short 最大值', '32767'],
        ['INT_MAX', 'int 最大值', '2147483647'],
        ['INT_MIN', 'int 最小值', '-2147483648'],
        ['LONG_MAX', 'long 最大值', '平台相关']
      ]
    }
  };

  function add(o) { FUNCS.push(o); }

  // ======================= math.h =======================
  add({ id: 'sqrt', name: 'sqrt', header: 'math.h', level: 1, supported: true, tags: ['数学', '最常用'],
    proto: 'double sqrt(double x);',
    brief: '开平方。',
    params: 'x：要开方的数（必须 >= 0）。',
    returns: 'x 的平方根。',
    notes: ['sqrt(16) 是 4.0。', 'x 为负数在真正的 C 里会得到 NaN；本站会直接拦住并提示你。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.2f\\n", sqrt(2.0));\n    printf("%.0f\\n", sqrt(144));\n    return 0;\n}',
    related: ['cbrt', 'pow', 'fabs'] });

  add({ id: 'cbrt', name: 'cbrt', header: 'math.h', level: 2, supported: true, tags: ['数学'],
    proto: 'double cbrt(double x);',
    brief: '开立方（可以处理负数）。',
    params: 'x：任意实数。',
    returns: 'x 的立方根。',
    notes: ['cbrt(-27) 是 -3。', 'C99 才有，老编译器可能不支持。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.0f %.0f\\n", cbrt(27), cbrt(-27));\n    return 0;\n}',
    related: ['sqrt', 'pow'] });

  add({ id: 'pow', name: 'pow', header: 'math.h', level: 1, supported: true, tags: ['数学', '最常用'],
    proto: 'double pow(double base, double exp);',
    brief: '求 base 的 exp 次方。',
    params: 'base：底数；exp：指数。',
    returns: 'base^exp。',
    notes: ['pow(2, 10) 是 1024。', '整数乘方尽量自己写循环；pow 返回 double，可能有精度误差。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.0f\\n", pow(2, 10));\n    printf("%.2f\\n", pow(9, 0.5));   // 3.00\n    return 0;\n}',
    related: ['sqrt', 'exp'] });

  add({ id: 'exp', name: 'exp', header: 'math.h', level: 2, supported: true, tags: ['数学', '指数'],
    proto: 'double exp(double x);',
    brief: '求 e 的 x 次方。',
    params: 'x：指数。',
    returns: 'e^x。',
    notes: ['e ≈ 2.71828。', 'exp(0) = 1。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.4f\\n", exp(1.0));\n    return 0;\n}',
    related: ['log', 'pow'] });

  add({ id: 'log', name: 'log', header: 'math.h', level: 2, supported: true, tags: ['数学', '对数'],
    proto: 'double log(double x);',
    brief: '求自然对数（以 e 为底）。',
    params: 'x：必须大于 0。',
    returns: 'ln(x)。',
    notes: ['log(1) = 0，log(e) = 1。', 'x <= 0 会得到 -inf 或 nan。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.2f %.2f\\n", log(1.0), log(exp(2.0)));\n    return 0;\n}',
    related: ['log10', 'log2', 'exp'] });

  add({ id: 'log10', name: 'log10', header: 'math.h', level: 2, supported: true, tags: ['数学', '对数'],
    proto: 'double log10(double x);',
    brief: '求以 10 为底的对数。',
    params: 'x：必须大于 0。',
    returns: 'log10(x)。',
    notes: ['log10(1000) = 3。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.0f\\n", log10(1000));\n    return 0;\n}',
    related: ['log', 'log2'] });

  add({ id: 'log2', name: 'log2', header: 'math.h', level: 2, supported: true, tags: ['数学', '对数'],
    proto: 'double log2(double x);',
    brief: '求以 2 为底的对数。',
    params: 'x：必须大于 0。',
    returns: 'log2(x)。',
    notes: ['log2(8) = 3，常用在二进制 / 算法复杂度里。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.0f\\n", log2(8));\n    return 0;\n}',
    related: ['log', 'log10'] });

  add({ id: 'sin', name: 'sin', header: 'math.h', level: 2, supported: true, tags: ['数学', '三角函数'],
    proto: 'double sin(double x);',
    brief: '求正弦（x 是弧度）。',
    params: 'x：弧度值。',
    returns: 'sin(x)，范围 -1 ~ 1。',
    notes: ['角度要先转弧度：sin(30 * M_PI / 180) = 0.5。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    double deg = 30;\n    double rad = deg * M_PI / 180.0;\n    printf("%.2f\\n", sin(rad));\n    return 0;\n}',
    related: ['cos', 'tan', 'asin'] });

  add({ id: 'cos', name: 'cos', header: 'math.h', level: 2, supported: true, tags: ['数学', '三角函数'],
    proto: 'double cos(double x);',
    brief: '求余弦（x 是弧度）。',
    params: 'x：弧度值。',
    returns: 'cos(x)，范围 -1 ~ 1。',
    notes: ['cos(0) = 1。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.2f %.2f\\n", cos(0), cos(M_PI));\n    return 0;\n}',
    related: ['sin', 'tan', 'acos'] });

  add({ id: 'tan', name: 'tan', header: 'math.h', level: 2, supported: true, tags: ['数学', '三角函数'],
    proto: 'double tan(double x);',
    brief: '求正切（x 是弧度）。',
    params: 'x：弧度值。',
    returns: 'tan(x)。',
    notes: ['90°（M_PI/2）附近数值会非常大，注意除零与精度问题。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.2f\\n", tan(M_PI / 4));\n    return 0;\n}',
    related: ['sin', 'cos', 'atan'] });

  add({ id: 'asin', name: 'asin', header: 'math.h', level: 2, supported: true, tags: ['数学', '反三角函数'],
    proto: 'double asin(double x);',
    brief: '求反正弦，返回弧度。',
    params: 'x：必须在 -1 ~ 1 之间。',
    returns: '弧度值（-π/2 ~ π/2）。',
    notes: ['asin(1) 是 π/2。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.2f\\n", asin(1));\n    return 0;\n}',
    related: ['sin', 'acos', 'atan'] });

  add({ id: 'acos', name: 'acos', header: 'math.h', level: 2, supported: true, tags: ['数学', '反三角函数'],
    proto: 'double acos(double x);',
    brief: '求反余弦，返回弧度。',
    params: 'x：必须在 -1 ~ 1 之间。',
    returns: '弧度值（0 ~ π）。',
    notes: ['acos(0) 是 π/2。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.2f\\n", acos(0));\n    return 0;\n}',
    related: ['cos', 'asin'] });

  add({ id: 'atan', name: 'atan', header: 'math.h', level: 2, supported: true, tags: ['数学', '反三角函数'],
    proto: 'double atan(double x);',
    brief: '求反正切，返回弧度。',
    params: 'x：任意实数。',
    returns: '弧度值（-π/2 ~ π/2）。',
    notes: ['atan(1) 是 π/4。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.2f\\n", atan(1));\n    return 0;\n}',
    related: ['tan', 'atan2'] });

  add({ id: 'atan2', name: 'atan2', header: 'math.h', level: 3, supported: true, tags: ['数学', '反三角函数'],
    proto: 'double atan2(double y, double x);',
    brief: '根据 (x, y) 求角度，能区分四个象限。',
    params: 'y：纵坐标；x：横坐标。',
    returns: '弧度值（-π ~ π）。',
    notes: ['注意参数顺序是 y 在前、x 在后。', '常用在图形、游戏里算方向角。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.2f\\n", atan2(1, 1));\n    return 0;\n}',
    related: ['atan'] });

  add({ id: 'floor', name: 'floor', header: 'math.h', level: 1, supported: true, tags: ['数学', '取整'],
    proto: 'double floor(double x);',
    brief: '向下取整（往小的方向）。',
    params: 'x：小数。',
    returns: '不大于 x 的最大整数（仍是 double）。',
    notes: ['floor(3.9) = 3，floor(-3.1) = -4。', '想存入 int 要强制转换：int n = (int)floor(x);'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.0f %.0f\\n", floor(3.9), floor(-3.1));\n    return 0;\n}',
    related: ['ceil', 'round', 'trunc'] });

  add({ id: 'ceil', name: 'ceil', header: 'math.h', level: 1, supported: true, tags: ['数学', '取整'],
    proto: 'double ceil(double x);',
    brief: '向上取整（往大的方向）。',
    params: 'x：小数。',
    returns: '不小于 x 的最小整数。',
    notes: ['ceil(3.1) = 4，ceil(-3.9) = -3。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.0f %.0f\\n", ceil(3.1), ceil(-3.9));\n    return 0;\n}',
    related: ['floor', 'round'] });

  add({ id: 'round', name: 'round', header: 'math.h', level: 1, supported: true, tags: ['数学', '取整'],
    proto: 'double round(double x);',
    brief: '四舍五入到最近的整数。',
    params: 'x：小数。',
    returns: '四舍五入后的整数（double）。',
    notes: ['正好 .5 时会向远离 0 的方向舍入。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.0f %.0f\\n", round(2.4), round(2.6));\n    return 0;\n}',
    related: ['floor', 'ceil', 'trunc'] });

  add({ id: 'trunc', name: 'trunc', header: 'math.h', level: 2, supported: true, tags: ['数学', '取整'],
    proto: 'double trunc(double x);',
    brief: '直接砍掉小数部分（向 0 取整）。',
    params: 'x：小数。',
    returns: '去掉小数后的数。',
    notes: ['trunc(-3.9) = -3，这一点和 floor 不同。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.0f %.0f\\n", trunc(3.9), trunc(-3.9));\n    return 0;\n}',
    related: ['floor', 'ceil'] });

  add({ id: 'fabs', name: 'fabs', header: 'math.h', level: 1, supported: true, tags: ['数学', '绝对值', '最常用'],
    proto: 'double fabs(double x);',
    brief: '求小数的绝对值。',
    params: 'x：小数。',
    returns: '|x|。',
    notes: ['整数用 abs（stdlib.h），小数用 fabs。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.1f %.1f\\n", fabs(-2.5), fabs(2.5));\n    return 0;\n}',
    related: ['abs', 'fmod'] });

  add({ id: 'fmod', name: 'fmod', header: 'math.h', level: 2, supported: true, tags: ['数学', '取余'],
    proto: 'double fmod(double x, double y);',
    brief: '小数的取余（%）只能用整数，小数取余用它。',
    params: 'x：被除数；y：除数。',
    returns: 'x 除以 y 的余数（小数）。',
    notes: ['fmod(5.5, 2) = 1.5。', 'y 为 0 会得到 nan。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.1f\\n", fmod(5.5, 2.0));\n    return 0;\n}',
    related: ['fabs', 'floor'] });

  add({ id: 'fmin', name: 'fmin', header: 'math.h', level: 2, supported: true, tags: ['数学', '比较'],
    proto: 'double fmin(double x, double y);',
    brief: '返回两个小数里较小的那个。',
    params: 'x、y：两个数。',
    returns: '较小的数。',
    notes: ['和 a < b ? a : b 类似，但能正确处理 NaN。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.1f\\n", fmin(3.2, 1.8));\n    return 0;\n}',
    related: ['fmax'] });

  add({ id: 'fmax', name: 'fmax', header: 'math.h', level: 2, supported: true, tags: ['数学', '比较'],
    proto: 'double fmax(double x, double y);',
    brief: '返回两个小数里较大的那个。',
    params: 'x、y：两个数。',
    returns: '较大的数。',
    notes: ['整数比较直接写 if 或三目运算即可。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.1f\\n", fmax(3.2, 1.8));\n    return 0;\n}',
    related: ['fmin'] });

  add({ id: 'hypot', name: 'hypot', header: 'math.h', level: 2, supported: true, tags: ['数学', '几何'],
    proto: 'double hypot(double x, double y);',
    brief: '求直角三角形的斜边长度（√(x²+y²)）。',
    params: 'x、y：两条直角边。',
    returns: '斜边长度。',
    notes: ['比手写 sqrt(x*x + y*y) 更不容易溢出。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%.1f\\n", hypot(3, 4));\n    return 0;\n}',
    related: ['sqrt', 'pow'] });

  add({ id: 'isnan', name: 'isnan', header: 'math.h', level: 3, supported: true, tags: ['数学', '判断'],
    proto: 'int isnan(double x);',
    brief: '判断一个数是不是 NaN（不是数字）。',
    params: 'x：要判断的数。',
    returns: '是 NaN 返回非 0，否则 0。',
    notes: ['NaN 不能和任何数比较相等，要用 isnan 判断。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%d %d\\n", isnan(log(-1.0)), isnan(1.0));\n    return 0;\n}',
    related: ['isinf'] });

  add({ id: 'isinf', name: 'isinf', header: 'math.h', level: 3, supported: true, tags: ['数学', '判断'],
    proto: 'int isinf(double x);',
    brief: '判断一个数是不是无穷大。',
    params: 'x：要判断的数。',
    returns: '是正/负无穷返回非 0，否则 0。',
    notes: ['除以 0.0、exp 溢出都可能得到 inf；真正的 C 里整数除以 0 是未定义行为。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf("%d %d\\n", isinf(exp(1000.0)), isinf(1.0));\n    return 0;\n}',
    related: ['isnan'] });

  add({ id: 'M_PI', name: 'M_PI', header: 'math.h', kind: 'macro', level: 1, supported: true, tags: ['常量'],
    proto: '#define M_PI 3.14159265358979323846',
    brief: '圆周率 π 的常量（不是标准 C，但在大多数编译器里可用）。',
    params: '没有参数，直接当数字用。',
    returns: '约等于 3.141592653589793。',
    notes: ['严格的可移植写法是自己写 #define PI 3.14159。', '本站内置了 M_PI。'],
    example: '#include <stdio.h>\n#include <math.h>\n\nint main() {\n    double r = 2.0;\n    printf("面积：%.2f\\n", M_PI * r * r);\n    return 0;\n}',
    related: ['sin', 'cos'] });

  // ======================= time.h =======================
  add({ id: 'time', name: 'time', header: 'time.h', level: 1, supported: true, tags: ['时间', '随机数'],
    proto: 'time_t time(time_t *t);',
    brief: '返回当前时间（从 1970-01-01 起的秒数）。',
    params: 't：可以传 NULL；如果传指针，结果也会存进去。',
    returns: '当前时间戳（time_t）。',
    notes: ['最经典用法：srand(time(NULL)); 让随机数每次不同。', '本站返回模拟时间，判题时固定，方便复现。'],
    example: '#include <stdio.h>\n#include <time.h>\n\nint main() {\n    long now = (long)time(NULL);\n    printf("%ld\\n", now);\n    return 0;\n}',
    related: ['srand', 'clock'] });

  add({ id: 'clock', name: 'clock', header: 'time.h', level: 2, supported: false, tags: ['时间', '计时'],
    proto: 'clock_t clock(void);',
    brief: '返回程序运行了多久（以 CLOCKS_PER_SEC 为单位）。',
    params: '没有参数。',
    returns: 'CPU 时钟数；除以 CLOCKS_PER_SEC 得到秒。',
    notes: ['适合给代码计时：start = clock(); ... end = clock();'],
    example: '#include <stdio.h>\n#include <time.h>\n\nint main() {\n    clock_t start = clock();\n    for (int i = 0; i < 1000000; i++) { }\n    double sec = (double)(clock() - start) / CLOCKS_PER_SEC;\n    printf("%.3f 秒\\n", sec);\n    return 0;\n}',
    related: ['time', 'difftime'] });

  add({ id: 'difftime', name: 'difftime', header: 'time.h', level: 2, supported: false, tags: ['时间'],
    proto: 'double difftime(time_t end, time_t begin);',
    brief: '计算两个时间点相差多少秒。',
    params: 'end：结束时间；begin：开始时间。',
    returns: '相差的秒数（double）。',
    notes: ['会自动处理 time_t 的表示差异，比自己相减更安全。'],
    example: '#include <stdio.h>\n#include <time.h>\n\nint main() {\n    time_t a = time(NULL);\n    time_t b = time(NULL) + 5;\n    printf("%.0f\\n", difftime(b, a));\n    return 0;\n}',
    related: ['time', 'clock'] });

  add({ id: 'localtime', name: 'localtime', header: 'time.h', level: 3, supported: false, tags: ['时间', '结构体'],
    proto: 'struct tm *localtime(const time_t *timer);',
    brief: '把时间戳转换成本地时间（年、月、日、时、分、秒）。',
    params: 'timer：时间戳的地址。',
    returns: '指向 struct tm 的指针；失败返回 NULL。',
    notes: ['struct tm 的年份要 +1900，月份是 0-11。', '结构体属于进阶内容。'],
    example: '#include <stdio.h>\n#include <time.h>\n\nint main() {\n    time_t t = time(NULL);\n    struct tm *lt = localtime(&t);\n    printf("%d-%02d-%02d\\n", lt->tm_year + 1900, lt->tm_mon + 1, lt->tm_mday);\n    return 0;\n}',
    related: ['strftime'] });

  add({ id: 'strftime', name: 'strftime', header: 'time.h', level: 3, supported: false, tags: ['时间', '格式化'],
    proto: 'size_t strftime(char *s, size_t max, const char *format, const struct tm *tm);',
    brief: '把 struct tm 格式化成自定义的日期字符串。',
    params: 's：目标数组；max：最多写多少；format：格式，如 "%Y-%m-%d"；tm：时间结构体。',
    returns: '写入的字符数；0 表示失败或放不下。',
    notes: ['%Y 年、%m 月、%d 日、%H 时、%M 分、%S 秒。'],
    example: '#include <stdio.h>\n#include <time.h>\n\nint main() {\n    time_t t = time(NULL);\n    struct tm *lt = localtime(&t);\n    char buf[64];\n    strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M", lt);\n    printf("%s\\n", buf);\n    return 0;\n}',
    related: ['localtime'] });

  // ======================= limits.h =======================
  add({ id: 'INT_MAX', name: 'INT_MAX', header: 'limits.h', kind: 'macro', level: 1, supported: true, tags: ['常量', '范围'],
    proto: '#define INT_MAX 2147483647',
    brief: 'int 能表示的最大值。',
    params: '没有参数，直接当数字用。',
    returns: '2147483647（通常情况）。',
    notes: ['int 溢出是未定义行为，算大数前先想想会不会超。'],
    example: '#include <stdio.h>\n#include <limits.h>\n\nint main() {\n    printf("%d\\n", INT_MAX);\n    return 0;\n}',
    related: ['INT_MIN'] });

  add({ id: 'INT_MIN', name: 'INT_MIN', header: 'limits.h', kind: 'macro', level: 1, supported: true, tags: ['常量', '范围'],
    proto: '#define INT_MIN (-2147483647 - 1)',
    brief: 'int 能表示的最小值。',
    params: '没有参数。',
    returns: '-2147483648（通常情况）。',
    notes: ['注意：-INT_MIN 会溢出，因为正数那边装不下。'],
    example: '#include <stdio.h>\n#include <limits.h>\n\nint main() {\n    printf("%d\\n", INT_MIN);\n    return 0;\n}',
    related: ['INT_MAX'] });

  add({ id: 'CHAR_MAX', name: 'CHAR_MAX', header: 'limits.h', kind: 'macro', level: 2, supported: true, tags: ['常量', '范围'],
    proto: '#define CHAR_MAX 127',
    brief: 'char 能表示的最大值。',
    params: '没有参数。',
    returns: '127（有符号 char）或 255（无符号 char，平台相关）。',
    notes: ['本站按有符号 char 处理。'],
    example: '#include <stdio.h>\n#include <limits.h>\n\nint main() {\n    printf("%d %d\\n", CHAR_MAX, UCHAR_MAX);\n    return 0;\n}',
    related: ['CHAR_MIN', 'UCHAR_MAX'] });

  add({ id: 'CHAR_MIN', name: 'CHAR_MIN', header: 'limits.h', kind: 'macro', level: 2, supported: true, tags: ['常量', '范围'],
    proto: '#define CHAR_MIN (-128)',
    brief: 'char 能表示的最小值。',
    params: '没有参数。',
    returns: '-128（有符号 char）。',
    notes: ['char，本质是 1 字节的整数。'],
    example: '#include <stdio.h>\n#include <limits.h>\n\nint main() {\n    printf("%d\\n", CHAR_MIN);\n    return 0;\n}',
    related: ['CHAR_MAX'] });

  add({ id: 'UCHAR_MAX', name: 'UCHAR_MAX', header: 'limits.h', kind: 'macro', level: 2, supported: true, tags: ['常量', '范围'],
    proto: '#define UCHAR_MAX 255',
    brief: 'unsigned char 能表示的最大值。',
    params: '没有参数。',
    returns: '255。',
    notes: ['unsigned char 的范围是 0 ~ 255。'],
    example: '#include <stdio.h>\n#include <limits.h>\n\nint main() {\n    printf("%d\\n", UCHAR_MAX);\n    return 0;\n}',
    related: ['CHAR_MAX'] });

  add({ id: 'SHRT_MAX', name: 'SHRT_MAX', header: 'limits.h', kind: 'macro', level: 2, supported: true, tags: ['常量', '范围'],
    proto: '#define SHRT_MAX 32767',
    brief: 'short 能表示的最大值。',
    params: '没有参数。',
    returns: '32767。',
    notes: ['short 一般是 2 字节。'],
    example: '#include <stdio.h>\n#include <limits.h>\n\nint main() {\n    printf("%d\\n", SHRT_MAX);\n    return 0;\n}',
    related: ['INT_MAX'] });

  add({ id: 'LONG_MAX', name: 'LONG_MAX', header: 'limits.h', kind: 'macro', level: 2, supported: true, tags: ['常量', '范围'],
    proto: '#define LONG_MAX 9223372036854775807L',
    brief: 'long 能表示的最大值（平台相关）。',
    params: '没有参数。',
    returns: '64 位平台上通常是 9223372036854775807。',
    notes: ['Windows 上 long 是 4 字节，Linux 64 位是 8 字节。'],
    example: '#include <stdio.h>\n#include <limits.h>\n\nint main() {\n    printf("%ld\\n", (long)LONG_MAX);\n    return 0;\n}',
    related: ['INT_MAX'] });

  CC.FUNCS = FUNCS;
})(typeof globalThis !== 'undefined' ? globalThis : this);