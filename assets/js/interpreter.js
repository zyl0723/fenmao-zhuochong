/*!
 * 粉猫捉虫 · 迷你 C 解释器（MiniC）v1.0.0
 * ------------------------------------------------------------------
 * 纯 JavaScript 实现、零依赖的 C 语言子集解释器，专为零基础学习者设计：
 *   · 报错全部是中文，并且会指出「第几行、错在哪、怎么改」
 *   · 支持教学所需的 C 子集：变量/类型/运算/if/switch/循环/数组/字符串/函数/指针
 *   · 内置 printf / scanf / 常用数学与字符串函数，rand 使用可复现的伪随机数
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';

  var CC = root.CC || (root.CC = {});
  var VERSION = '1.0.0';

  // ============================================================
  // 1. 错误对象与中文提示
  // ============================================================

  function CError(message, line, hint) {
    var e = new Error(message);
    e.name = 'CError';
    e.isCError = true;
    e.line = line || 0;
    e.hint = hint || '';
    return e;
  }

  // 中文（全角）标点在 C 语言里是非法字符——初学者最常踩的坑，单独给出提示
  var FULLWIDTH = {
    '\uff08': '(', '\uff09': ')', '\uff3b': '[', '\uff3d': ']', '\uff5b': '{', '\uff5d': '}',
    '\uff0c': ',', '\u3002': '.', '\uff1b': ';', '\uff1a': ':', '\uff1f': '?', '\uff01': '!',
    '\u201c': '"', '\u201d': '"', '\u2018': "'", '\u2019': "'", '\u3001': ',',
    '\uff1d': '=', '\uff0b': '+', '\uff0d': '-', '\uff0a': '*', '\uff0f': '/', '\uff05': '%',
    '\uff1c': '<', '\uff1e': '>', '\uff06': '&', '\uff5c': '|', '\uff03': '#', '\uff5e': '~',
    '\u2014': '-', '\u2013': '-', '\u00d7': '*', '\u00f7': '/'
  };

  function makeLineReader(src) {
    var lines = String(src).replace(/\r\n?/g, '\n').split('\n');
    return function (n) {
      if (!n || n < 1 || n > lines.length) return '';
      return lines[n - 1];
    };
  }

  function quoteLine(text) {
    var t = String(text || '').replace(/\t/g, '    ').trim();
    if (!t) return '';
    if (t.length > 60) t = t.slice(0, 60) + '…';
    return t;
  }

  // ============================================================
  // 2. 预处理：#include / #define（其余预处理指令忽略）
  // ============================================================

  function preprocess(src) {
    var text = String(src == null ? '' : src).replace(/\r\n?/g, '\n');
    var lines = text.split('\n');
    var defines = new Map();
    defines.set('NULL', '0');
    defines.set('M_PI', '3.141592653589793');
    defines.set('true', '1');
    defines.set('false', '0');
    // <limits.h> 里最常用的几个常量（本站没有真的头文件，用宏模拟）
    defines.set('INT_MAX', '2147483647');
    defines.set('INT_MIN', '(-2147483647 - 1)');
    defines.set('LONG_MAX', '9223372036854775807');
    defines.set('LONG_MIN', '(-9223372036854775807 - 1)');
    defines.set('SHRT_MAX', '32767');
    defines.set('SHRT_MIN', '(-32767 - 1)');
    defines.set('CHAR_MAX', '127');
    defines.set('CHAR_MIN', '(-127 - 1)');
    defines.set('UCHAR_MAX', '255');
    defines.set('USHRT_MAX', '65535');
    defines.set('UINT_MAX', '4294967295');
    var includes = [];
    var kept = [];
    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      if (/^\s*#/.test(raw)) {
        var m = /^\s*#\s*([A-Za-z_]+)\s*(.*)$/.exec(raw);
        var cmd = m ? m[1] : '';
        var rest = m ? m[2] : '';
        if (cmd === 'include') {
          includes.push(rest.trim());
        } else if (cmd === 'define') {
          var dm = /^([A-Za-z_]\w*)\s*([\s\S]*)$/.exec(rest.trim());
          if (dm) {
            var name = dm[1];
            var body = dm[2];
            if (/^\(/.test(body)) {
              // 带参数的宏（函数式宏）暂不支持，留一条注释占位，保证行号不变
              kept.push('/* 暂不支持带参数的宏定义 */');
              continue;
            }
            defines.set(name, body.trim() === '' ? '1' : body.trim());
          }
        }
        kept.push(''); // 用空行占位，保证报错行号和用户看到的行号一致
        continue;
      }
      kept.push(raw);
    }
    return { code: kept.join('\n'), defines: defines, includes: includes };
  }

  // ============================================================
  // 3. 词法分析
  // ============================================================

  var KEYWORDS = ['int', 'long', 'short', 'char', 'float', 'double', 'void', 'unsigned', 'signed',
    'const', 'static', 'if', 'else', 'while', 'for', 'do', 'return', 'break', 'continue',
    'switch', 'case', 'default', 'sizeof'];

  var TYPE_KEYWORDS = ['int', 'long', 'short', 'char', 'float', 'double', 'void', 'unsigned', 'signed'];

  // 本解释器不支持的 C 关键字：遇到时给出友好说明，而不是莫名其妙的语法错误
  var UNSUPPORTED_KEYWORDS = {
    struct: '结构体（struct）', union: '共用体（union）', enum: '枚举（enum）',
    typedef: '类型别名（typedef）', goto: 'goto 跳转', 'extern': 'extern 声明',
    register: 'register 修饰符', volatile: 'volatile 修饰符', inline: 'inline 函数',
    'auto': 'auto 修饰符'
  };

  var OPERATORS = ['<<=', '>>=', '...', '++', '--', '+=', '-=', '*=', '/=', '%=', '==', '!=', '<=', '>=',
    '&&', '||', '<<', '>>', '->', '&', '|', '^', '!', '~', '+', '-', '*', '/', '%', '=',
    '<', '>', '(', ')', '{', '}', '[', ']', ',', ';', '?', ':', '.', '#'];

  function lex(code, defines, startLine, depth) {
    var toks = [];
    var i = 0;
    var line = startLine || 1;
    var n = code.length;

    function push(t, v) { toks.push({ t: t, v: v, line: line }); }

    function readEscape(k) {
      // k 指向 '\' 后面的字符
      var c = code[k];
      var simple = { n: '\n', t: '\t', r: '\r', '0': '\u0000', '\\': '\\', '"': '"', "'": "'", a: '\u0007', b: '\b', f: '\f', v: '\v' };
      if (Object.prototype.hasOwnProperty.call(simple, c)) return { ch: simple[c], next: k + 1 };
      if (c === 'x') {
        var hex = code.substr(k + 1, 2).replace(/[^0-9a-fA-F]/g, '');
        if (!hex) return { ch: 'x', next: k + 1 };
        return { ch: String.fromCharCode(parseInt(hex, 16)), next: k + 1 + hex.length };
      }
      return { ch: c, next: k + 1 };
    }

    while (i < n) {
      var c = code[i];

      if (c === '\n') { line++; i++; continue; }
      if (c === ' ' || c === '\t' || c === '\r' || c === '\f' || c === '\u3000') { i++; continue; }

      // 注释
      if (c === '/' && code[i + 1] === '/') {
        while (i < n && code[i] !== '\n') i++;
        continue;
      }
      if (c === '/' && code[i + 1] === '*') {
        var cLine = line;
        i += 2;
        var closed = false;
        while (i < n) {
          if (code[i] === '*' && code[i + 1] === '/') { closed = true; i += 2; break; }
          if (code[i] === '\n') line++;
          i++;
        }
        if (!closed) {
          throw CError('第 ' + cLine + ' 行的 /* 注释没有写完', cLine,
            '多行注释要成对出现：/* 注释开始 … 注释结束 */。如果只是想写一句话，用 // 更方便。');
        }
        continue;
      }

      // 数字
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(code[i + 1] || ''))) {
        var s = i;
        if (c === '0' && (code[i + 1] === 'x' || code[i + 1] === 'X')) {
          i += 2;
          while (i < n && /[0-9a-fA-F]/.test(code[i])) i++;
          var hexText = code.slice(s, i);
          var hv = parseInt(hexText, 16);
          if (isNaN(hv)) throw CError('第 ' + line + ' 行：十六进制数字写错了「' + hexText + '」', line);
          while (i < n && /[uUlL]/.test(code[i])) i++;
          push('num', { value: hv, isFloat: false });
          continue;
        }
        var isFloat = false;
        while (i < n && /[0-9]/.test(code[i])) i++;
        if (code[i] === '.' && /[0-9]/.test(code[i + 1] || '')) {
          isFloat = true; i++;
          while (i < n && /[0-9]/.test(code[i])) i++;
        } else if (code[i] === '.' && !/[A-Za-z_]/.test(code[i + 1] || '')) {
          isFloat = true; i++;
        }
        if (code[i] === 'e' || code[i] === 'E') {
          var save = i;
          var j = i + 1;
          if (code[j] === '+' || code[j] === '-') j++;
          if (/[0-9]/.test(code[j] || '')) {
            isFloat = true;
            i = j;
            while (i < n && /[0-9]/.test(code[i])) i++;
          } else { i = save; }
        }
        var numText = code.slice(s, i);
        while (i < n && /[fFlLuU]/.test(code[i])) {
          if (/[fF]/.test(code[i])) isFloat = true;
          i++;
        }
        if (/[A-Za-z_]/.test(code[i] || '')) {
          var badStart = i;
          while (i < n && /[A-Za-z0-9_]/.test(code[i])) i++;
          throw CError('第 ' + line + ' 行：数字后面跟着一串字母「' + code.slice(s, i) + '」，我看不懂', line,
            '数字就是数字，字母就是字母，中间要有空格或运算符分开。比如 int a = 3; 或 printf("%d", 3);。');
        }
        push('num', { value: isFloat ? parseFloat(numText) : parseInt(numText, 10), isFloat: isFloat });
        continue;
      }

      // 标识符 / 关键字 / 宏
      if (/[A-Za-z_$]/.test(c)) {
        var s2 = i;
        while (i < n && /[A-Za-z0-9_$]/.test(code[i])) i++;
        var word = code.slice(s2, i);
        if (defines && defines.has(word) && (depth || 0) < 12) {
          var sub = lex(defines.get(word), defines, line, (depth || 0) + 1);
          for (var q = 0; q < sub.length; q++) {
            if (sub[q].t === 'eof') continue;
            sub[q].line = line;
            toks.push(sub[q]);
          }
          continue;
        }
        if (Object.prototype.hasOwnProperty.call(UNSUPPORTED_KEYWORDS, word)) {
          throw CError('第 ' + line + ' 行：这个版本的迷你 C 解释器还不支持「' + UNSUPPORTED_KEYWORDS[word] + '」',
            line, '先用课程里学过的变量、if、循环、数组、函数、指针把基础打牢；结构体等进阶内容建议用真正的编译器（如 Dev-C++、VS Code + gcc）来练习。');
        }
        if (KEYWORDS.indexOf(word) >= 0) { push('kw', word); continue; }
        push('id', word);
        continue;
      }

      // 字符串
      if (c === '"') {
        var sLine = line;
        var out = '';
        i++;
        var done = false;
        while (i < n) {
          if (code[i] === '"') { i++; done = true; break; }
          if (code[i] === '\n') break;
          if (code[i] === '\\') {
            var esc = readEscape(i + 1);
            out += esc.ch;
            i = esc.next;
            continue;
          }
          out += code[i];
          i++;
        }
        if (!done) {
          throw CError('第 ' + sLine + ' 行：字符串少了结尾的双引号 "', sLine,
            '一个字符串要用一对英文双引号包起来，例如 printf("你好\\n");。字符串不能直接换行，想换行请写 \\n。');
        }
        push('str', out);
        continue;
      }

      // 字符常量
      if (c === "'") {
        var chLine = line;
        i++;
        var chVal = '';
        if (code[i] === '\\') {
          var esc2 = readEscape(i + 1);
          chVal = esc2.ch;
          i = esc2.next;
        } else if (i < n && code[i] !== "'") {
          chVal = code[i];
          i++;
        }
        if (code[i] !== "'") {
          throw CError('第 ' + chLine + ' 行：字符常量的写法不对', chLine,
            "字符常量用一对英文单引号包住「一个」字符，例如 'A'、'a'、'0'、'\\n'。如果是一串字符，要用双引号，例如 \"abc\"。");
        }
        i++;
        push('char', { value: chVal.charCodeAt(0), text: chVal });
        continue;
      }

      // 中文标点（全角符号）
      if (Object.prototype.hasOwnProperty.call(FULLWIDTH, c)) {
        throw CError('第 ' + line + ' 行：出现了中文标点「' + c + '」', line,
          'C 语言只认英文半角符号，请把「' + c + '」改成「' + FULLWIDTH[c] + '」。中文输入法很容易犯这个错，检查一下输入法状态吧。');
      }

      // 运算符
      var matched = null;
      for (var oi = 0; oi < OPERATORS.length; oi++) {
        var op = OPERATORS[oi];
        if (code.substr(i, op.length) === op) { matched = op; break; }
      }
      if (matched) { i += matched.length; push('op', matched); continue; }

      if (c === ';' || c === '\u3002') { i++; push('op', ';'); continue; }

      throw CError('第 ' + line + ' 行：出现了我不认识的字符「' + c + '」', line,
        'C 语言里能用的符号是有限的，检查一下是不是打错了，或者混入了中文/特殊符号。');
    }

    push('eof', null);
    return toks;
  }

  // ============================================================
  // 4. 类型系统
  // ============================================================

  var SCALAR_SIZE = { char: 1, short: 2, int: 4, long: 8, float: 4, double: 8 };

  function tyScalar(name) { return { k: name, size: SCALAR_SIZE[name] }; }
  function tyPtr(to) { return { k: 'ptr', to: to, size: 8 }; }
  function tyArray(of, len) { return { k: 'array', of: of, len: len, size: of.size * len }; }

  var TY_VOID = { k: 'void', size: 0 };
  var TY_INT = tyScalar('int');
  var TY_DOUBLE = tyScalar('double');
  var TY_CHAR = tyScalar('char');

  function isIntKind(t) { return t && (t.k === 'char' || t.k === 'short' || t.k === 'int' || t.k === 'long'); }
  function isFloatKind(t) { return t && (t.k === 'float' || t.k === 'double'); }
  function isNumKind(t) { return isIntKind(t) || isFloatKind(t); }
  function isPtrKind(t) { return t && t.k === 'ptr'; }
  function isArrayKind(t) { return t && t.k === 'array'; }

  function typeName(t) {
    if (!t) return '未知类型';
    if (t.k === 'ptr') return typeName(t.to) + ' 的指针';
    if (t.k === 'array') return typeName(t.of) + ' 数组';
    if (t.k === 'void') return 'void';
    var map = { char: 'char（字符）', short: 'short（短整数）', int: 'int（整数）', long: 'long（长整数）', float: 'float（单精度小数）', double: 'double（小数）' };
    return map[t.k] || t.k;
  }
  // ============================================================
  // 5. 语法分析（递归下降）
  // ============================================================

  function describeToken(tk) {
    if (!tk || tk.t === 'eof') return '代码的结尾';
    if (tk.t === 'op') return '「' + tk.v + '」';
    if (tk.t === 'kw') return '关键字 ' + tk.v;
    if (tk.t === 'id') return '名字 ' + tk.v;
    if (tk.t === 'num') return '数字 ' + tk.v.value;
    if (tk.t === 'str') return '字符串 "' + tk.v + '"';
    if (tk.t === 'char') return "字符 '" + tk.v.text + "'";
    return String(tk.v);
  }

  function Parser(toks, lineText) {
    this.t = toks;
    this.i = 0;
    this.lineText = lineText || function () { return ''; };
  }

  Parser.prototype.peek = function (k) { return this.t[Math.min(this.i + (k || 0), this.t.length - 1)]; };
  Parser.prototype.next = function () { return this.t[this.i++]; };
  Parser.prototype.at = function (v) {
    var tk = this.t[this.i];
    return !!tk && tk.t === 'op' && tk.v === v;
  };
  Parser.prototype.atKw = function (v) {
    var tk = this.t[this.i];
    return !!tk && tk.t === 'kw' && tk.v === v;
  };
  Parser.prototype.eat = function (v) { if (this.at(v)) { this.i++; return true; } return false; };

  Parser.prototype.atTypeStart = function () {
    var tk = this.peek();
    if (!tk || tk.t !== 'kw') return false;
    return TYPE_KEYWORDS.indexOf(tk.v) >= 0 || tk.v === 'const' || tk.v === 'static';
  };

  Parser.prototype.errAt = function (tok, what, hint) {
    var line = tok ? tok.line : 0;
    var codeLine = quoteLine(this.lineText(line));
    var full = (codeLine ? '你的代码：' + codeLine + '\n' : '') + (hint || '');
    return CError('第 ' + line + ' 行：' + what, line, full.trim());
  };

  Parser.prototype.expectOp = function (v, hint) {
    var tk = this.peek();
    if (tk.t === 'op' && tk.v === v) { this.i++; return; }
    if (tk.t === 'eof') {
      throw this.errAt(tk, '代码到这里就结束了，但还缺一个「' + v + '」', hint || '检查一下括号、分号是不是成对出现。');
    }
    if (v === ';') {
      var sh = 'C 语言每条语句都要用分号 ; 结尾。比如 int a = 1; 或 printf("hi\\n");。';
      if (tk.t === 'kw' && ['return', 'if', 'while', 'for', 'else', 'break', 'continue', 'do', 'switch'].indexOf(tk.v) >= 0) {
        sh = '很可能是这一行的语句忘了写分号，于是解释器把下一行的 ' + tk.v + ' 也当成了这条语句的一部分。在 ' + tk.v + ' 前面补上分号就好了。';
      } else if (tk.t === 'op' && tk.v === '}') {
        sh = '这一行的语句结尾少了分号 ;，所以后面的 } 提前出现了。';
      } else if (tk.t === 'id') {
        sh = '这里出现了名字 ' + tk.v + '，可能是漏了分号，也可能是少写了一个运算符（+ - * / 等）。';
      }
      throw this.errAt(tk, '这条语句结尾少了分号「;」', sh);
    }
    if (tk.t === 'op' && tk.v === ';' && v !== ';') {
      throw this.errAt(tk, '多写了一个分号「;」', hint || '这里不该有分号，检查一下括号的位置。');
    }
    throw this.errAt(tk, '这里应该是「' + v + '」，但写成了 ' + describeToken(tk), hint || '');
  };

  // ---------- 类型说明符 ----------

  Parser.prototype.parseTypeSpec = function (required) {
    var isUnsigned = false;
    var longs = 0;
    var shorts = 0;
    var base = null;
    while (true) {
      var tk = this.peek();
      if (tk.t !== 'kw') break;
      var v = tk.v;
      if (v === 'const' || v === 'static' || v === 'signed') { this.i++; continue; }
      if (v === 'unsigned') { isUnsigned = true; this.i++; continue; }
      if (v === 'long') { longs++; this.i++; continue; }
      if (v === 'short') { shorts++; this.i++; continue; }
      if (v === 'int' || v === 'char' || v === 'float' || v === 'double' || v === 'void') { base = v; this.i++; break; }
      break;
    }
    if (!base) {
      if (longs > 0 || shorts > 0 || isUnsigned) base = 'int';
      else if (required) {
        var tk2 = this.peek();
        throw this.errAt(tk2, '这里应该写一种类型（int、double、char…），但写成了 ' + describeToken(tk2),
          'C 语言要求先写类型、再写名字，例如 int score;、double price;、char ch;。');
      } else {
        return null;
      }
    }
    if (base === 'void' && (longs || shorts || isUnsigned)) base = 'int';
    if (isUnsigned && base === 'char') base = 'char';
    return tyScalar(base);
  };

  // ---------- 程序 / 顶层 ----------

  Parser.prototype.parseProgram = function () {
    var program = { functions: {}, globals: [], order: [] };
    while (this.peek().t !== 'eof') {
      if (this.eat(';')) continue;
      var node = this.parseTopLevel(program);
      if (node) program.order.push(node);
    }
    return program;
  };

  Parser.prototype.parseTopLevel = function (program) {
    var base = this.parseTypeSpec(true);
    var stars = 0;
    while (this.at('*')) { stars++; this.i++; }
    var t = base;
    for (var s = 0; s < stars; s++) t = tyPtr(t);
    var nameTok = this.peek();
    if (nameTok.t === 'op' && nameTok.v === ';') { this.i++; return null; }
    if (nameTok.t !== 'id') {
      throw this.errAt(nameTok, '这里应该写变量名或函数名，但写成了 ' + describeToken(nameTok),
        '声明变量：int age = 18;　　定义函数：int main() { … }');
    }
    this.i++;
    if (this.at('(')) {
      this.i++;
      var params = this.parseParams();
      this.expectOp(')', '函数参数列表要用 ) 收尾，例如 int add(int a, int b) { … }。');
      if (this.eat(';')) return null; // 函数声明（原型），教学场景下直接忽略
      var body = this.parseBlock();
      if (program.functions[nameTok.v]) {
        throw this.errAt(nameTok, '函数 ' + nameTok.v + ' 被定义了两次', '一个函数只能写一份实现，检查一下是不是复制粘贴多了一份。');
      }
      var fn = { type: 'func', name: nameTok.v, retType: t, params: params, body: body, line: nameTok.line };
      program.functions[nameTok.v] = fn;
      return fn;
    }
    return this.parseVarDeclRest(t, nameTok.v, nameTok, program, true, stars);
  };

  Parser.prototype.parseParams = function () {
    var params = [];
    if (this.at(')')) return params;
    if (this.atKw('void') && this.peek(1).t === 'op' && this.peek(1).v === ')') { this.i++; return params; }
    while (true) {
      var base = this.parseTypeSpec(true);
      var stars = 0;
      while (this.at('*')) { stars++; this.i++; }
      var t2 = base;
      for (var s = 0; s < stars; s++) t2 = tyPtr(t2);
      var pname = null;
      if (this.peek().t === 'id') { pname = this.peek().v; this.i++; }
      var isArrayParam = false;
      while (this.at('[')) {
        this.i++;
        if (!this.at(']')) this.parseAssign();
        this.expectOp(']', '数组参数写成 int a[] 就可以了。');
        isArrayParam = true;
      }
      if (isArrayParam) t2 = tyPtr(t2);
      params.push({ name: pname, type: t2 });
      if (this.eat(',')) continue;
      break;
    }
    return params;
  };

  Parser.prototype.parseInitList = function () {
    var tk = this.peek();
    this.expectOp('{', '初始化列表要用 { } 包起来，例如 int a[3] = {1, 2, 3};。');
    var items = [];
    while (!this.at('}')) {
      if (this.at('{')) items.push(this.parseInitList());
      else items.push(this.parseAssign());
      if (this.eat(',')) {
        if (this.at('}')) break; // 允许最后多一个逗号
        continue;
      }
      break;
    }
    this.expectOp('}', '初始化列表要用 } 收尾，例如 int a[3] = {1, 2, 3};。');
    return { type: 'initlist', items: items, line: tk.line };
  };

  Parser.prototype.parseVarDeclRest = function (baseType, firstName, firstTok, program, isGlobal, stars) {
    var items = [];
    var name = firstName;
    var nameTok = firstTok;
    var starCount = stars || 0;
    while (true) {
      var elemType = baseType;
      for (var s = 0; s < starCount; s++) elemType = tyPtr(elemType);
      var dims = [];
      while (this.at('[')) {
        this.i++;
        var lenExpr = null;
        if (!this.at(']')) lenExpr = this.parseAssign();
        this.expectOp(']', '数组长度要用 ] 收尾，例如 int a[5];。');
        dims.push(lenExpr);
      }
      var init = null;
      if (this.eat('=')) {
        if (this.at('{')) init = this.parseInitList();
        else init = this.parseAssign();
      }
      items.push({ name: name, elemType: elemType, dims: dims, init: init, line: nameTok.line });
      if (this.eat(',')) {
        starCount = 0;
        while (this.at('*')) { starCount++; this.i++; }
        var nt = this.peek();
        if (nt.t !== 'id') {
          throw this.errAt(nt, '逗号后面应该再写一个变量名', '例如 int a = 1, b = 2;。如果只是想写一条语句，请用分号结尾。');
        }
        this.i++;
        name = nt.v;
        nameTok = nt;
        continue;
      }
      break;
    }
    this.expectOp(';', '声明语句要以分号结尾，例如 int age = 18;。');
    var decl = { type: 'decl', items: items, line: items[0].line };
    if (isGlobal) decl.isGlobal = true;
    return decl;
  };

  Parser.prototype.parseLocalDecl = function () {
    var base = this.parseTypeSpec(true);
    var stars = 0;
    while (this.at('*')) { stars++; this.i++; }
    var nt = this.peek();
    if (nt.t !== 'id') {
      throw this.errAt(nt, '变量声明里少了变量名', '格式是：类型 + 名字 + 分号，例如 int age = 18;。');
    }
    this.i++;
    return this.parseVarDeclRest(base, nt.v, nt, null, false, stars);
  };

  // ---------- 语句 ----------

  Parser.prototype.parseBlock = function () {
    var tk = this.peek();
    this.expectOp('{', '这里应该用一对花括号 { } 把代码块包起来。');
    var body = [];
    while (!this.at('}')) {
      if (this.peek().t === 'eof') {
        throw this.errAt(this.peek(), '花括号 { 没有配对，代码到这里就结束了',
          '每个 { 都要有对应的 }。检查一下函数、if、循环的花括号是不是成对出现。');
      }
      body.push(this.parseStatement());
    }
    this.expectOp('}');
    return { type: 'block', body: body, line: tk.line };
  };

  Parser.prototype.parseStatement = function () {
    var tk = this.peek();
    if (tk.t === 'op') {
      if (tk.v === '{') return this.parseBlock();
      if (tk.v === ';') { this.i++; return { type: 'empty', line: tk.line }; }
    }
    if (tk.t === 'kw') {
      if (tk.v === 'if') return this.parseIf();
      if (tk.v === 'while') return this.parseWhile();
      if (tk.v === 'for') return this.parseFor();
      if (tk.v === 'do') return this.parseDo();
      if (tk.v === 'switch') return this.parseSwitch();
      if (tk.v === 'return') return this.parseReturn();
      if (tk.v === 'break') { this.i++; this.expectOp(';', 'break 后面要写分号。'); return { type: 'break', line: tk.line }; }
      if (tk.v === 'continue') { this.i++; this.expectOp(';', 'continue 后面要写分号。'); return { type: 'continue', line: tk.line }; }
      if (tk.v === 'else') {
        throw this.errAt(tk, '这个 else 找不到配对的 if',
          'else 必须紧跟在 if 的代码块后面，例如：\nif (x > 0) {\n    printf("正数");\n} else {\n    printf("不是正数");\n}');
      }
      if (tk.v === 'case' || tk.v === 'default') {
        throw this.errAt(tk, tk.v + ' 只能写在 switch 的花括号里面',
          '例如：\nswitch (n) {\n    case 1:\n        printf("一");\n        break;\n    default:\n        printf("其它");\n}');
      }
      if (this.atTypeStart()) return this.parseLocalDecl();
    }
    return this.parseExprStatement();
  };

  Parser.prototype.parseExprStatement = function () {
    var tk = this.peek();
    var expr = this.parseExpression();
    if (!this.at(';')) {
      var nk = this.peek();
      var hint = 'C 语言每条语句都要用分号 ; 结尾，这里应该补一个分号。';
      if (nk.t === 'kw' && ['return', 'if', 'while', 'for', 'else', 'break', 'continue', 'do', 'switch'].indexOf(nk.v) >= 0) {
        hint = '很可能是上一行忘了写结尾的分号，于是解释器把下一行的 ' + nk.v + ' 也当成了这条语句的一部分。在 ' + nk.v + ' 前面补上分号就好了。';
      } else if (nk.t === 'op' && nk.v === '}') {
        hint = '这一行的语句结尾少了分号 ;，所以后面的 } 提前出现了。';
      } else if (nk.t === 'id') {
        hint = '这里出现了名字 ' + nk.v + '，可能是漏了分号，也可能是少写了一个运算符（+ - * / 等）。';
      }
      throw this.errAt(nk, '这条语句结尾少了分号「;」', hint);
    }
    this.i++;
    return { type: 'expr', expr: expr, line: tk.line };
  };

  Parser.prototype.parseIf = function () {
    var tk = this.next();
    this.expectOp('(', 'if 后面要跟一对括号，括号里写条件，例如 if (score >= 60) { … }。');
    var cond = this.parseExpression();
    this.expectOp(')', 'if 的条件后面少了右括号 )。');
    var then = this.parseStatement();
    var alt = null;
    if (this.atKw('else')) { this.i++; alt = this.parseStatement(); }
    return { type: 'if', cond: cond, then: then, alt: alt, line: tk.line };
  };

  Parser.prototype.parseWhile = function () {
    var tk = this.next();
    this.expectOp('(', 'while 后面要跟一对括号，例如 while (i <= 5) { … }。');
    var cond = this.parseExpression();
    this.expectOp(')', 'while 的条件后面少了右括号 )。');
    var body = this.parseStatement();
    return { type: 'while', cond: cond, body: body, line: tk.line };
  };

  Parser.prototype.parseDo = function () {
    var tk = this.next();
    var body = this.parseStatement();
    if (!this.atKw('while')) {
      throw this.errAt(this.peek(), 'do 循环的末尾要写 while (条件);',
        'do … while 的格式是：\ndo {\n    …\n} while (条件);\n注意结尾的分号不能忘。');
    }
    this.i++;
    this.expectOp('(', 'while 后面要跟一对括号。');
    var cond = this.parseExpression();
    this.expectOp(')', 'while 的条件后面少了右括号 )。');
    this.expectOp(';', 'do … while 结尾的分号不能少，例如 } while (i <= 5);');
    return { type: 'do', body: body, cond: cond, line: tk.line };
  };

  Parser.prototype.parseFor = function () {
    var tk = this.next();
    this.expectOp('(', 'for 的格式是：for (初始值; 条件; 每次的变化) { … }。');
    var initDecl = null;
    var initExpr = null;
    if (this.at(';')) { this.i++; }
    else if (this.atTypeStart()) {
      initDecl = this.parseLocalDecl(); // 内部已经吃掉了分号
    } else {
      initExpr = this.parseExpressionList();
      this.expectOp(';', 'for 的三个部分之间要用分号隔开，例如 for (int i = 1; i <= 5; i++)。');
    }
    var cond = null;
    if (!this.at(';')) cond = this.parseExpression();
    this.expectOp(';', 'for 的第二个分号不能少，条件后面还要写一个分号，例如 for (int i = 0; i < 5; i++)。');
    var update = null;
    if (!this.at(')')) update = this.parseExpressionList();
    this.expectOp(')', 'for 的三个部分要用右括号 ) 收尾。');
    var body = this.parseStatement();
    return { type: 'for', initDecl: initDecl, initExpr: initExpr, cond: cond, update: update, body: body, line: tk.line };
  };

  Parser.prototype.parseSwitch = function () {
    var tk = this.next();
    this.expectOp('(', 'switch 后面要跟一对括号，例如 switch (n) { … }。');
    var expr = this.parseExpression();
    this.expectOp(')', 'switch 的括号没有配对。');
    this.expectOp('{', 'switch 后面要用一对花括号把各个 case 包起来。');
    var cases = [];
    var cur = null;
    while (!this.at('}')) {
      var t = this.peek();
      if (t.t === 'eof') {
        throw this.errAt(t, 'switch 的花括号没有配对，代码到这里就结束了', '检查一下是不是漏了 }。');
      }
      if (this.atKw('case')) {
        this.i++;
        var v = this.parseAssign();
        this.expectOp(':', 'case 后面要写冒号，例如 case 1:。');
        cur = { value: v, body: [], line: t.line };
        cases.push(cur);
        continue;
      }
      if (this.atKw('default')) {
        this.i++;
        this.expectOp(':', 'default 后面要写冒号，例如 default:。');
        cur = { value: null, body: [], line: t.line };
        cases.push(cur);
        continue;
      }
      var st = this.parseStatement();
      if (!cur) {
        throw this.errAt(t, 'switch 里的语句要写在某个 case 或 default 后面',
          '例如：\nswitch (n) {\n    case 1:\n        printf("一");\n        break;\n    default:\n        printf("其它");\n}');
      }
      cur.body.push(st);
    }
    this.expectOp('}');
    return { type: 'switch', expr: expr, cases: cases, line: tk.line };
  };

  Parser.prototype.parseReturn = function () {
    var tk = this.next();
    var value = null;
    if (!this.at(';')) value = this.parseExpression();
    this.expectOp(';', 'return 语句要以分号结尾，例如 return 0;。');
    return { type: 'return', value: value, line: tk.line };
  };

  // ---------- 表达式 ----------

  var BIN_PREC = {
    '||': 1, '&&': 2, '|': 3, '^': 4, '&': 5,
    '==': 6, '!=': 6, '<': 7, '>': 7, '<=': 7, '>=': 7,
    '<<': 8, '>>': 8, '+': 9, '-': 9, '*': 10, '/': 10, '%': 10
  };

  var ASSIGN_OPS = ['=', '+=', '-=', '*=', '/=', '%='];

  Parser.prototype.parseExpression = function () {
    return this.parseExpressionList();
  };

  Parser.prototype.parseExpressionList = function () {
    var first = this.parseAssign();
    if (!this.at(',')) return first;
    var list = [first];
    while (this.eat(',')) list.push(this.parseAssign());
    return { type: 'comma', list: list, line: first.line };
  };

  Parser.prototype.parseAssign = function () {
    var left = this.parseCond();
    var tk = this.peek();
    if (tk.t === 'op' && ASSIGN_OPS.indexOf(tk.v) >= 0) {
      this.i++;
      var right = this.parseAssign();
      var ok = left.type === 'id' || left.type === 'index' ||
        (left.type === 'unary' && left.op === '*') || left.type === 'comma';
      if (!ok) {
        throw this.errAt(tk, '等号左边必须是能保存数据的东西（变量、数组元素或 *指针）',
          'a = 1;　arr[0] = 5;　*p = 3;　这些都是合法的；printf("hi") = 1; 这种写法没有意义。');
      }
      return { type: 'assign', op: tk.v, target: left, value: right, line: tk.line };
    }
    return left;
  };

  Parser.prototype.parseCond = function () {
    var cond = this.parseBinary(1);
    if (this.at('?')) {
      var tk = this.next();
      var then = this.parseExpression();
      if (!this.at(':')) {
        throw this.errAt(this.peek(), '三元运算符少了冒号 :', '格式是：条件 ? 条件成立时的值 : 条件不成立时的值，例如 max = a > b ? a : b;。');
      }
      this.i++;
      var alt = this.parseAssign();
      return { type: 'cond', cond: cond, then: then, alt: alt, line: tk.line };
    }
    return cond;
  };

  Parser.prototype.parseBinary = function (minPrec) {
    var left = this.parseUnary();
    while (true) {
      var tk = this.peek();
      if (tk.t !== 'op') break;
      var prec = BIN_PREC[tk.v];
      if (prec === undefined || prec < minPrec) break;
      this.i++;
      var right = this.parseBinary(prec + 1);
      left = { type: 'binary', op: tk.v, left: left, right: right, line: tk.line };
    }
    return left;
  };

  Parser.prototype.tryParseCast = function () {
    // 当前位置是 '('，尝试识别 (int)、 (double *) 这类强制类型转换
    var save = this.i;
    var tk = this.t[save];
    if (!(tk && tk.t === 'op' && tk.v === '(')) return null;
    this.i++;
    if (!this.atTypeStart()) { this.i = save; return null; }
    var base = this.parseTypeSpec(false);
    var stars = 0;
    while (this.at('*')) { stars++; this.i++; }
    if (!this.at(')')) { this.i = save; return null; }
    this.i++;
    var nx = this.peek();
    var startsExpr = nx && (nx.t === 'num' || nx.t === 'id' || nx.t === 'str' || nx.t === 'char' ||
      (nx.t === 'op' && (nx.v === '(' || nx.v === '-' || nx.v === '+' || nx.v === '!' || nx.v === '*' || nx.v === '&' || nx.v === '++' || nx.v === '--')) ||
      (nx.t === 'kw' && nx.v === 'sizeof'));
    if (!startsExpr) { this.i = save; return null; }
    var t = base;
    for (var s = 0; s < stars; s++) t = tyPtr(t);
    return t;
  };

  Parser.prototype.parseUnary = function () {
    var tk = this.peek();
    if (tk.t === 'op') {
      if (tk.v === '++' || tk.v === '--') {
        this.i++;
        var operand = this.parseUnary();
        if (!isLvalueNode(operand)) {
          throw this.errAt(tk, tk.v + ' 只能用在变量前面',
            '例如 ++i;、--count; 都是把变量的值加一或减一。不能写成 ++3;。');
        }
        return { type: 'update', op: tk.v, prefix: true, operand: operand, line: tk.line };
      }
      if (tk.v === '-' || tk.v === '+' || tk.v === '!' || tk.v === '~') {
        this.i++;
        return { type: 'unary', op: tk.v, operand: this.parseUnary(), line: tk.line };
      }
      if (tk.v === '&') {
        this.i++;
        var target = this.parseUnary();
        if (!isLvalueNode(target)) {
          throw this.errAt(tk, '& 只能用来取「变量」的地址（数组元素也可以）',
            '例如 int a = 3; int *p = &a; —— 这里的 &a 就是变量 a 的地址。');
        }
        return { type: 'addressof', operand: target, line: tk.line };
      }
      if (tk.v === '*') {
        this.i++;
        return { type: 'unary', op: '*', operand: this.parseUnary(), line: tk.line };
      }
      if (tk.v === '(') {
        var castType = this.tryParseCast();
        if (castType) {
          var inner = this.parseUnary();
          return { type: 'cast', to: castType, operand: inner, line: tk.line };
        }
      }
    }
    if (tk.t === 'kw' && tk.v === 'sizeof') {
      this.i++;
      if (this.at('(')) {
        var save2 = this.i;
        this.i++;
        if (this.atTypeStart()) {
          var t2 = this.parseTypeSpec(false);
          var stars2 = 0;
          while (this.at('*')) { stars2++; this.i++; }
          if (this.at(')')) {
            this.i++;
            var tt = t2;
            for (var s2 = 0; s2 < stars2; s2++) tt = tyPtr(tt);
            return { type: 'sizeofType', to: tt, line: tk.line };
          }
        }
        this.i = save2 + 1;
        var arg2 = this.parseExpression();
        this.expectOp(')', 'sizeof(…) 里的括号没有配对。');
        return { type: 'sizeof', expr: arg2, line: tk.line };
      }
      return { type: 'sizeof', expr: this.parseUnary(), line: tk.line };
    }
    return this.parsePostfix();
  };

  Parser.prototype.parsePostfix = function () {
    var node = this.parsePrimary();
    while (true) {
      var tk = this.peek();
      if (tk.t !== 'op') break;
      if (tk.v === '(') {
        if (node.type !== 'id') {
          throw this.errAt(tk, '只有函数名后面才能写括号调用',
            '例如 printf("hello\\n");。检查一下是不是把变量和函数名混在一起了。');
        }
        this.i++;
        var args = [];
        if (!this.at(')')) {
          while (true) {
            args.push(this.parseAssign());
            if (this.eat(',')) continue;
            break;
          }
        }
        this.expectOp(')', '函数调用的括号没有配对，少了右括号 )。');
        node = { type: 'call', name: node.name, args: args, line: node.line };
        continue;
      }
      if (tk.v === '[') {
        this.i++;
        var idx = this.parseExpression();
        this.expectOp(']', '数组下标要用 ] 收尾，例如 a[0]。');
        node = { type: 'index', array: node, index: idx, line: tk.line };
        continue;
      }
      if (tk.v === '++' || tk.v === '--') {
        this.i++;
        if (!isLvalueNode(node)) {
          throw this.errAt(tk, tk.v + ' 只能用在变量后面', '例如 i++;、arr[0]--;。');
        }
        node = { type: 'update', op: tk.v, prefix: false, operand: node, line: tk.line };
        continue;
      }
      if (tk.v === '.') {
        throw this.errAt(tk, '迷你 C 解释器还不支持「.」成员访问（结构体）',
          '结构体属于进阶内容，等你把变量、数组、函数、指针学完再学它会更轻松。');
      }
      if (tk.v === '->') {
        throw this.errAt(tk, '迷你 C 解释器还不支持「->」（结构体指针）',
          '先把 *p 和 &a 这种基础指针用法练熟吧。');
      }
      break;
    }
    return node;
  };

  Parser.prototype.parsePrimary = function () {
    var tk = this.peek();
    if (tk.t === 'num') { this.i++; return { type: 'num', value: tk.v.value, isFloat: tk.v.isFloat, line: tk.line }; }
    if (tk.t === 'str') { this.i++; return { type: 'str', value: tk.v, line: tk.line }; }
    if (tk.t === 'char') { this.i++; return { type: 'char', value: tk.v.value, line: tk.line }; }
    if (tk.t === 'id') {
      this.i++;
      return { type: 'id', name: tk.v, line: tk.line };
    }
    if (tk.t === 'op' && tk.v === '(') {
      this.i++;
      var e = this.parseExpression();
      this.expectOp(')', '括号没有配对：这里少了一个右括号 )。');
      return e;
    }
    if (tk.t === 'eof') {
      throw this.errAt(tk, '代码还没写完就结束了',
        '检查一下是不是少了右花括号 }、分号 ; 或右括号 ) 。');
    }
    if (tk.t === 'kw') {
      throw this.errAt(tk, '这里不能出现关键字 ' + tk.v,
        '关键字（int、for、if、return …）有专门的用法，不能当作数值或变量名使用。');
    }
    throw this.errAt(tk, '这里需要一个数值、变量或表达式，但看到的是 ' + describeToken(tk),
      '检查一下运算符两边的写法，或者是不是漏了一个数。');
  };

  function isLvalueNode(node) {
    return !!node && (node.type === 'id' || node.type === 'index' || (node.type === 'unary' && node.op === '*'));
  }

  function parseSource(src) {
    var pre = preprocess(src);
    var toks = lex(pre.code, pre.defines, 1);
    var parser = new Parser(toks, makeLineReader(src));
    var program = parser.parseProgram();
    program.includes = pre.includes;
    return program;
  }
  // ============================================================
  // 6. 运行时：数据模型
  // ============================================================

  function Cell(type, value) {
    this.type = type;
    this.value = value === undefined ? defaultValueFor(type) : value;
  }

  function ArrayVal(type, cells) {
    this.isArray = true;
    this.type = type;
    this.cells = cells;
    this.str = null;
  }

  function PtrVal(type, cells, index) {
    this.isPtr = true;
    this.type = type;
    this.cells = cells;
    this.index = index || 0;
    this.label = null;
  }

  function defaultValueFor(t) {
    if (!t) return 0;
    if (t.k === 'ptr') return null;
    if (t.k === 'array') return null;
    if (isFloatKind(t)) return 0;
    return 0;
  }

  function Env(parent) {
    this.vars = new Map();
    this.parent = parent || null;
  }

  Env.prototype.find = function (name) {
    var e = this;
    while (e) {
      if (e.vars.has(name)) return e.vars.get(name);
      e = e.parent;
    }
    return null;
  };

  function Interpreter(program, options) {
    this.program = program;
    this.opts = options || {};
    this.buf = [];
    this.outLen = 0;
    this.maxOut = this.opts.maxOutput || 20000;
    this.stdin = String(this.opts.stdin == null ? '' : this.opts.stdin).replace(/\r\n?/g, '\n');
    this.inputPos = 0;
    this.steps = 0;
    this.maxSteps = this.opts.maxSteps || 8000000;
    this.deadline = Date.now() + (this.opts.timeLimitMs || 4000);
    this.warnings = [];
    this.warned = new Set();
    this.randState = 1;
    this.globals = new Env(null);
    this.callDepth = 0;
    this.maxDepth = this.opts.maxDepth || 300;
    this.currentLine = 0;
  }

  // ---------- 运行控制 ----------

  Interpreter.prototype.step = function (line) {
    if (line) this.currentLine = line;
    this.steps++;
    if (this.steps > this.maxSteps) {
      throw CError('程序运行的步数太多了，可能写了死循环', line,
        '检查一下循环有没有「能结束」的条件，例如 while (i <= 5) 里 i 有没有不断变大。');
    }
    if ((this.steps & 8191) === 0 && Date.now() > this.deadline) {
      throw CError('程序运行时间太长了，可能写了死循环', line,
        '检查循环的结束条件，以及循环变量有没有正常变化。');
    }
  };

  Interpreter.prototype.print = function (text) {
    this.outLen += text.length;
    if (this.outLen > this.maxOut) {
      throw CError('程序的输出太多了（超过 ' + this.maxOut + ' 个字符）', this.currentLine,
        '检查一下是不是写了没有终点的循环，一直在打印。');
    }
    this.buf.push(text);
  };

  Interpreter.prototype.warn = function (msg, hint) {
    var key = msg;
    if (this.warned.has(key)) return;
    this.warned.add(key);
    this.warnings.push({ message: msg, hint: hint || '' });
  };

  // ---------- 类型 / 数值转换 ----------

  Interpreter.prototype.toNumber = function (v, node, what) {
    if (typeof v === 'number') return v;
    var line = node ? node.line : this.currentLine;
    if (v && (v.isPtr || v.isArray)) {
      throw CError('第 ' + line + ' 行：' + what + '里不能直接用' + (v.isArray ? '数组' : '指针') + '当数字',
        line, '如果是想取数组里的元素，请写下标，例如 a[0]；如果是想打印地址，可以先存到一个变量里。');
    }
    if (typeof v === 'string') {
      throw CError('第 ' + line + ' 行：' + what + '里不能直接用字符串当数字', line,
        '字符串要用双引号括起来，只能用 %s 打印。如果想把字符串变成数字，可以用 atoi("123")。');
    }
    throw CError('第 ' + line + ' 行：这里需要一个数字', line);
  };

  Interpreter.prototype.toInt = function (v, node, what) {
    var n = this.toNumber(v, node, what || '这里');
    if (!Number.isFinite(n)) {
      throw CError('第 ' + (node ? node.line : this.currentLine) + ' 行：数字算出了无效的结果（可能是除以 0 了）', node ? node.line : 0);
    }
    return Math.trunc(n);
  };

  Interpreter.prototype.truthy = function (v) {
    if (typeof v === 'number') return v !== 0;
    if (v && v.isPtr) return v.cells !== null && v.cells !== undefined;
    if (v && v.isArray) return true;
    return !!v;
  };

  Interpreter.prototype.decay = function (v, name) {
    if (!v || !v.isArray) return v;
    var p = new PtrVal(tyPtr(v.type.of), v.cells, 0);
    p.label = name || null;
    p.arrayType = v.type;
    return p;
  };

  Interpreter.prototype.maybeDecay = function (v, name) {
    if (v && v.isArray) return this.decay(v, name);
    return v;
  };

  Interpreter.prototype.coerce = function (value, type, node, what) {
    var line = node ? node.line : this.currentLine;
    if (!type || type.k === 'void') return value;
    if (type.k === 'ptr') {
      if (value && value.isArray) return this.decay(value);
      if (value && value.isPtr) return value;
      if (typeof value === 'number' && value === 0) return null;
      if (value === null) return null;
      throw CError('第 ' + line + ' 行：不能把' + this.valueDesc(value) + '当成指针使用', line,
        '指针变量要保存「地址」，例如 int a = 3; int *p = &a;。');
    }
    if (type.k === 'array') return value;
    if (isIntKind(type)) {
      if (value && (value.isPtr || value.isArray)) {
        throw CError('第 ' + line + ' 行：不能把' + (value.isArray ? '数组' : '指针') + '赋给整数变量', line,
          '如果想把指针里的值取出来，要用 *p；例如 int x = *p;。');
      }
      var n = this.toNumber(value, node, what || '赋值');
      if (typeof value === 'number' && !Number.isInteger(value)) {
        this.warn('把小数赋给了整数变量，小数部分会被丢掉（' + value + ' → ' + Math.trunc(n) + '）',
          '类型是整数的变量只能保存整数。想保留小数，请把变量声明成 double，例如 double x = ' + value + ';。');
      }
      var iv = Math.trunc(n);
      if (type.k === 'char') {
        if (iv < -128 || iv > 255) {
          this.warn('char 在真正的 C 语言里只有 1 个字节（-128~255），你写的是 ' + iv,
            '单个 char 装不下这么大的数。要存中文请用字符数组：char s[20] = "中文"; 要存更大的整数请用 int。');
        }
      }
      return iv;
    }
    if (isFloatKind(type)) {
      return this.toNumber(value, node, what || '赋值');
    }
    return value;
  };

  Interpreter.prototype.valueDesc = function (v) {
    if (typeof v === 'number') return v + '（数字）';
    if (typeof v === 'string') return '字符串 "' + v + '"';
    if (v && v.isArray) return '数组';
    if (v && v.isPtr) return '指针';
    if (v === null) return '空指针';
    return String(v);
  };

  // ---------- 字符串处理 ----------

  Interpreter.prototype.strValue = function (text) {
    var cells = [];
    for (var i = 0; i < text.length; i++) {
      cells.push(new Cell(TY_CHAR, text.charCodeAt(i)));
    }
    cells.push(new Cell(TY_CHAR, 0));
    var av = new ArrayVal(tyArray(TY_CHAR, cells.length), cells);
    av.str = text;
    return av;
  };

  Interpreter.prototype.toCString = function (v, node, what) {
    var line = node ? node.line : this.currentLine;
    if (v === null || v === undefined) {
      throw CError('第 ' + line + ' 行：' + (what || '这里') + '拿到的是空指针（NULL）', line,
        '空指针不能用来读写字符串。检查一下指针有没有真的指向一个数组。');
    }
    if (v && (v.isArray || v.isPtr)) {
      var cells = v.cells;
      var start = v.isPtr ? v.index : 0;
      if (!cells) {
        throw CError('第 ' + line + ' 行：' + (what || '这里') + '拿到的是空指针（NULL）', line,
          '这个指针还没有指向任何数组，不能直接使用。');
      }
      var out = '';
      for (var i = start; i < cells.length; i++) {
        var code = cells[i].value;
        if (typeof code !== 'number') break;
        if (code === 0) break;
        out += String.fromCharCode(((code % 65536) + 65536) % 65536);
      }
      return out;
    }
    if (typeof v === 'number') {
      throw CError('第 ' + line + ' 行：' + (what || '这里') + '需要字符串，得到的是数字 ' + v, line,
        '打印整数用 %d，打印小数用 %f，打印字符串用 %s。检查一下格式符有没有和类型对上。');
    }
    return String(v);
  };

  // ---------- 变量与内存 ----------

  Interpreter.prototype.makeArrayValue = function (dims, elemType) {
    var len = dims[0];
    var cells = [];
    var elemT;
    if (dims.length === 1) {
      elemT = elemType;
      for (var i = 0; i < len; i++) cells.push(new Cell(elemT));
    } else {
      var innerType = null;
      for (var j = 0; j < len; j++) {
        var av = this.makeArrayValue(dims.slice(1), elemType);
        if (!innerType) innerType = av.type;
        cells.push(new Cell(av.type, av));
      }
      elemT = innerType;
    }
    return new ArrayVal(tyArray(elemT, len), cells);
  };

  Interpreter.prototype.createCellForItem = function (item, env) {
    if (!item.dims || item.dims.length === 0) return new Cell(item.elemType);
    var dims = [];
    for (var d = 0; d < item.dims.length; d++) {
      var dimNode = item.dims[d];
      var len = null;
      if (dimNode) {
        len = this.toInt(this.evalExpr(dimNode, env), dimNode, '数组长度');
        if (len <= 0) {
          throw CError('第 ' + dimNode.line + ' 行：数组长度必须大于 0（你写的是 ' + len + '）', dimNode.line,
            '例如 int a[5]; 表示 5 个元素的数组。');
        }
      } else {
        // 长度留空 → 由初始化列表推断
        var init = item.init;
        if (init && init.type === 'initlist') len = init.items.length;
        else if (init && init.type === 'str') len = init.value.length + 1;
        else {
          throw CError('第 ' + item.line + ' 行：数组长度写成了空的 [ ]，那就必须用初始化列表来告诉它有多少个元素', item.line,
            '例如 int a[] = {1, 2, 3};（这时数组长度自动是 3）或写成 int a[3];。');
        }
      }
      dims.push(len);
    }
    var total = 1;
    for (var t = 0; t < dims.length; t++) total *= dims[t];
    if (total > 100000) {
      throw CError('第 ' + item.line + ' 行：数组太大了（一共 ' + total + ' 个元素）', item.line,
        '教学用的迷你解释器最多支持 100000 个元素。');
    }
    var av = this.makeArrayValue(dims, item.elemType);
    return new Cell(av.type, av);
  };

  Interpreter.prototype.execDecl = function (decl, env) {
    for (var i = 0; i < decl.items.length; i++) {
      var item = decl.items[i];
      if (env.vars.has(item.name)) {
        throw CError('第 ' + item.line + ' 行：变量 ' + item.name + ' 在同一个代码块里声明了两次', item.line,
          '换个名字，或者去掉重复的那一行。');
      }
      var cell = this.createCellForItem(item, env);
      env.vars.set(item.name, cell);
      if (item.init) this.initCell(cell, item.init, env, item);
    }
  };

  Interpreter.prototype.initCell = function (cell, initNode, env, item) {
    var v = cell.value;
    if (v && v.isArray) {
      if (initNode.type === 'str') {
        this.fillString(v, initNode.value, initNode);
        return;
      }
      if (initNode.type === 'initlist') {
        this.fillInitList(v, initNode, env);
        return;
      }
      throw CError('第 ' + initNode.line + ' 行：数组要用 { } 或字符串来初始化', initNode.line,
        '例如 int a[3] = {1, 2, 3}; 或 char s[] = "hi";。');
    }
    cell.value = this.coerce(this.evalExpr(initNode, env), cell.type, initNode, '初始化 ' + item.name);
  };

  Interpreter.prototype.fillString = function (arr, text, node) {
    if (!(arr.type.of && arr.type.of.k === 'char')) {
      throw CError('第 ' + node.line + ' 行：只有 char 类型的数组才能用字符串初始化', node.line,
        '例如 char name[20] = "小明";。int 数组要用 { } 初始化：int a[3] = {1, 2, 3};。');
    }
    if (text.length + 1 > arr.cells.length) {
      throw CError('第 ' + node.line + ' 行：字符串太长了，装不进这个 char 数组', node.line,
        '数组能装 ' + arr.cells.length + ' 个字符（还要留 1 个位置放结尾的 \\0），而字符串 "'
        + text + '" 需要 ' + (text.length + 1) + ' 个位置。把数组开大一点吧，例如 char s[' + (text.length + 1) + '];。');
    }
    for (var i = 0; i < arr.cells.length; i++) {
      arr.cells[i].value = i < text.length ? text.charCodeAt(i) : 0;
    }
    arr.str = text;
  };

  Interpreter.prototype.fillInitList = function (arr, listNode, env) {
    var innerIsArray = arr.type.of && arr.type.of.k === 'array';
    if (listNode.items.length > arr.cells.length) {
      throw CError('第 ' + listNode.line + ' 行：初始化列表里的数据比数组能装的还多', listNode.line,
        '数组只有 ' + arr.cells.length + ' 个位置，但你写了 ' + listNode.items.length + ' 个值。');
    }
    for (var i = 0; i < arr.cells.length; i++) {
      if (i >= listNode.items.length) break;
      var it = listNode.items[i];
      if (innerIsArray) {
        if (it.type !== 'initlist') {
          throw CError('第 ' + it.line + ' 行：二维数组的每一行都要用 { } 包起来', it.line,
            '例如 int m[2][3] = {{1, 2, 3}, {4, 5, 6}};。');
        }
        this.fillInitList(arr.cells[i].value, it, env);
      } else {
        var inner = arr.cells[i];
        if (it.type === 'initlist') {
          throw CError('第 ' + it.line + ' 行：这里多了一层 { }', it.line, '一维数组写成 int a[3] = {1, 2, 3}; 就可以了。');
        }
        inner.value = this.coerce(this.evalExpr(it, env), inner.type, it, '数组初始化');
      }
    }
  };

  Interpreter.prototype.resolveCell = function (node, env) {
    if (node.type === 'id') {
      var cell = env.find(node.name);
      if (!cell) throw this.undeclaredError(node);
      return cell;
    }
    if (node.type === 'index') {
      var base = this.evalExpr(node.array, env);
      var idx = this.toInt(this.evalExpr(node.index, env), node.index, '数组下标');
      var cells = null;
      var start = 0;
      var label = null;
      if (base && base.isPtr) { cells = base.cells; start = base.index; label = base.label; }
      else if (base && base.isArray) { cells = base.cells; start = 0; }
      if (!cells) {
        var l = node.line;
        throw CError('第 ' + l + ' 行：只有数组或指针才能用 [ ] 取元素', l,
          '例如先写 int a[5]; 再用 a[0]、a[1] 访问里面的元素。' + (base && base.isPtr === false && typeof base === 'number' ? '你现在用 ' + this.valueDesc(base) + ' 去取下标了。' : ''));
      }
      var pos = start + idx;
      if (pos < 0 || pos >= cells.length) {
        throw CError('第 ' + node.line + ' 行：数组下标越界（' + (label ? '数组 ' + label + ' ' : '') + '只有 ' + cells.length + ' 个元素，你访问的是第 ' + pos + ' 个）', node.line,
          '下标从 0 开始编号：' + (label || '数组') + '[' + cells.length + '] 的合法下标是 0 ~ ' + (cells.length - 1) + '。检查一下循环条件，比如应该是 i < ' + cells.length + ' 而不是 i <= ' + cells.length + '。');
      }
      return cells[pos];
    }
    if (node.type === 'unary' && node.op === '*') {
      return this.derefCell(this.requirePtrValue(this.evalExpr(node.operand, env), node), node);
    }
    throw CError('第 ' + node.line + ' 行：这里不能赋值', node.line, '等号左边要写变量、数组元素或 *指针。');
  };

  Interpreter.prototype.derefCell = function (pv, node) {
    if (!pv.cells) {
      throw CError('第 ' + node.line + ' 行：这个指针是空的（NULL），不能取它指向的值', node.line,
        '空指针没有指向任何变量。检查一下指针有没有初始化，例如 int *p = &a;。');
    }
    if (pv.index < 0 || pv.index >= pv.cells.length) {
      throw CError('第 ' + node.line + ' 行：指针已经指到数组外面了（数组只有 ' + pv.cells.length + ' 个元素）', node.line,
        '指针运算跑得太远啦。检查一下 p++ 的次数、或者 p + i 里的 i 是不是超出了范围。');
    }
    return pv.cells[pv.index];
  };

  Interpreter.prototype.undeclaredError = function (node) {
    var name = node.name;
    var line = node.line;
    var hint;
    var lower = name.toLowerCase();
    if (lower === 'print' || lower === 'println' || lower === 'printline' || lower === 'cout') {
      hint = 'C 语言里打印用的是 printf，而且要在括号里写格式，例如 printf("你好\\n");。';
    } else if (lower === 'cin' || lower === 'input' || lower === 'read') {
      hint = 'C 语言里读键盘输入用的是 scanf，例如 int a; scanf("%d", &a);。';
    } else if (lower === 'length' || lower === 'len') {
      hint = 'C 语言没有 length 属性，字符串长度要用 strlen(s)（需要 #include <string.h>）。';
    } else if (lower === 'random') {
      hint = 'C 语言里随机数用的是 rand()，先用 srand(time(NULL)) 播种，再用 rand() % 100 取范围。';
    } else if (name === 'printf' || name === 'scanf' || name === 'strlen' || name === 'rand' || name === 'sqrt') {
      hint = '这行代码在函数里、但书写位置可能不对，或者你少写了 #include <stdio.h>。';
    } else {
      hint = 'C 语言要求「先声明、再使用」。如果你是想用变量，请先写一行声明，例如 int ' + name + ' = 0;；如果它是一个函数，检查一下函数名有没有拼错。';
    }
    return CError('第 ' + line + ' 行：名字 ' + name + ' 没有定义', line, hint);
  };

  Interpreter.prototype.storeCell = function (cell, value, node) {
    if (cell.value && cell.value.isArray) {
      throw CError('第 ' + node.line + ' 行：数组整体不能直接赋值', node.line,
        '数组要一个元素一个元素地赋值：a[0] = 1; a[1] = 2;。字符串可以用 strcpy 整体复制。');
    }
    cell.value = this.coerce(value, cell.type, node, '赋值');
    return cell.value;
  };
  // ============================================================
  // 7. 运行时：表达式求值
  // ============================================================

  Interpreter.prototype.evalExpr = function (node, env) {
    this.step(node.line);
    switch (node.type) {
      case 'num': return node.value;
      case 'char': return node.value;
      case 'str': return this.strValue(node.value);
      case 'id': {
        var cell = env.find(node.name);
        if (!cell) throw this.undeclaredError(node);
        return this.maybeDecay(cell.value, node.name);
      }
      case 'index': {
        var ic = this.resolveCell(node, env);
        return this.maybeDecay(ic.value, null);
      }
      case 'call': return this.evalCall(node, env);
      case 'binary': return this.evalBinary(node, env);
      case 'assign': return this.evalAssign(node, env);
      case 'unary': return this.evalUnary(node, env);
      case 'addressof': {
        var target = this.resolveCell(node.operand, env);
        var p = new PtrVal(tyPtr(target.type), [target], 0);
        if (node.operand.type === 'id') p.label = node.operand.name;
        return p;
      }
      case 'update': return this.evalUpdate(node, env);
      case 'cast': {
        var cv = this.evalExpr(node.operand, env);
        if (isIntKind(node.to)) return this.coerce(cv, node.to, node, '类型转换');
        if (isFloatKind(node.to)) return this.toNumber(cv, node, '类型转换');
        if (node.to.k === 'ptr') return this.coerce(cv, node.to, node, '类型转换');
        return cv;
      }
      case 'sizeof': {
        var st = this.staticTypeOf(node.expr, env);
        return st && st.size ? st.size : 4;
      }
      case 'sizeofType': return node.to.size;
      case 'cond': {
        return this.truthy(this.evalExpr(node.cond, env))
          ? this.evalExpr(node.then, env)
          : this.evalExpr(node.alt, env);
      }
      case 'comma': {
        var last = 0;
        for (var i = 0; i < node.list.length; i++) last = this.evalExpr(node.list[i], env);
        return last;
      }
      default:
        throw CError('第 ' + node.line + ' 行：解释器还不认识这种写法', node.line,
          '是不是用了课程里还没讲到的语法？');
    }
  };

  Interpreter.prototype.evalUnary = function (node, env) {
    var v = this.evalExpr(node.operand, env);
    switch (node.op) {
      case '-': return -this.toNumber(v, node, '取负号');
      case '+': return this.toNumber(v, node, '正号');
      case '!': return this.truthy(v) ? 0 : 1;
      case '~': return ~this.toInt(v, node, '按位取反');
      case '*': return this.derefCell(this.requirePtrValue(v, node), node).value;
    }
    throw CError('第 ' + node.line + ' 行：不支持的运算符 ' + node.op, node.line);
  };

  Interpreter.prototype.evalUpdate = function (node, env) {
    var cell = this.resolveCell(node.operand, env);
    var old = cell.value;
    if (old === null || (old && old.isPtr)) {
      var pv = this.requirePtrValue(old, node);
      var np = this.ptrOffset(pv, node.op === '++' ? 1 : -1, node);
      cell.value = np;
      return node.prefix ? np : pv;
    }
    var num = this.toNumber(old, node, '自增/自减');
    var nv = node.op === '++' ? num + 1 : num - 1;
    cell.value = this.coerce(nv, cell.type, node, '自增/自减');
    return node.prefix ? cell.value : num;
  };

  Interpreter.prototype.requirePtrValue = function (pv, node) {
    if (pv === null || pv === undefined) {
      throw CError('第 ' + node.line + ' 行：这个指针是空的（NULL），不能取它指向的内容', node.line,
        '空指针没有指向任何变量。检查一下指针有没有初始化，例如 int *p = &a; 或 int *p = arr;。');
    }
    if (!pv.isPtr) {
      throw CError('第 ' + node.line + ' 行：* 只能用在指针上', node.line,
        '写法例子：int a = 3; int *p = &a; *p = 5; —— 这里的 *p 表示 p 指向的那个变量。');
    }
    return pv;
  };

  Interpreter.prototype.evalAssign = function (node, env) {
    var cell = this.resolveCell(node.target, env);
    var value;
    if (node.op === '=') {
      value = this.evalExpr(node.value, env);
    } else {
      var old = cell.value;
      var rhs = this.evalExpr(node.value, env);
      value = this.applyOp(node.op.charAt(0), old, rhs, node, env, node.target, node.value);
    }
    return this.storeCell(cell, value, node);
  };

  Interpreter.prototype.evalBinary = function (node, env) {
    if (node.op === '&&') {
      if (!this.truthy(this.evalExpr(node.left, env))) return 0;
      return this.truthy(this.evalExpr(node.right, env)) ? 1 : 0;
    }
    if (node.op === '||') {
      if (this.truthy(this.evalExpr(node.left, env))) return 1;
      return this.truthy(this.evalExpr(node.right, env)) ? 1 : 0;
    }
    var a = this.evalExpr(node.left, env);
    var b = this.evalExpr(node.right, env);
    return this.applyOp(node.op, a, b, node, env, node.left, node.right);
  };

  Interpreter.prototype.applyOp = function (op, a, b, node, env, leftNode, rightNode) {
    // 相等 / 不相等：单独处理（字符串、指针、NULL 都能比较）
    if (op === '==' || op === '!=') {
      var eq = this.looseEqual(a, b, node);
      return op === '==' ? (eq ? 1 : 0) : (eq ? 0 : 1);
    }
    var aIsPtr = !!(a && a.isPtr);
    var bIsPtr = !!(b && b.isPtr);
    if (aIsPtr || bIsPtr) {
      var line = node.line;
      if (op === '+' && aIsPtr && !bIsPtr) return this.ptrOffset(a, this.toInt(b, rightNode, '指针偏移'), node);
      if (op === '+' && !aIsPtr && bIsPtr) return this.ptrOffset(b, this.toInt(a, leftNode, '指针偏移'), node);
      if (op === '-' && aIsPtr && !bIsPtr) return this.ptrOffset(a, -this.toInt(b, rightNode, '指针偏移'), node);
      if (op === '-' && aIsPtr && bIsPtr) {
        if (a.cells === b.cells && a.cells) return a.index - b.index;
        throw CError('第 ' + line + ' 行：两个指针相减时，它们必须指向同一个数组', line,
          '比如 p 和 q 都指向数组 a 里面的位置才可以相减。');
      }
      if (op === '<' || op === '<=' || op === '>' || op === '>=') {
        if (a.cells === b.cells && a.cells) {
          var diff = a.index - b.index;
          if (op === '<') return diff < 0 ? 1 : 0;
          if (op === '<=') return diff <= 0 ? 1 : 0;
          if (op === '>') return diff > 0 ? 1 : 0;
          return diff >= 0 ? 1 : 0;
        }
        throw CError('第 ' + line + ' 行：比较大小的两个指针要指向同一个数组', line);
      }
      throw CError('第 ' + line + ' 行：指针不能做「' + op + '」运算', line,
        '指针可以做：p + 1（指向下一个元素）、p - q（相距几个元素）、p == q（是否指向同一处）。');
    }
    var x = this.toNumber(a, leftNode, '算式');
    var y = this.toNumber(b, rightNode, '算式');
    switch (op) {
      case '+': return x + y;
      case '-': return x - y;
      case '*': return x * y;
      case '/': {
        if (y === 0) {
          throw CError('第 ' + node.line + ' 行：除数是 0，不能用 0 做除数', node.line,
            '检查一下算式里的变量，或者在除法之前先判断：if (b != 0) { c = a / b; }');
        }
        var res = x / y;
        if (this.exprIsInt(leftNode, env) && this.exprIsInt(rightNode, env)) res = Math.trunc(res);
        return res;
      }
      case '%': {
        if (y === 0) {
          throw CError('第 ' + node.line + ' 行：% 取余的右边是 0', node.line, '例如 7 % 3 得到 1，右边不能为 0。');
        }
        if (!Number.isInteger(x) || !Number.isInteger(y)) {
          throw CError('第 ' + node.line + ' 行：% 取余只能用在整数上', node.line,
            '例如 7 % 3 得到 1。如果两边有小数，可以先用 (int) 转换，或者用 fmod 函数。');
        }
        return Math.trunc(x) % Math.trunc(y);
      }
      case '&': return this.toInt(x, node, '按位与') & this.toInt(y, node, '按位与');
      case '|': return this.toInt(x, node, '按位或') | this.toInt(y, node, '按位或');
      case '^': return this.toInt(x, node, '按位异或') ^ this.toInt(y, node, '按位异或');
      case '<<': return this.toInt(x, node, '左移') << this.toInt(y, node, '左移');
      case '>>': return this.toInt(x, node, '右移') >> this.toInt(y, node, '右移');
      case '<': return x < y ? 1 : 0;
      case '>': return x > y ? 1 : 0;
      case '<=': return x <= y ? 1 : 0;
      case '>=': return x >= y ? 1 : 0;
    }
    throw CError('第 ' + node.line + ' 行：不支持的运算符 ' + op, node.line);
  };

  Interpreter.prototype.ptrOffset = function (p, offset, node) {
    var np = new PtrVal(p.type, p.cells, p.index + offset);
    np.label = p.label;
    np.arrayType = p.arrayType;
    return np;
  };

  Interpreter.prototype.looseEqual = function (a, b, node) {
    var aNull = (a === null || a === undefined);
    var bNull = (b === null || b === undefined);
    if (aNull || bNull) {
      var other = aNull ? b : a;
      if (other === null || other === undefined) return true;
      if (typeof other === 'number') return other === 0;
      if (other && other.isPtr) return !other.cells;
      return false;
    }
    var aStr = (a && (a.isPtr || a.isArray)) ? this.tryCString(a) : null;
    var bStr = (b && (b.isPtr || b.isArray)) ? this.tryCString(b) : null;
    if (aStr !== null && bStr !== null) {
      this.warn('用 == 比较两个字符串时，C 语言比较的其实是「地址」而不是内容',
        '正确做法是用 strcmp(a, b) == 0 来判断两个字符串内容是否相同（需要 #include <string.h>）。为了让你先跑通，这里我按内容帮你比较了。');
      return aStr === bStr;
    }
    if (a && a.isPtr && b && b.isPtr) {
      if (!a.cells || !b.cells) return !a.cells && !b.cells;
      return a.cells === b.cells && a.index === b.index;
    }
    if ((a && (a.isPtr || a.isArray)) || (b && (b.isPtr || b.isArray))) return false;
    return Number(a) === Number(b);
  };

  Interpreter.prototype.tryCString = function (v) {
    try {
      if (!v || (!v.isPtr && !v.isArray)) return null;
      if (!v.cells) return null;
      var start = v.isPtr ? v.index : 0;
      var out = '';
      var cells = v.cells;
      for (var i = start; i < cells.length; i++) {
        var code = cells[i].value;
        if (typeof code !== 'number' || code === 0) break;
        out += String.fromCharCode(((code % 65536) + 65536) % 65536);
      }
      return out;
    } catch (e) { return null; }
  };

  // ---------- 静态类型推断（给 sizeof、整除判断、类型提示用） ----------

  Interpreter.prototype.staticTypeOf = function (node, env) {
    if (!node) return TY_INT;
    switch (node.type) {
      case 'num': return node.isFloat ? TY_DOUBLE : TY_INT;
      case 'char': return TY_CHAR;
      case 'str': return tyArray(TY_CHAR, String(node.value).length + 1);
      case 'id': {
        var cell = env ? env.find(node.name) : null;
        return cell ? cell.type : TY_INT;
      }
      case 'index': {
        var bt = this.staticTypeOf(node.array, env);
        if (bt && bt.k === 'array') return bt.of;
        if (bt && bt.k === 'ptr') return bt.to;
        return TY_INT;
      }
      case 'unary':
        if (node.op === '*') {
          var pt = this.staticTypeOf(node.operand, env);
          if (pt && pt.k === 'ptr') return pt.to;
          if (pt && pt.k === 'array') return pt.of;
          return TY_INT;
        }
        return this.staticTypeOf(node.operand, env);
      case 'addressof': {
        var at = this.staticTypeOf(node.operand, env);
        return tyPtr(at);
      }
      case 'cast': return node.to;
      case 'sizeof': case 'sizeofType': return TY_INT;
      case 'update': return this.staticTypeOf(node.operand, env);
      case 'assign': return this.staticTypeOf(node.target, env);
      case 'cond': return this.staticTypeOf(node.then, env);
      case 'comma': return this.staticTypeOf(node.list[node.list.length - 1], env);
      case 'binary': {
        var op = node.op;
        if (op === '==' || op === '!=' || op === '<' || op === '>' || op === '<=' || op === '>=' || op === '&&' || op === '||') return TY_INT;
        var lt = this.staticTypeOf(node.left, env);
        var rt = this.staticTypeOf(node.right, env);
        if (lt && lt.k === 'ptr') return lt;
        if (rt && rt.k === 'ptr') return rt;
        if (isFloatKind(lt) || isFloatKind(rt)) return TY_DOUBLE;
        return TY_INT;
      }
      case 'call': {
        var info = BUILTIN_INFO[node.name];
        if (info) return info.ret;
        var fd = this.program.functions[node.name];
        return fd ? fd.retType : TY_INT;
      }
    }
    return TY_INT;
  };

  Interpreter.prototype.exprIsInt = function (node, env) {
    var t = this.staticTypeOf(node, env);
    if (t && t.k === 'ptr') return false;
    if (isFloatKind(t)) return false;
    return true;
  };

  // ============================================================
  // 8. 运行时：语句执行
  // ============================================================

  Interpreter.prototype.execStatement = function (node, env) {
    this.step(node.line);
    switch (node.type) {
      case 'block': {
        var inner = new Env(env);
        for (var i = 0; i < node.body.length; i++) this.execStatement(node.body[i], inner);
        return;
      }
      case 'empty': return;
      case 'expr': this.evalExpr(node.expr, env); return;
      case 'decl': this.execDecl(node, env); return;
      case 'if': {
        if (node.cond && node.cond.type === 'assign' && node.cond.op === '=') {
          this.warn('第 ' + node.line + ' 行的 if 条件里用的是 =（赋值），而不是 ==（比较）',
            '= 是把右边的值存进左边的变量，== 才是判断「是不是相等」。大多数情况下你想写的是 ==。');
        }
        if (this.truthy(this.evalExpr(node.cond, env))) this.execStatement(node.then, env);
        else if (node.alt) this.execStatement(node.alt, env);
        return;
      }
      case 'while': {
        while (this.truthy(this.evalExpr(node.cond, env))) {
          this.step(node.line);
          try {
            this.execStatement(node.body, env);
          } catch (e) {
            if (e && e.__flow === 'break') break;
            if (e && e.__flow === 'continue') continue;
            throw e;
          }
        }
        return;
      }
      case 'do': {
        do {
          this.step(node.line);
          try {
            this.execStatement(node.body, env);
          } catch (e) {
            if (e && e.__flow === 'break') break;
            if (e && e.__flow === 'continue') { /* 继续判断条件 */ }
            else throw e;
          }
        } while (this.truthy(this.evalExpr(node.cond, env)));
        return;
      }
      case 'for': {
        var loopEnv = new Env(env);
        if (node.initDecl) this.execDecl(node.initDecl, loopEnv);
        else if (node.initExpr) this.evalExpr(node.initExpr, loopEnv);
        while (true) {
          this.step(node.line);
          if (node.cond && !this.truthy(this.evalExpr(node.cond, loopEnv))) break;
          var jumped = null;
          try {
            this.execStatement(node.body, loopEnv);
          } catch (e) {
            if (e && e.__flow === 'break') break;
            if (e && e.__flow === 'continue') jumped = 'continue';
            else throw e;
          }
          if (node.update) this.evalExpr(node.update, loopEnv);
        }
        return;
      }
      case 'switch': {
        var val = this.evalExpr(node.expr, env);
        var startIdx = -1, defIdx = -1;
        for (var ci = 0; ci < node.cases.length; ci++) {
          if (node.cases[ci].value === null) { defIdx = ci; continue; }
          var cv = this.evalExpr(node.cases[ci].value, env);
          if (this.looseEqual(val, cv, node)) { startIdx = ci; break; }
        }
        if (startIdx < 0) startIdx = defIdx;
        if (startIdx < 0) return;
        var swEnv = new Env(env);
        try {
          for (var k = startIdx; k < node.cases.length; k++) {
            var body = node.cases[k].body;
            for (var b = 0; b < body.length; b++) this.execStatement(body[b], swEnv);
          }
        } catch (e2) {
          if (!(e2 && e2.__flow === 'break')) throw e2;
        }
        return;
      }
      case 'return': {
        var rv = node.value ? this.evalExpr(node.value, env) : 0;
        throw { __flow: 'return', value: rv };
      }
      case 'break': throw { __flow: 'break' };
      case 'continue': throw { __flow: 'continue' };
      default:
        throw CError('第 ' + node.line + ' 行：解释器还不认识这种语句', node.line);
    }
  };

  // ---------- 函数调用 ----------

  Interpreter.prototype.callUserFunction = function (decl, argVals, line) {
    var callLine = line || decl.line;
    if (this.callDepth >= this.maxDepth) {
      throw CError('第 ' + callLine + ' 行：函数调用层次太深了（很可能是无限递归）', callLine,
        '递归函数一定要写「什么时候停下来」的条件。例如：if (n == 0) return 1; —— 没有这个条件，函数会一直调用自己。');
    }
    var expect = decl.params.length;
    if (argVals.length !== expect) {
      throw CError('第 ' + callLine + ' 行：调用 ' + decl.name + ' 需要 ' + expect + ' 个参数，但你给了 ' + argVals.length + ' 个',
        callLine, this.funcSignatureHint(decl));
    }
    var env = new Env(this.globals);
    for (var i = 0; i < expect; i++) {
      var p = decl.params[i];
      var nm = p.name || ('参数' + (i + 1));
      var v = this.coerce(argVals[i], p.type, null, '传给 ' + decl.name + ' 的参数 ' + nm);
      env.vars.set(p.name || ('__arg' + i), new Cell(p.type, v));
    }
    this.callDepth++;
    var didReturn = false;
    var retVal = 0;
    try {
      this.execStatement(decl.body, env);
    } catch (e) {
      if (e && e.__flow === 'return') { didReturn = true; retVal = e.value; }
      else if (e && (e.__flow === 'break' || e.__flow === 'continue')) {
        this.callDepth--;
        throw CError('第 ' + callLine + ' 行：break / continue 只能写在循环（或 switch）里面', callLine,
          '检查一下是不是把 break 写到了循环外面。');
      } else { this.callDepth--; throw e; }
    }
    this.callDepth--;
    if (!didReturn && decl.retType && decl.retType.k !== 'void') {
      this.warn('函数 ' + decl.name + ' 声明了返回值，但有一条路没有写 return，会得到不确定的结果',
        '每个要返回值的函数，在所有分支结束前都要写 return，例如 return 0;。');
    }
    if (!didReturn) return 0;
    if (decl.retType && decl.retType.k === 'void') return 0;
    return this.coerce(retVal, decl.retType, null, decl.name + ' 的返回值');
  };

  Interpreter.prototype.funcSignatureHint = function (decl) {
    var parts = [];
    for (var i = 0; i < decl.params.length; i++) {
      parts.push(typeName(decl.params[i].type) + ' ' + (decl.params[i].name || ('p' + (i + 1))));
    }
    return '这个函数的写法是：' + typeName(decl.retType) + ' ' + decl.name + '(' + parts.join(', ') + ')。调用的参数个数和类型要跟它对上。';
  };

  // ---------- 程序入口 ----------

  Interpreter.prototype.run = function () {
    var mainFn = this.program.functions['main'];
    if (!mainFn) {
      throw CError('找不到 main 函数', 0,
        '每个 C 程序都从 main 函数开始执行。你需要写一个 main：\n\nint main() {\n    printf("你好\\n");\n    return 0;\n}');
    }
    var order = this.program.order || [];
    for (var i = 0; i < order.length; i++) {
      if (order[i] && order[i].type === 'decl' && order[i].isGlobal) this.execDecl(order[i], this.globals);
    }
    if (!this.printedHeaderHint) {
      var inc = (this.program.includes || []).join(' ');
      if (inc.indexOf('stdio') < 0 && this.program.functions['main']) {
        this.pendingStdioHint = true;
      }
    }
    this.callUserFunction(mainFn, [], mainFn.line);
    if (this.pendingStdioHint) {
      this.warn('小提示：用 printf / scanf 需要写 #include <stdio.h>',
        '真正的 C 编译器不会自动帮你加这一行，这里为了教学方便先帮你补上了。记得在你自己的代码里写上 #include <stdio.h>。');
    }
    return { output: this.buf.join(''), warnings: this.warnings, steps: this.steps };
  };
  // ============================================================
  // 9. 内置函数（相当于 C 标准库的一小部分）
  // ============================================================

  var TY_PTR_CHAR = tyPtr(TY_CHAR);
  var TY_PTR_INT = tyPtr(TY_INT);

  var BUILTIN_INFO = {
    printf: { min: 1, max: 99, ret: TY_INT, sig: 'printf("格式", 值…)' },
    puts: { min: 1, max: 1, ret: TY_INT, sig: 'puts("字符串")' },
    putchar: { min: 1, max: 1, ret: TY_INT, sig: 'putchar(字符)' },
    getchar: { min: 0, max: 0, ret: TY_INT, sig: 'getchar()' },
    scanf: { min: 1, max: 99, ret: TY_INT, sig: 'scanf("%d", &变量)' },
    strlen: { min: 1, max: 1, ret: TY_INT, sig: 'strlen(s)' },
    strcmp: { min: 2, max: 2, ret: TY_INT, sig: 'strcmp(a, b)' },
    strcpy: { min: 2, max: 2, ret: TY_PTR_CHAR, sig: 'strcpy(目标, 来源)' },
    strcat: { min: 2, max: 2, ret: TY_PTR_CHAR, sig: 'strcat(目标, 来源)' },
    abs: { min: 1, max: 1, ret: TY_INT, sig: 'abs(n)' },
    fabs: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'fabs(x)' },
    sqrt: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'sqrt(x)' },
    pow: { min: 2, max: 2, ret: TY_DOUBLE, sig: 'pow(x, y)' },
    floor: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'floor(x)' },
    ceil: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'ceil(x)' },
    round: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'round(x)' },
    fmod: { min: 2, max: 2, ret: TY_DOUBLE, sig: 'fmod(x, y)' },
    rand: { min: 0, max: 0, ret: TY_INT, sig: 'rand()' },
    srand: { min: 1, max: 1, ret: TY_VOID, sig: 'srand(种子)' },
    time: { min: 0, max: 1, ret: TY_INT, sig: 'time(NULL)' },
    atoi: { min: 1, max: 1, ret: TY_INT, sig: 'atoi("123")' },
    toupper: { min: 1, max: 1, ret: TY_INT, sig: 'toupper(字符)' },
    tolower: { min: 1, max: 1, ret: TY_INT, sig: 'tolower(字符)' },
    sprintf: { min: 2, max: 99, ret: TY_INT, sig: 'sprintf(目标, "格式", 值…)' },
    strncmp: { min: 3, max: 3, ret: TY_INT, sig: 'strncmp(a, b, n)' },
    strncpy: { min: 3, max: 3, ret: TY_PTR_CHAR, sig: 'strncpy(目标, 来源, n)' },
    strncat: { min: 3, max: 3, ret: TY_PTR_CHAR, sig: 'strncat(目标, 来源, n)' },
    strchr: { min: 2, max: 2, ret: TY_PTR_CHAR, sig: 'strchr(字符串, 字符)' },
    strstr: { min: 2, max: 2, ret: TY_PTR_CHAR, sig: 'strstr(大字符串, 小字符串)' },
    isalpha: { min: 1, max: 1, ret: TY_INT, sig: 'isalpha(字符)' },
    isdigit: { min: 1, max: 1, ret: TY_INT, sig: 'isdigit(字符)' },
    isalnum: { min: 1, max: 1, ret: TY_INT, sig: 'isalnum(字符)' },
    isspace: { min: 1, max: 1, ret: TY_INT, sig: 'isspace(字符)' },
    isupper: { min: 1, max: 1, ret: TY_INT, sig: 'isupper(字符)' },
    islower: { min: 1, max: 1, ret: TY_INT, sig: 'islower(字符)' },
    ispunct: { min: 1, max: 1, ret: TY_INT, sig: 'ispunct(字符)' },
    sin: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'sin(弧度)' },
    cos: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'cos(弧度)' },
    tan: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'tan(弧度)' },
    asin: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'asin(x)' },
    acos: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'acos(x)' },
    atan: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'atan(x)' },
    atan2: { min: 2, max: 2, ret: TY_DOUBLE, sig: 'atan2(y, x)' },
    exp: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'exp(x)' },
    log: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'log(x)' },
    log10: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'log10(x)' },
    log2: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'log2(x)' },
    cbrt: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'cbrt(x)' },
    trunc: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'trunc(x)' },
    fmin: { min: 2, max: 2, ret: TY_DOUBLE, sig: 'fmin(a, b)' },
    fmax: { min: 2, max: 2, ret: TY_DOUBLE, sig: 'fmax(a, b)' },
    hypot: { min: 2, max: 2, ret: TY_DOUBLE, sig: 'hypot(a, b)' },
    isnan: { min: 1, max: 1, ret: TY_INT, sig: 'isnan(x)' },
    isinf: { min: 1, max: 1, ret: TY_INT, sig: 'isinf(x)' },
    labs: { min: 1, max: 1, ret: TY_INT, sig: 'labs(n)' },
    atof: { min: 1, max: 1, ret: TY_DOUBLE, sig: 'atof("3.14")' }
  };

  var BUILTIN_SET = new Set(Object.keys(BUILTIN_INFO));

  function repeatStr(s, n) {
    var out = '';
    for (var i = 0; i < n; i++) out += s;
    return out;
  }

  function arityText(info) {
    if (info.min === info.max) return info.min + ' 个参数';
    return '至少 ' + info.min + ' 个参数';
  }

  function nearestName(name, pool) {
    var best = null;
    var bestD = 3;
    var lower = String(name).toLowerCase();
    for (var i = 0; i < pool.length; i++) {
      var cand = pool[i];
      var d = editDistance(lower, String(cand).toLowerCase());
      if (d < bestD) { bestD = d; best = cand; }
    }
    return best;
  }

  function editDistance(a, b) {
    var m = a.length, n = b.length;
    if (Math.abs(m - n) > 2) return 99;
    var prev = [];
    for (var j = 0; j <= n; j++) prev[j] = j;
    for (var i = 1; i <= m; i++) {
      var cur = [i];
      for (var k = 1; k <= n; k++) {
        cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + (a[i - 1] === b[k - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  Interpreter.prototype.evalCall = function (node, env) {
    var name = node.name;
    if (BUILTIN_SET.has(name)) return this.callBuiltin(name, node, env);
    var decl = this.program.functions[name];
    if (!decl) {
      var pool = Object.keys(this.program.functions).concat(Array.from(BUILTIN_SET));
      var near = nearestName(name, pool);
      var hint = 'C 语言里函数要先定义（或声明）才能调用。检查一下函数名有没有拼错，注意大小写。';
      if (near) hint = '是不是想写 ' + near + ' ？函数名必须完全一致（包括大小写）。';
      throw CError('第 ' + node.line + ' 行：函数 ' + name + ' 没有定义', node.line, hint);
    }
    var args = [];
    for (var i = 0; i < node.args.length; i++) args.push(this.evalExpr(node.args[i], env));
    return this.callUserFunction(decl, args, node.line);
  };

  Interpreter.prototype.callBuiltin = function (name, node, env) {
    var info = BUILTIN_INFO[name];
    if (node.args.length < info.min || node.args.length > info.max) {
      throw CError('第 ' + node.line + ' 行：' + name + ' 需要' + arityText(info) + '，但你写了 ' + node.args.length + ' 个',
        node.line, '正确写法：' + info.sig + '。');
    }
    var args = [];
    for (var i = 0; i < node.args.length; i++) args.push(this.evalExpr(node.args[i], env));
    switch (name) {
      case 'printf': return this.doPrintf(node, args);
      case 'puts': {
        var s = this.toCString(args[0], node.args[0], 'puts 的参数');
        this.print(s + '\n');
        return s.length;
      }
      case 'putchar': {
        var code = this.toInt(args[0], node.args[0], 'putchar 的参数');
        this.print(String.fromCharCode(((code % 65536) + 65536) % 65536));
        return code;
      }
      case 'getchar': {
        if (this.inputPos >= this.stdin.length) return -1;
        var ch = this.stdin.charCodeAt(this.inputPos);
        this.inputPos++;
        return ch;
      }
      case 'scanf': return this.doScanf(node, args);
      case 'strlen': return this.toCString(args[0], node.args[0], 'strlen 的参数').length;
      case 'strcmp': {
        var a = this.toCString(args[0], node.args[0], 'strcmp 的参数');
        var b = this.toCString(args[1], node.args[1], 'strcmp 的参数');
        return a < b ? -1 : (a > b ? 1 : 0);
      }
      case 'strcpy': {
        var view = this.writableString(args[0], node, 'strcpy');
        var src = this.toCString(args[1], node.args[1], 'strcpy 的来源');
        this.writeString(view, src, node, 'strcpy');
        return args[0];
      }
      case 'strcat': {
        var view2 = this.writableString(args[0], node, 'strcat');
        var src2 = this.toCString(args[1], node.args[1], 'strcat 的来源');
        var end = view2.start;
        while (end < view2.cells.length && view2.cells[end].value !== 0) end++;
        if (end >= view2.cells.length) {
          throw CError('第 ' + node.line + ' 行：strcat 的第一个字符串好像没有结尾的 \\0', node.line,
            '检查一下这个 char 数组有没有正确初始化。');
        }
        this.writeString({ cells: view2.cells, start: end }, src2, node, 'strcat');
        return args[0];
      }
      case 'abs': return Math.abs(this.toInt(args[0], node.args[0], 'abs 的参数'));
      case 'fabs': return Math.abs(this.toNumber(args[0], node.args[0], 'fabs 的参数'));
      case 'sqrt': {
        var x = this.toNumber(args[0], node.args[0], 'sqrt 的参数');
        if (x < 0) {
          throw CError('第 ' + node.line + ' 行：sqrt 不能对负数开平方（你给的是 ' + x + '）', node.line,
            '检查一下数值，或者在开平方前先判断：if (x >= 0)。');
        }
        return Math.sqrt(x);
      }
      case 'pow': return Math.pow(this.toNumber(args[0], node.args[0], 'pow 的参数'), this.toNumber(args[1], node.args[1], 'pow 的参数'));
      case 'floor': return Math.floor(this.toNumber(args[0], node.args[0], 'floor 的参数'));
      case 'ceil': return Math.ceil(this.toNumber(args[0], node.args[0], 'ceil 的参数'));
      case 'round': return Math.round(this.toNumber(args[0], node.args[0], 'round 的参数'));
      case 'fmod': return this.toNumber(args[0], node.args[0], 'fmod 的参数') % this.toNumber(args[1], node.args[1], 'fmod 的参数');
      case 'rand': {
        this.randState = (Math.imul(this.randState, 1103515245) + 12345) & 0x7fffffff;
        return this.randState % 32768;
      }
      case 'srand': {
        var seed = this.toInt(args[0], node.args[0], 'srand 的种子');
        this.randState = seed | 0;
        if (this.randState === 0) this.randState = 1;
        return 0;
      }
      case 'time': {
        if (this.opts.fixedTime !== undefined && this.opts.fixedTime !== null) return this.opts.fixedTime;
        return Math.floor(Date.now() / 1000);
      }
      case 'atoi': {
        var text = this.toCString(args[0], node.args[0], 'atoi 的参数');
        var m = /^\s*([+\-]?[0-9]+)/.exec(text);
        return m ? parseInt(m[1], 10) : 0;
      }
      case 'toupper': {
        var c1 = this.toInt(args[0], node.args[0], 'toupper 的参数');
        return c1 >= 97 && c1 <= 122 ? c1 - 32 : c1;
      }
      case 'tolower': {
        var c2 = this.toInt(args[0], node.args[0], 'tolower 的参数');
        return c2 >= 65 && c2 <= 90 ? c2 + 32 : c2;
      }
      case 'sprintf': return this.doSprintf(node, args);
      case 'strncmp': {
        var na = this.toCString(args[0], node.args[0], 'strncmp 的参数');
        var nb = this.toCString(args[1], node.args[1], 'strncmp 的参数');
        var nn = this.toInt(args[2], node.args[2], 'strncmp 的 n');
        if (nn < 0) throw CError('第 ' + node.line + ' 行：strncmp 的 n 不能是负数', node.line);
        var lim = Math.min(nn, na.length, nb.length);
        for (var si = 0; si < lim; si++) {
          var ca = na.charCodeAt(si), cb = nb.charCodeAt(si);
          if (ca !== cb) return ca < cb ? -1 : 1;
        }
        if (nn <= lim) return 0;
        return na.length === nb.length ? 0 : (na.length < nb.length ? -1 : 1);
      }
      case 'strncpy': {
        var viewN = this.writableString(args[0], node, 'strncpy');
        var srcN = this.toCString(args[1], node.args[1], 'strncpy 的来源');
        var nN = this.toInt(args[2], node.args[2], 'strncpy 的 n');
        if (nN < 0) throw CError('第 ' + node.line + ' 行：strncpy 的 n 不能是负数', node.line);
        if (viewN.start + nN > viewN.cells.length) {
          throw CError('第 ' + node.line + ' 行：strncpy 要复制 ' + nN + ' 个字符，目标数组放不下', node.line,
            '目标数组总共 ' + viewN.cells.length + ' 个位置，从第 ' + viewN.start + ' 个开始只剩 ' + (viewN.cells.length - viewN.start) + ' 个。');
        }
        for (var ci = 0; ci < nN; ci++) {
          viewN.cells[viewN.start + ci].value = ci < srcN.length ? srcN.charCodeAt(ci) : 0;
        }
        if (srcN.length >= nN) {
          this.warn('strncpy 在来源字符串长度 >= n 时不会自动补 \\0',
            '如果后面要用 %s 打印它，记得自己补一个 \\0，或者把 n 写大一点（并确保数组够大）。');
        }
        return args[0];
      }
      case 'strncat': {
        var viewA = this.writableString(args[0], node, 'strncat');
        var srcA = this.toCString(args[1], node.args[1], 'strncat 的来源');
        var nA = this.toInt(args[2], node.args[2], 'strncat 的 n');
        if (nA < 0) throw CError('第 ' + node.line + ' 行：strncat 的 n 不能是负数', node.line);
        var endA = viewA.start;
        while (endA < viewA.cells.length && viewA.cells[endA].value !== 0) endA++;
        if (endA >= viewA.cells.length) {
          throw CError('第 ' + node.line + ' 行：strncat 的第一个字符串没有结尾的 \\0', node.line);
        }
        var take = Math.min(nA, srcA.length);
        if (endA + take + 1 > viewA.cells.length) {
          throw CError('第 ' + node.line + ' 行：strncat 要追加 ' + take + ' 个字符，目标数组放不下', node.line,
            '目标数组只剩 ' + (viewA.cells.length - endA - 1) + ' 个位置可放字符。');
        }
        for (var ai = 0; ai < take; ai++) viewA.cells[endA + ai].value = srcA.charCodeAt(ai);
        viewA.cells[endA + take].value = 0;
        return args[0];
      }
      case 'strchr': {
        var svC = args[0];
        var cellsC = null, startC = 0;
        if (svC && svC.isPtr) { cellsC = svC.cells; startC = svC.index; }
        else if (svC && svC.isArray) { cellsC = svC.cells; startC = 0; }
        if (!cellsC) throw CError('第 ' + node.line + ' 行：strchr 的第一个参数需要字符串', node.line);
        var codeC = this.toInt(args[1], node.args[1], 'strchr 的字符');
        if (codeC === 0) {
          var endC = startC;
          while (endC < cellsC.length && cellsC[endC].value !== 0) endC++;
          return new PtrVal(tyPtr(TY_CHAR), cellsC, endC);
        }
        for (var chC = startC; chC < cellsC.length; chC++) {
          if (cellsC[chC].value === codeC) {
            var foundC = new PtrVal(tyPtr(TY_CHAR), cellsC, chC);
            foundC.label = 'strchr';
            return foundC;
          }
          if (cellsC[chC].value === 0) break;
        }
        return null;
      }
      case 'strstr': {
        var hay = this.toCString(args[0], node.args[0], 'strstr 的大字符串');
        var needle = this.toCString(args[1], node.args[1], 'strstr 的小字符串');
        var idxS = hay.indexOf(needle);
        if (idxS < 0) return null;
        var cellsS = null, startS = 0;
        if (args[0] && args[0].isPtr) { cellsS = args[0].cells; startS = args[0].index; }
        else if (args[0] && args[0].isArray) { cellsS = args[0].cells; startS = 0; }
        if (!cellsS) return null;
        var foundS = new PtrVal(tyPtr(TY_CHAR), cellsS, startS + idxS);
        foundS.label = 'strstr';
        return foundS;
      }
      case 'isalpha': return this.isCharClass(args[0], node, 'isalpha') ? 1 : 0;
      case 'isdigit': { var d0 = this.toInt(args[0], node.args[0], 'isdigit 的参数'); return d0 >= 48 && d0 <= 57 ? 1 : 0; }
      case 'isalnum': return (this.isCharClass(args[0], node, 'isalnum') || (function (c) { return c >= 48 && c <= 57; })(this.toInt(args[0], node.args[0], 'isalnum 的参数'))) ? 1 : 0;
      case 'isspace': { var sp = this.toInt(args[0], node.args[0], 'isspace 的参数'); return (sp === 32 || sp === 9 || sp === 10 || sp === 11 || sp === 12 || sp === 13) ? 1 : 0; }
      case 'isupper': { var up = this.toInt(args[0], node.args[0], 'isupper 的参数'); return up >= 65 && up <= 90 ? 1 : 0; }
      case 'islower': { var lo = this.toInt(args[0], node.args[0], 'islower 的参数'); return lo >= 97 && lo <= 122 ? 1 : 0; }
      case 'ispunct': {
        var pu = this.toInt(args[0], node.args[0], 'ispunct 的参数');
        var printable = pu >= 33 && pu <= 126;
        var alnum = (pu >= 48 && pu <= 57) || (pu >= 65 && pu <= 90) || (pu >= 97 && pu <= 122);
        return printable && !alnum ? 1 : 0;
      }
      case 'sin': return Math.sin(this.toNumber(args[0], node.args[0], 'sin 的参数'));
      case 'cos': return Math.cos(this.toNumber(args[0], node.args[0], 'cos 的参数'));
      case 'tan': return Math.tan(this.toNumber(args[0], node.args[0], 'tan 的参数'));
      case 'asin': return Math.asin(this.toNumber(args[0], node.args[0], 'asin 的参数'));
      case 'acos': return Math.acos(this.toNumber(args[0], node.args[0], 'acos 的参数'));
      case 'atan': return Math.atan(this.toNumber(args[0], node.args[0], 'atan 的参数'));
      case 'atan2': return Math.atan2(this.toNumber(args[0], node.args[0], 'atan2 的参数'), this.toNumber(args[1], node.args[1], 'atan2 的参数'));
      case 'exp': return Math.exp(this.toNumber(args[0], node.args[0], 'exp 的参数'));
      case 'log': return Math.log(this.toNumber(args[0], node.args[0], 'log 的参数'));
      case 'log10': return Math.log10(this.toNumber(args[0], node.args[0], 'log10 的参数'));
      case 'log2': return Math.log2(this.toNumber(args[0], node.args[0], 'log2 的参数'));
      case 'cbrt': return Math.cbrt(this.toNumber(args[0], node.args[0], 'cbrt 的参数'));
      case 'trunc': return Math.trunc(this.toNumber(args[0], node.args[0], 'trunc 的参数'));
      case 'fmin': return Math.min(this.toNumber(args[0], node.args[0], 'fmin 的参数'), this.toNumber(args[1], node.args[1], 'fmin 的参数'));
      case 'fmax': return Math.max(this.toNumber(args[0], node.args[0], 'fmax 的参数'), this.toNumber(args[1], node.args[1], 'fmax 的参数'));
      case 'hypot': return Math.hypot(this.toNumber(args[0], node.args[0], 'hypot 的参数'), this.toNumber(args[1], node.args[1], 'hypot 的参数'));
      case 'isnan': return Number.isNaN(this.toNumber(args[0], node.args[0], 'isnan 的参数')) ? 1 : 0;
      case 'isinf': return !Number.isFinite(this.toNumber(args[0], node.args[0], 'isinf 的参数')) ? 1 : 0;
      case 'labs': return Math.abs(this.toInt(args[0], node.args[0], 'labs 的参数'));
      case 'atof': {
        var at = /^\s*([+\-]?(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:[eE][+\-]?[0-9]+)?)/.exec(this.toCString(args[0], node.args[0], 'atof 的参数'));
        return at ? parseFloat(at[1]) : 0;
      }
    }
    throw CError('第 ' + node.line + ' 行：还不支持函数 ' + name, node.line);
  };

  Interpreter.prototype.isCharClass = function (v, node, name) {
    var c = this.toInt(v, node && node.args ? node.args[0] : null, name + ' 的参数');
    return (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
  };

  // ---------- printf ----------

  Interpreter.prototype.formatArgs = function (node, fmtValue, values) {
    var fmt = this.toCString(fmtValue, node, '格式字符串');
    var out = '';
    var argi = 0;
    var used = 0;
    var i = 0;
    while (i < fmt.length) {
      var ch = fmt[i];
      if (ch !== '%') { out += ch; i++; continue; }
      i++;
      if (fmt[i] === '%') { out += '%'; i++; continue; }
      var flags = '';
      while (i < fmt.length && '-+0 #'.indexOf(fmt[i]) >= 0) { flags += fmt[i]; i++; }
      var widthText = '';
      while (i < fmt.length && /[0-9]/.test(fmt[i])) { widthText += fmt[i]; i++; }
      if (fmt[i] === '*') {
        throw CError('第 ' + node.line + ' 行：printf 的 %* 写法（宽度用参数决定）暂时不支持', node.line,
          '把宽度直接写进格式里就可以，例如 printf("%5d", n);。');
      }
      var prec = null;
      if (fmt[i] === '.') {
        i++;
        var ptext = '';
        while (i < fmt.length && /[0-9]/.test(fmt[i])) { ptext += fmt[i]; i++; }
        prec = ptext === '' ? 0 : parseInt(ptext, 10);
      }
      while (fmt[i] === 'l' || fmt[i] === 'L' || fmt[i] === 'h' || fmt[i] === 'z') i++;
      var conv = fmt[i];
      if (conv === undefined) {
        throw CError('第 ' + node.line + ' 行：printf 的格式字符串里最后一个 % 后面没有类型字母', node.line,
          '常用的是 %d（整数）、%f（小数）、%c（字符）、%s（字符串）、%%（百分号本身）。');
      }
      i++;
      if (argi >= values.length) {
        throw CError('第 ' + node.line + ' 行：格式里有 %' + conv + '，但后面没有给出对应的值', node.line,
          '格式字符串里有几个 %，后面就要跟几个值：printf("%d 和 %d", a, b);。');
      }
      var v = values[argi++];
      used++;
      out += this.formatOne(conv, v, flags, widthText ? parseInt(widthText, 10) : 0, prec, node);
    }
    if (values.length > used) {
      this.warn('格式字符串里只有 ' + used + ' 个 %，但后面给了 ' + values.length + ' 个值',
        '多出来的值不会被打印出来。检查一下是不是漏写了 %d / %s 之类的格式符。');
    }
    return out;
  };

  Interpreter.prototype.doPrintf = function (node, args) {
    if (typeof args[0] === 'number' || (args[0] && args[0].isPtr === false && !args[0].isArray && typeof args[0] !== 'object')) {
      throw CError('第 ' + node.line + ' 行：printf 的第一个参数应该是「格式字符串」', node.line,
        '要写成 printf("格式", 值); 例如 printf("我今年 %d 岁\\n", age); 只打印数字也要写成 printf("%d\\n", age);。');
    }
    var out = this.formatArgs(node, args[0], args.slice(1));
    this.print(out);
    return out.length;
  };

  Interpreter.prototype.doSprintf = function (node, args) {
    if (typeof args[1] === 'number') {
      throw CError('第 ' + node.line + ' 行：sprintf 的第二个参数应该是「格式字符串」', node.line,
        '要写成 sprintf(目标数组, "格式", 值); 例如 sprintf(buf, "%d", 42);。');
    }
    var out = this.formatArgs(node, args[1], args.slice(2));
    var view = this.writableString(args[0], node, 'sprintf');
    this.writeString(view, out, node, 'sprintf');
    return out.length;
  };

  Interpreter.prototype.argInt = function (v, node, conv) {
    if (v && (v.isPtr || v.isArray)) {
      throw CError('第 ' + node.line + ' 行：%' + conv + ' 需要整数，但给的是' + (v.isArray ? '数组（字符串）' : '指针'), node.line,
        '想打印指针指向的值要用 *p；想打印字符串要用 %s。');
    }
    if (typeof v === 'string') {
      throw CError('第 ' + node.line + ' 行：%' + conv + ' 需要整数，但给的是字符串', node.line, '字符串要用 %s 打印。');
    }
    return Math.trunc(this.toNumber(v, node, 'printf 的参数'));
  };

  Interpreter.prototype.formatOne = function (conv, v, flags, width, prec, node) {
    if (conv === 'd' || conv === 'i' || conv === 'u') {
      var n = this.argInt(v, node, conv);
      if (conv === 'u' && n < 0) n = n >>> 0;
      var digits = String(Math.abs(n));
      if (prec !== null) {
        while (digits.length < prec) digits = '0' + digits;
        if (prec === 0 && n === 0) digits = '';
        flags = flags.replace('0', '');
      }
      var sign = n < 0 ? '-' : (flags.indexOf('+') >= 0 ? '+' : (flags.indexOf(' ') >= 0 ? ' ' : ''));
      return padOut(sign + digits, width, flags);
    }
    if (conv === 'f' || conv === 'F') {
      var f = this.toNumber(v, node, 'printf 的参数');
      if (Number.isNaN(f)) return padOut('nan', width, flags);
      if (!Number.isFinite(f)) return padOut(f < 0 ? '-inf' : 'inf', width, flags);
      var ps = prec === null ? 6 : prec;
      var fs = f.toFixed(ps);
      if (/^-/.test(fs)) return padOut(fs, width, flags.replace('0', '0'));
      if (flags.indexOf('+') >= 0) fs = '+' + fs;
      else if (flags.indexOf(' ') >= 0) fs = ' ' + fs;
      return padOut(fs, width, flags);
    }
    if (conv === 'e' || conv === 'E' || conv === 'g' || conv === 'G') {
      var ev = this.toNumber(v, node, 'printf 的参数');
      var es = ev.toExponential(prec === null ? 6 : prec);
      if (conv === 'E' || conv === 'G') es = es.toUpperCase();
      if (flags.indexOf('+') >= 0 && ev >= 0) es = '+' + es;
      return padOut(es, width, flags);
    }
    if (conv === 'c') {
      var code = this.argInt(v, node, 'c');
      var s = String.fromCharCode(((code % 65536) + 65536) % 65536);
      return padOut(s, width, flags.replace('0', ''));
    }
    if (conv === 's') {
      var str = this.toCString(v, node, 'printf 的 %s');
      if (prec !== null) str = str.slice(0, prec);
      return padOut(str, width, flags.replace('0', ''));
    }
    if (conv === 'x' || conv === 'X' || conv === 'o') {
      var xn = this.argInt(v, node, conv);
      var radix = conv === 'o' ? 8 : 16;
      var xs = (xn >>> 0).toString(radix);
      if (conv === 'X') xs = xs.toUpperCase();
      return padOut(xs, width, flags);
    }
    throw CError('第 ' + node.line + ' 行：printf 还不支持 %' + conv + ' 这种格式', node.line,
      '常用的是 %d、%f、%c、%s、%x，%% 表示打印一个百分号。');
  };

  function padOut(s, width, flags) {
    if (!width || s.length >= width) return s;
    var count = width - s.length;
    if (flags.indexOf('-') >= 0) return s + repeatStr(' ', count);
    if (flags.indexOf('0') >= 0 && /^[+\- 0-9a-fA-FxX.]/.test(s)) {
      var sign = '';
      var rest = s;
      if (s[0] === '-' || s[0] === '+' || s[0] === ' ') { sign = s[0]; rest = s.slice(1); }
      return sign + repeatStr('0', count) + rest;
    }
    return repeatStr(' ', count) + s;
  }

  // ---------- scanf ----------

  Interpreter.prototype.scanfAddrHint = function () {
    return 'scanf 要把读到的内容存进变量，所以要写变量的「地址」——在变量名前面加 &：\n'
      + 'int age;\nscanf("%d", &age);   ← 注意这个 &';
  };

  Interpreter.prototype.doScanf = function (node, args) {
    if (typeof args[0] === 'number') {
      throw CError('第 ' + node.line + ' 行：scanf 的第一个参数应该是格式字符串', node.line,
        '写法：int a; scanf("%d", &a);。');
    }
    var fmt = this.toCString(args[0], node.args[0], 'scanf 的格式字符串');
    var count = 0;
    var argi = 1;
    var i = 0;
    while (i < fmt.length) {
      var ch = fmt[i];
      if (/\s/.test(ch)) { this.skipInputSpace(); i++; continue; }
      if (ch !== '%') {
        if (this.inputPos < this.stdin.length && this.stdin[this.inputPos] === ch) { this.inputPos++; i++; continue; }
        break;
      }
      i++;
      if (fmt[i] === '%') { this.skipInputSpace(); i++; continue; }
      while (i < fmt.length && 'lhLz'.indexOf(fmt[i]) >= 0) i++;
      var conv = fmt[i];
      i++;
      if (argi >= args.length) {
        throw CError('第 ' + node.line + ' 行：scanf 的格式里有 %' + conv + '，但没有给出接收它的变量地址', node.line,
          this.scanfAddrHint());
      }
      var target = args[argi++];
      this.scanOne(conv, target, node);
      count++;
    }
    return count;
  };

  Interpreter.prototype.skipInputSpace = function () {
    while (this.inputPos < this.stdin.length && /\s/.test(this.stdin[this.inputPos])) this.inputPos++;
  };

  Interpreter.prototype.inputExhausted = function (line, what, conv) {
    return CError('第 ' + line + ' 行：程序想读入' + what + '，但输入区已经没有内容了', line,
      '这道题的输入需要你自己在「程序输入」框里填好再运行。需要的格式是 ' + what + '（对应 %' + conv + '）。');
  };

  Interpreter.prototype.scanOne = function (conv, target, node) {
    var line = node.line;
    if (target && target.isArray) target = this.decay(target);
    if (!(target && target.isPtr)) {
      throw CError('第 ' + line + ' 行：scanf 需要变量的「地址」，不是变量的值', line, this.scanfAddrHint());
    }
    if (!target.cells) {
      throw CError('第 ' + line + ' 行：scanf 拿到的指针是空的（NULL）', line, this.scanfAddrHint());
    }
    if (target.index < 0 || target.index >= target.cells.length) {
      throw CError('第 ' + line + ' 行：scanf 要写入的位置超出了数组范围', line, '检查一下下标有没有越界。');
    }
    var cell = target.cells[target.index];
    if (conv === 'd' || conv === 'i' || conv === 'u') {
      this.skipInputSpace();
      var rest = this.stdin.slice(this.inputPos);
      var m = /^[+\-]?[0-9]+/.exec(rest);
      if (!m) {
        if (!rest.length) throw this.inputExhausted(line, '一个整数', conv);
        throw CError('第 ' + line + ' 行：想读一个整数，但输入里是「' + rest.slice(0, 12) + '…」', line,
          '输入的内容要和格式匹配，例如格式是 %d 就要输入 123 这样的整数。');
      }
      this.inputPos += m[0].length;
      cell.value = this.coerce(parseInt(m[0], 10), cell.type, node, 'scanf 读到的整数');
      return;
    }
    if (conv === 'f' || conv === 'e' || conv === 'g' || conv === 'a') {
      this.skipInputSpace();
      var rest2 = this.stdin.slice(this.inputPos);
      var mf = /^[+\-]?([0-9]+\.?[0-9]*|\.[0-9]+)([eE][+\-]?[0-9]+)?/.exec(rest2);
      if (!mf) {
        if (!rest2.length) throw this.inputExhausted(line, '一个小数', conv);
        throw CError('第 ' + line + ' 行：想读一个小数，但输入里是「' + rest2.slice(0, 12) + '…」', line,
          '格式是 %f 时要输入 3.14 这样的数。');
      }
      this.inputPos += mf[0].length;
      cell.value = this.coerce(parseFloat(mf[0]), cell.type, node, 'scanf 读到的小数');
      return;
    }
    if (conv === 'c') {
      if (this.inputPos >= this.stdin.length) throw this.inputExhausted(line, '一个字符', conv);
      var code = this.stdin.charCodeAt(this.inputPos);
      this.inputPos++;
      cell.value = this.coerce(code, cell.type, node, 'scanf 读到的字符');
      return;
    }
    if (conv === 's') {
      this.skipInputSpace();
      var rest3 = this.stdin.slice(this.inputPos);
      var ms = /^\S+/.exec(rest3);
      if (!ms) throw this.inputExhausted(line, '一个字符串', conv);
      this.inputPos += ms[0].length;
      this.writeStringToTarget(target, ms[0], node, 'scanf');
      return;
    }
    if (conv === 'x') {
      this.skipInputSpace();
      var rest4 = this.stdin.slice(this.inputPos);
      var mx = /^[+\-]?(0[xX])?[0-9a-fA-F]+/.exec(rest4);
      if (!mx) throw this.inputExhausted(line, '一个十六进制整数', conv);
      this.inputPos += mx[0].length;
      cell.value = this.coerce(parseInt(mx[0].replace(/^0[xX]/, ''), 16), cell.type, node, 'scanf 读到的整数');
      return;
    }
    throw CError('第 ' + line + ' 行：scanf 还不支持 %' + conv + ' 这种格式', line,
      '常用的有 %d（整数）、%f（小数）、%c（字符）、%s（字符串）。');
  };

  Interpreter.prototype.writableString = function (v, node, fname) {
    var line = node.line;
    if (v === null || v === undefined) {
      throw CError('第 ' + line + ' 行：' + fname + ' 的目标是空指针（NULL）', line, '先让指针指向一个真正的 char 数组，再使用它。');
    }
    if (v && v.isArray) {
      if (v.literal) {
        throw CError('第 ' + line + ' 行：不能往字符串常量里写内容', line,
          '"…" 这种直接写出来的字符串是只读的。要修改内容，请先开一个数组：char s[20] = "hi";。');
      }
      if (!(v.type && v.type.of && v.type.of.k === 'char')) {
        throw CError('第 ' + line + ' 行：' + fname + ' 需要一个 char 数组', line, '例如 char s[20];。');
      }
      return { cells: v.cells, start: 0 };
    }
    if (v && v.isPtr) {
      if (!v.cells) {
        throw CError('第 ' + line + ' 行：' + fname + ' 的指针是空的（NULL）', line);
      }
      return { cells: v.cells, start: v.index };
    }
    throw CError('第 ' + line + ' 行：' + fname + ' 需要一个 char 数组或指向 char 的指针', line,
      '例如 char s[20]; strcpy(s, "你好");。');
  };

  Interpreter.prototype.writeString = function (view, text, node, fname) {
    var need = text.length + 1;
    var room = view.cells.length - view.start;
    if (need > room) {
      throw CError('第 ' + node.line + ' 行：' + fname + ' 要写的字符串太长了，装不下', node.line,
        '目标最多还能放 ' + (room - 1) + ' 个字符，而 "…' + text.slice(-6) + '" 需要 ' + text.length + ' 个。把数组开大一点吧，例如 char s[' + (text.length + 1) + '];。');
    }
    for (var i = 0; i < need; i++) {
      view.cells[view.start + i].value = i < text.length ? text.charCodeAt(i) : 0;
    }
  };

  Interpreter.prototype.writeStringToTarget = function (target, text, node, fname) {
    var view = this.writableString(target, node, fname);
    this.writeString(view, text, node, fname);
  };

  // ============================================================
  // 10. 对外接口
  // ============================================================

  function run(source, options) {
    var opts = options || {};
    var result = {
      ok: false,
      output: '',
      warnings: [],
      error: null,
      steps: 0,
      lines: String(source == null ? '' : source).split('\n').length
    };
    var it = null;
    try {
      var program = parseSource(source);
      it = new Interpreter(program, opts);
      var r = it.run();
      result.ok = true;
      result.output = r.output;
      result.warnings = r.warnings;
      result.steps = it.steps;
    } catch (e) {
      result.output = it ? it.buf.join('') : '';
      result.warnings = it ? it.warnings : [];
      result.steps = it ? it.steps : 0;
      if (e && e.isCError) {
        result.error = { message: e.message, line: e.line, hint: e.hint, internal: false };
      } else {
        result.error = {
          message: '解释器内部出错了（这是我这个小解释器的 bug，不是你代码的问题）',
          line: 0,
          hint: String((e && e.message) || e),
          internal: true
        };
      }
    }
    return result;
  }

  CC.Interpreter = Interpreter;
  CC.run = run;
  CC.parse = parseSource;
  CC.version = VERSION;
  CC.CError = CError;
  CC.typeName = typeName;
  CC.builtinNames = function () { return Object.keys(BUILTIN_INFO); };
  CC.builtinSignature = function (name) { return BUILTIN_INFO[name] ? BUILTIN_INFO[name].sig : ''; };
  CC.repeatStr = repeatStr;
  CC.nearestName = nearestName;

  if (typeof module !== 'undefined' && module.exports) module.exports = CC;
})(typeof globalThis !== 'undefined' ? globalThis : this);