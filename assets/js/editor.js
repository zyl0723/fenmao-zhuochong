/*!
 * 粉猫捉虫 · 代码编辑器（带行号、语法高亮、自动缩进）
 * 说明：用一个 <pre> 作为高亮层，一个透明文字的 <textarea> 作为输入层，两层完全对齐。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});

  var KEYWORDS = ['int', 'long', 'short', 'char', 'float', 'double', 'void', 'unsigned', 'signed',
    'const', 'static', 'if', 'else', 'while', 'for', 'do', 'return', 'break', 'continue',
    'switch', 'case', 'default', 'sizeof', 'struct', 'typedef', 'include'];

  var TOKEN_RE = new RegExp(
    '(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)' +      // 注释
    '|("(?:\\\\.|[^"\\\\\\n])*")' +                  // 字符串
    "|('(?:\\\\.|[^'\\\\\\n])*')" +                  // 字符
    '|(#\\s*[A-Za-z_]+)' +                           // 预处理指令
    '|(\\b(?:0[xX][0-9a-fA-F]+|\\d+(?:\\.\\d+)?(?:[eE][+\\-]?\\d+)?)[fFlLuU]*\\b)' + // 数字
    '|(\\b[A-Za-z_]\\w*\\b)' +                       // 标识符
    '|(\\+\\+|--|\\+=|\\-=|\\*=|/=|==|!=|<=|>=|&&|\\|\\||<<|>>)', // 运算符（不高亮，只为打断词）
    'g'
  );

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlight(code) {
    var out = '';
    var last = 0;
    var m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(code)) !== null) {
      if (m.index > last) out += esc(code.slice(last, m.index));
      var text = m[0];
      var cls = null;
      if (m[1]) cls = 'tok-cmt';
      else if (m[2]) cls = 'tok-str';
      else if (m[3]) cls = 'tok-chr';
      else if (m[4]) cls = 'tok-pre';
      else if (m[5]) cls = 'tok-num';
      else if (m[6]) {
        if (KEYWORDS.indexOf(text) >= 0) cls = 'tok-kw';
        else if (code[TOKEN_RE.lastIndex] === '(') cls = 'tok-fn';
      }
      out += cls ? '<span class="' + cls + '">' + esc(text) + '</span>' : esc(text);
      last = TOKEN_RE.lastIndex;
    }
    out += esc(code.slice(last));
    return out;
  }

  function CodeEditor(container, options) {
    options = options || {};
    var self = this;
    this.container = container;
    this.onRun = options.onRun || null;
    this.onChange = options.onChange || null;
    this.fileName = options.fileName || 'main.c';
    this.minHeight = options.minHeight || 190;

    var wrap = document.createElement('div');
    wrap.className = 'editor-wrap';

    var bar = document.createElement('div');
    bar.className = 'editor-bar';
    var dots = document.createElement('div');
    dots.className = 'dots-ui';
    for (var d = 0; d < 3; d++) dots.appendChild(document.createElement('i'));
    bar.appendChild(dots);
    var file = document.createElement('span');
    file.className = 'file';
    file.textContent = this.fileName;
    bar.appendChild(file);
    var hint = document.createElement('span');
    hint.className = 'hint';
    hint.textContent = 'Ctrl + Enter 运行';
    bar.appendChild(hint);
    wrap.appendChild(bar);

    var body = document.createElement('div');
    body.className = 'editor-body';

    this.gutter = document.createElement('div');
    this.gutter.className = 'editor-gutter';

    var stack = document.createElement('div');
    stack.className = 'editor-stack';

    this.layer = document.createElement('pre');
    this.layer.className = 'editor-layer';

    this.textarea = document.createElement('textarea');
    this.textarea.className = 'editor-input';
    this.textarea.spellcheck = false;
    this.textarea.setAttribute('wrap', 'off');
    this.textarea.setAttribute('autocomplete', 'off');
    this.textarea.setAttribute('autocapitalize', 'off');
    this.textarea.style.minHeight = this.minHeight + 'px';

    stack.appendChild(this.layer);
    stack.appendChild(this.textarea);
    body.appendChild(this.gutter);
    body.appendChild(stack);
    wrap.appendChild(body);
    container.appendChild(wrap);

    this.textarea.addEventListener('input', function () { self.sync(); });
    this.textarea.addEventListener('scroll', function () { self.syncScroll(); });
    this.textarea.addEventListener('keydown', function (e) { self.onKeyDown(e); });
    this.textarea.addEventListener('keyup', function () { self.syncScroll(); });
    this.textarea.addEventListener('click', function () { self.syncScroll(); });

    this.setValue(options.value || '');
  }

  CodeEditor.prototype.getValue = function () {
    return this.textarea.value;
  };

  CodeEditor.prototype.setValue = function (text) {
    this.textarea.value = String(text == null ? '' : text);
    this.sync();
  };

  CodeEditor.prototype.focus = function () {
    this.textarea.focus();
  };

  CodeEditor.prototype.syncScroll = function () {
    this.gutter.scrollTop = this.textarea.scrollTop;
    this.layer.scrollTop = this.textarea.scrollTop;
    this.layer.scrollLeft = this.textarea.scrollLeft;
  };

  CodeEditor.prototype.sync = function () {
    var code = this.textarea.value;
    this.layer.innerHTML = highlight(code) + '\n';
    var lines = code.split('\n').length;
    var nums = '';
    for (var i = 1; i <= lines; i++) nums += i + '\n';
    this.gutter.textContent = nums;
    this.syncScroll();
    if (this.onChange) this.onChange(code);
  };

  CodeEditor.prototype.insert = function (text) {
    var ta = this.textarea;
    var s = ta.selectionStart, e = ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
    ta.selectionStart = ta.selectionEnd = s + text.length;
    this.sync();
  };

  CodeEditor.prototype.onKeyDown = function (e) {
    var ta = this.textarea;
    var self = this;

    // Ctrl / Cmd + Enter：直接运行
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (self.onRun) self.onRun();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      var s = ta.selectionStart, en = ta.selectionEnd;
      if (s !== en && ta.value.slice(s, en).indexOf('\n') >= 0) {
        // 多行：整段缩进 / 反缩进
        var startLine = ta.value.lastIndexOf('\n', s - 1) + 1;
        var block = ta.value.slice(startLine, en);
        var newBlock = e.shiftKey
          ? block.replace(/^ {1,4}/gm, '')
          : block.replace(/^/gm, '    ');
        ta.value = ta.value.slice(0, startLine) + newBlock + ta.value.slice(en);
        ta.selectionStart = startLine;
        ta.selectionEnd = startLine + newBlock.length;
      } else if (e.shiftKey) {
        var l2 = ta.value.lastIndexOf('\n', s - 1) + 1;
        var head = ta.value.slice(l2, s);
        var cut = head.match(/ {1,4}$/);
        if (cut) {
          ta.value = ta.value.slice(0, s - cut[0].length) + ta.value.slice(s);
          ta.selectionStart = ta.selectionEnd = s - cut[0].length;
        }
      } else {
        var s2 = ta.selectionStart;
        ta.value = ta.value.slice(0, s2) + '    ' + ta.value.slice(ta.selectionEnd);
        ta.selectionStart = ta.selectionEnd = s2 + 4;
      }
      this.sync();
      return;
    }

    if (e.key === 'Enter') {
      var st = ta.selectionStart, ed = ta.selectionEnd;
      var lineStart = ta.value.lastIndexOf('\n', st - 1) + 1;
      var curLine = ta.value.slice(lineStart, st);
      var indent = (curLine.match(/^[ \t]*/) || [''])[0];
      var before = ta.value.slice(0, st);
      var after = ta.value.slice(ed);
      var opensBlock = /\{\s*$/.test(curLine);
      if (opensBlock && after.charAt(0) !== '}') {
        e.preventDefault();
        var ins = '\n' + indent + '    ' + '\n' + indent;
        ta.value = before + ins + after;
        ta.selectionStart = ta.selectionEnd = st + 1 + indent.length + 4;
        this.sync();
        return;
      }
      if (curLine.trim() === '' || indent) {
        e.preventDefault();
        var ins2 = '\n' + indent + (opensBlock ? '    ' : '');
        ta.value = before + ins2 + after;
        ta.selectionStart = ta.selectionEnd = st + ins2.length;
        this.sync();
        return;
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      var s3 = ta.selectionStart;
      var l3 = ta.value.lastIndexOf('\n', s3 - 1) + 1;
      var has = ta.value.slice(l3, l3 + 2) === '//';
      ta.value = ta.value.slice(0, l3) + (has ? '' : '//') + ta.value.slice(l3 + (has ? 2 : 0));
      ta.selectionStart = ta.selectionEnd = s3 + (has ? -2 : 2);
      this.sync();
      return;
    }
  };

  CC.CodeEditor = CodeEditor;
  CC.highlightC = highlight;
})(typeof globalThis !== 'undefined' ? globalThis : this);