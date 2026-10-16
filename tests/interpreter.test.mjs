import { loadCC, describe, test, ok, eq, contains, summary } from './harness.mjs';

const CC = loadCC();

function run(src, stdin, extra) {
  return CC.run(src, Object.assign({ stdin: stdin || '' }, extra || {}));
}
function out(src, stdin, extra) {
  const r = run(src, stdin, extra);
  if (!r.ok) {
    throw new Error('期望运行成功，但报错了：' + (r.error && r.error.message) + '\n提示：' + (r.error && r.error.hint) + '\n输出：' + JSON.stringify(r.output));
  }
  return r.output;
}
function err(src, stdin, extra) {
  const r = run(src, stdin, extra);
  if (r.ok) throw new Error('期望报错，但成功运行了，输出：' + JSON.stringify(r.output));
  return r.error;
}

describe('1. 基础：程序结构 / printf', () => {
  test('你好世界', () => {
    eq(out('#include <stdio.h>\nint main() {\n    printf("你好，世界\\n");\n    return 0;\n}'), '你好，世界\n');
  });

  test('没有 #include 也能跑，但会给提示', () => {
    const r = run('int main() { printf("hi\\n"); return 0; }');
    eq(r.output, 'hi\n');
    ok(r.warnings.length > 0, '应该有关于 #include <stdio.h> 的提示');
    contains(JSON.stringify(r.warnings), 'stdio');
  });

  test('各种格式符', () => {
    const src = [
      'int main() {',
      '  int a = 7;',
      '  double b = 3.5;',
      '  printf("%d %.2f %5d|%-5d|%05d %x %c %s %%\\n", a, b, a, a, a, 255, 65, "hi");',
      '  return 0;',
      '}'
    ].join('\n');
    eq(out(src), '7 3.50     7|7    |00007 ff A hi %\n');
  });

  test('printf 参数不够会报错', () => {
    const e = err('int main(){ printf("%d %d", 1); return 0; }');
    contains(e.message + e.hint, '没有给出对应的值');
  });

  test('printf 格式符和类型不匹配会提示', () => {
    const e = err('int main(){ printf("%d", "abc"); return 0; }');
    contains(e.message + e.hint, '%d');
  });

  test('puts / putchar', () => {
    eq(out('int main(){ puts("hello"); putchar(10); putchar(65); return 0; }'), 'hello\n\nA');
  });

  test('注释不影响结果', () => {
    eq(out('// 一行注释\nint main(){ /* 块注释 */ printf("ok\\n"); return 0; }'), 'ok\n');
  });
});

describe('2. 变量、类型与运算', () => {
  test('整数除法与取余', () => {
    eq(out('int main(){ printf("%d %d %.1f\\n", 7/2, 7%2, 7.0/2); return 0; }'), '3 1 3.5\n');
  });

  test('类型转换与强制转换', () => {
    eq(out('int main(){ double x = 3.9; int y = (int)x; printf("%d %.1f\\n", y, (double)7/2); return 0; }'), '3 3.5\n');
  });

  test('sizeof', () => {
    eq(out('int main(){ int a[5]; printf("%d %d %d\\n", sizeof(a), sizeof(int), sizeof(char)); return 0; }'), '20 4 1\n');
  });

  test('char 与字符常量', () => {
    eq(out("int main(){ char c = 'a'; printf(\"%c %d\\n\", c, c); return 0; }"), 'a 97\n');
  });

  test('把小数赋给 int 会给出友好提示', () => {
    const r = run('int main(){ int a = 3.7; printf("%d\\n", a); return 0; }');
    eq(r.output, '3\n');
    contains(JSON.stringify(r.warnings), '小数');
  });

  test('#define 宏与数组长度', () => {
    eq(out('#define N 3\nint main(){ int a[N]; for (int i = 0; i < N; i++) a[i] = i; printf("%d %d\\n", a[2], sizeof(a)); return 0; }'), '2 12\n');
  });

  test('自增自减、复合赋值', () => {
    eq(out('int main(){ int i = 5; int j = i++; int k = ++i; i += 10; i -= 2; printf("%d %d %d\\n", j, k, i); return 0; }'), '5 7 15\n');
  });

  test('逻辑与位运算', () => {
    eq(out('int main(){ int a = 6; int b = 3; printf("%d %d %d %d %d\\n", a > b, a == 6 && b < 5, !0, a & b, a | b); return 0; }'), '1 1 1 2 7\n');
  });

  test('三元运算符', () => {
    eq(out('int main(){ int a = 3, b = 9; printf("%d\\n", a > b ? a : b); return 0; }'), '9\n');
  });

  test('比较运算符与布尔值打印', () => {
    eq(out('int main(){ int x = 5; printf("%d %d %d\\n", x > 3, x < 3, x != 5); return 0; }'), '1 0 0\n');
  });
});

describe('3. 分支与循环', () => {
  test('if / else if / else', () => {
    const src = 'int main(){ int s = 75; if (s >= 90) printf("优\\n"); else if (s >= 60) printf("及格\\n"); else printf("不及格\\n"); return 0; }';
    eq(out(src), '及格\n');
  });

  test('switch 与穿透 (fallthrough)', () => {
    const src = [
      'int main(){',
      '  int n = 3;',
      '  switch (n) {',
      '    case 1: printf("一\\n"); break;',
      '    case 3: printf("三\\n");',
      '    case 4: printf("四\\n"); break;',
      '    default: printf("其它\\n");',
      '  }',
      '  return 0;',
      '}'
    ].join('\n');
    eq(out(src), '三\n四\n');
  });

  test('for / while / do-while / break / continue', () => {
    const src = [
      'int main(){',
      '  int s = 0;',
      '  for (int i = 1; i <= 5; i++) { if (i == 3) continue; s += i; }',
      '  int j = 0;',
      '  while (j < 3) j++;',
      '  do { j--; } while (j > 0);',
      '  int k = 0;',
      '  for (int x = 0; x < 10; x++) { if (x == 4) break; k++; }',
      '  printf("%d %d %d\\n", s, j, k);',
      '  return 0;',
      '}'
    ].join('\n');
    eq(out(src), '12 0 4\n');
  });

  test('嵌套循环与九九乘法表片段', () => {
    const src = [
      'int main(){',
      '  for (int i = 1; i <= 3; i++) {',
      '    for (int j = 1; j <= 3; j++) printf("%d*%d=%d ", i, j, i*j);',
      '    printf("\\n");',
      '  }',
      '  return 0;',
      '}'
    ].join('\n');
    eq(out(src), '1*1=1 1*2=2 1*3=3 \n2*1=2 2*2=4 2*3=6 \n3*1=3 3*2=6 3*3=9 \n');
  });
});

describe('4. 数组与字符串', () => {
  test('数组赋值与求和', () => {
    eq(out('int main(){ int a[5]; for (int i=0;i<5;i++) a[i]=i*i; int s=0; for (int i=0;i<5;i++) s+=a[i]; printf("%d %d\\n", a[4], s); return 0; }'), '16 30\n');
  });

  test('初始化列表与省略长度', () => {
    eq(out('int main(){ int a[] = {5, 6, 7}; printf("%d %d\\n", a[0], sizeof(a)/sizeof(int)); return 0; }'), '5 3\n');
  });

  test('二维数组', () => {
    eq(out('int main(){ int m[2][3] = {{1,2,3},{4,5,6}}; printf("%d %d\\n", m[1][2], m[0][1]); return 0; }'), '6 2\n');
  });

  test('字符数组与字符串函数', () => {
    const src = [
      '#include <string.h>',
      'int main(){',
      '  char s[20] = "hello";',
      '  char t[] = "world";',
      '  printf("%s %d\\n", s, (int)strlen(s));',
      '  strcat(s, " ");',
      '  strcat(s, t);',
      '  printf("%s %d\\n", s, (int)strlen(s));',
      '  printf("%d\\n", strcmp("abc", "abd"));',
      '  char copy[20];',
      '  strcpy(copy, s);',
      '  printf("%s\\n", copy);',
      '  return 0;',
      '}'
    ].join('\n');
    eq(out(src), 'hello 5\nhello world 11\n-1\nhello world\n');
  });

  test('字符串太长放不下会报错', () => {
    const e = err('int main(){ char s[3] = "hello"; printf("%s", s); return 0; }');
    contains(e.message, '太长');
  });
});

describe('5. 函数', () => {
  test('函数定义、参数、返回值', () => {
    const src = [
      'int add(int a, int b) { return a + b; }',
      'double average(double a, double b) { return (a + b) / 2; }',
      'int main(){ printf("%d %.1f\\n", add(3, 4), average(3, 4)); return 0; }'
    ].join('\n');
    eq(out(src), '7 3.5\n');
  });

  test('递归（阶乘）', () => {
    const src = [
      'int fact(int n) { if (n <= 1) return 1; return n * fact(n - 1); }',
      'int main(){ printf("%d %d\\n", fact(5), fact(0)); return 0; }'
    ].join('\n');
    eq(out(src), '120 1\n');
  });

  test('参数个数不对会报错', () => {
    const e = err('int f(int a){ return a; }\nint main(){ printf("%d", f(1, 2)); return 0; }');
    contains(e.message, '需要 1 个参数');
  });

  test('函数返回 void', () => {
    eq(out('void hi(){ printf("hi\\n"); }\nint main(){ hi(); return 0; }'), 'hi\n');
  });
});

describe('6. 指针', () => {
  test('交换两个变量', () => {
    const src = [
      'void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }',
      'int main(){ int x = 1, y = 2; swap(&x, &y); printf("%d %d\\n", x, y); return 0; }'
    ].join('\n');
    eq(out(src), '2 1\n');
  });

  test('用指针遍历数组', () => {
    const src = [
      'int main(){',
      '  int a[4] = {10, 20, 30, 40};',
      '  int *p = a;',
      '  int sum = 0;',
      '  for (int i = 0; i < 4; i++) sum += *(p + i);',
      '  p++;',
      '  printf("%d %d\\n", sum, *p);',
      '  return 0;',
      '}'
    ].join('\n');
    eq(out(src), '100 20\n');
  });

  test('NULL 指针解引用会报错', () => {
    const e = err('int main(){ int *p = NULL; *p = 1; return 0; }');
    contains(e.message, '空的');
  });

  test('数组下标越界会报错', () => {
    const e = err('int main(){ int a[3]; a[5] = 1; return 0; }');
    contains(e.message, '越界');
  });
});

describe('7. 键盘输入 scanf', () => {
  test('读两个整数', () => {
    eq(out('int main(){ int a, b; scanf("%d %d", &a, &b); printf("%d\\n", a + b); return 0; }', '3 4\n'), '7\n');
  });

  test('读小数和字符', () => {
    eq(out('int main(){ double x; char c; scanf("%lf %c", &x, &c); printf("%.1f %c\\n", x, c); return 0; }', '2.5 A'), '2.5 A\n');
  });

  test('读字符串', () => {
    eq(out('int main(){ char name[20]; scanf("%s", name); printf("你好，%s！\\n", name); return 0; }', '小明\n'), '你好，小明！\n');
  });

  test('忘记写 & 会给出明确提示', () => {
    const e = err('int main(){ int a; scanf("%d", a); return 0; }', '5');
    contains(e.message + e.hint, '地址');
  });

  test('输入用完会给出提示', () => {
    const e = err('int main(){ int a, b; scanf("%d %d", &a, &b); return 0; }', '5');
    contains(e.message, '输入区');
  });

  test('输入内容和格式不匹配会报错', () => {
    const e = err('int main(){ int a; scanf("%d", &a); return 0; }', 'abc');
    contains(e.message, '整数');
  });
});

describe('8. 随机数与数学函数', () => {
  test('rand 结果可复现（同一 seed 结果相同）', () => {
    const src = 'int main(){ srand(1); int a = rand() % 100; srand(1); int b = rand() % 100; printf("%d %d\\n", a, b); return 0; }';
    const r = out(src);
    const parts = r.trim().split(' ');
    ok(parts[0] === parts[1], '同一 seed 应该得到相同结果，实际 ' + r);
  });

  test('rand 落在 0~32767 之间', () => {
    const src = 'int main(){ srand(5); for (int i = 0; i < 20; i++) { int v = rand(); if (v < 0 || v > 32767) { printf("bad\\n"); return 0; } } printf("ok\\n"); return 0; }';
    eq(out(src), 'ok\n');
  });

  test('sqrt / pow / abs / fabs', () => {
    eq(out('int main(){ printf("%.0f %.0f %d %.1f\\n", sqrt(16), pow(2, 10), abs(-5), fabs(-2.5)); return 0; }'), '4 1024 5 2.5\n');
  });
});

describe('9. 错误提示（面向初学者）', () => {
  test('缺少分号', () => {
    const e = err('int main(){ int a = 1 return 0; }');
    contains(e.message, '分号');
  });

  test('漏了分号并跟着关键字时给出更具体的提示', () => {
    const e = err('int main(){\n  int a = 1\n  return 0;\n}');
    contains(e.hint, '分号');
  });

  test('中文标点', () => {
    const e = err('int main(){ printf("hi")； return 0; }');
    contains(e.message, '中文标点');
  });

  test('未声明的变量', () => {
    const e = err('int main(){ count = 5; return 0; }');
    contains(e.message, '没有定义');
    contains(e.hint, '先声明');
  });

  test('括号没有配对', () => {
    const e = err('int main(){ if (1 > 0 { printf("a"); } return 0; }');
    contains(e.message + e.hint, ')');
  });

  test('除数为 0', () => {
    const e = err('int main(){ int a = 10, b = 0; printf("%d", a / b); return 0; }');
    contains(e.message, '除数');
  });

  test('取余用在非整数上', () => {
    const e = err('int main(){ printf("%d", 7.5 % 2); return 0; }');
    contains(e.message, '整数');
  });

  test('没有 main 函数', () => {
    const e = err('int f(){ return 1; }');
    contains(e.message, 'main');
  });

  test('不支持的结构体给出友好说明', () => {
    const e = err('struct Point { int x; int y; };\nint main(){ return 0; }');
    contains(e.message, '结构体');
  });

  test('死循环会被拦住', () => {
    const e = err('int main(){ while (1) { } return 0; }', '', { maxSteps: 300000 });
    contains(e.message, '循环');
  });

  test('if 里误用 = 会给出提示', () => {
    const r = run('int main(){ int x = 0; if (x = 5) printf("hi\\n"); return 0; }');
    eq(r.output, 'hi\n');
    contains(JSON.stringify(r.warnings), '赋值');
  });

  test('用 == 比较字符串会给出提示', () => {
    const r = run('int main(){ char s[5] = "ab"; if (s == "ab") printf("same\\n"); return 0; }');
    eq(r.output, 'same\n');
    contains(JSON.stringify(r.warnings), 'strcmp');
  });

  test('函数名拼错会给出猜测', () => {
    const e = err('int main(){ print("hi"); return 0; }');
    contains(e.hint, 'printf');
  });

  test('调用没有定义的函数', () => {
    const e = err('int main(){ int r = addd(1, 2); return 0; }');
    contains(e.message, '没有定义');
  });
});

summary();