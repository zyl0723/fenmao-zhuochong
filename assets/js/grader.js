/*!
 * 粉猫捉虫 · 判题器
 * 把学习者的代码跑起来，检查输出、结构要求，并给出人话反馈。
 *
 * 判题原则：
 *   · 输出按「行」严格比较：行数、顺序、每一行的内容都要对。
 *   · 只容忍两件事：每行行尾多余的空格 / 制表符；最后一个换行符（printf 最后一行带 \n 是正常的）。
 *   · 开头空行、行与行之间的空行、结尾多出来的空行，都会被判错，并明确告诉学习者哪一行多了空行。
 *
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});

  function stripComments(code) {
    return String(code == null ? '' : code)
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\/\/[^\n]*/g, ' ');
  }

  // 只用于 expectContains / expectRegex 的文字规整（这两个本来就是「包含即通过」）
  function normalize(text) {
    return String(text == null ? '' : text)
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map(function (l) { return l.replace(/[ \t]+$/, ''); })
      .join('\n')
      .replace(/^\n+/, '')
      .replace(/\n+$/, '');
  }

  // 严格分行：
  //  · 统一换行符
  //  · 去掉每行行尾的空格 / 制表符（看不见，不影响结果）
  //  · 只允许最后有一个换行符（"abc\n" → ["abc"]）
  //  · "abc\n\n" 会留下一个空行 → 判错（这正是新手最容易犯的错）
  function splitLines(text) {
    var raw = String(text == null ? '' : text).replace(/\r\n?/g, '\n');
    var arr = raw.split('\n').map(function (l) { return l.replace(/[ \t]+$/, ''); });
    if (arr.length && arr[arr.length - 1] === '') arr.pop();
    return arr;
  }

  function sameLines(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  function emptyCount(arr) {
    var n = 0;
    for (var i = 0; i < arr.length; i++) if (arr[i] === '') n++;
    return n;
  }

  // 只比较「非空行」，用来判断是不是「内容都对、只是空行多了/少了」
  function sameNonEmpty(a, b) {
    var fa = a.filter(function (x) { return x !== ''; });
    var fb = b.filter(function (x) { return x !== ''; });
    return sameLines(fa, fb);
  }

  function lineLabel(line, max) {
    if (line === undefined) return '（没有这一行）';
    if (line === '') return '（空行）';
    var s = line.replace(/\t/g, '→');
    var limit = max || 46;
    if (s.length > limit) s = s.slice(0, limit) + '…';
    return '「' + s + '」';
  }

  // 把「期望 / 实际」做成一份看得懂的对比
  function buildOutputFeedback(expLines, actLines) {
    var firstDiff = -1;
    var max = Math.max(expLines.length, actLines.length);
    for (var i = 0; i < max; i++) {
      if (expLines[i] === undefined || actLines[i] === undefined || expLines[i] !== actLines[i]) { firstDiff = i; break; }
    }
    var extraBlank = emptyCount(actLines) - emptyCount(expLines);
    var hint = '';
    if (sameNonEmpty(expLines, actLines) && extraBlank > 0) {
      hint = '喵？内容都对，但多了 ' + extraBlank + ' 个空行。一个 \\n 只换一行：写成 "第一行\\n\\n第二行" 会多出一行空白，写成 "第一行\\n第二行" 才对哦。';
    } else if (sameNonEmpty(expLines, actLines) && extraBlank < 0) {
      hint = '内容都对，但少了 ' + (-extraBlank) + ' 个空行——题目要求的那几行空白也要打印出来。';
    } else if (actLines.length < expLines.length) {
      hint = '输出行数少了：题目要 ' + expLines.length + ' 行，你打印了 ' + actLines.length + ' 行。检查一下是不是漏了某个 printf，或者某一行忘了写 \\n。';
    } else if (actLines.length > expLines.length) {
      hint = '输出行数多了：题目要 ' + expLines.length + ' 行，你打印了 ' + actLines.length + ' 行。检查一下 \\n 是不是写多了。';
    } else if (firstDiff >= 0) {
      hint = '第 ' + (firstDiff + 1) + ' 行开始不一样：题目要 ' + lineLabel(expLines[firstDiff]) + '，你打印的是 ' + lineLabel(actLines[firstDiff]) + '。';
    }
    var lines = [];
    var limit = 10;
    lines.push('题目要的输出（' + expLines.length + ' 行）：');
    for (var e = 0; e < expLines.length && e < limit; e++) {
      lines.push('  ' + (e + 1) + '│ ' + lineLabel(expLines[e]));
    }
    if (expLines.length > limit) lines.push('  …（还有 ' + (expLines.length - limit) + ' 行）');
    lines.push('');
    lines.push('你的输出（' + actLines.length + ' 行）：');
    for (var a = 0; a < actLines.length && a < limit; a++) {
      var mark = '';
      if (a === firstDiff) mark = '   ← 从这里开始不一样';
      else if (actLines[a] === '' && expLines[a] !== '') mark = '   ← 多出来的空行';
      lines.push('  ' + (a + 1) + '│ ' + lineLabel(actLines[a]) + mark);
    }
    if (actLines.length > limit) lines.push('  …（还有 ' + (actLines.length - limit) + ' 行）');
    if (actLines.length === 0) lines.push('  （什么都没有打印）');
    return { hint: hint, text: lines.join('\n'), firstDiff: firstDiff, extraBlank: extraBlank };
  }

  function checkRules(task, code) {
    var clean = stripComments(code);
    var raw = String(code == null ? '' : code);
    var must = task.mustInclude || [];
    for (var i = 0; i < must.length; i++) {
      var r = must[i];
      if (!r || !r.re) continue;
      if (!r.re.test(r.keepComments ? raw : clean)) {
        return {
          ok: false,
          message: '再检查一下：这道题要求用到' + (r.label || r.re) + '，但在你的代码里没找到。' + (r.hint ? '\n' + r.hint : '')
        };
      }
    }
    var forbid = task.mustNotInclude || [];
    for (var j = 0; j < forbid.length; j++) {
      var f = forbid[j];
      if (!f || !f.re) continue;
      if (f.re.test(f.keepComments ? raw : clean)) {
        return {
          ok: false,
          message: '利用一下学到的东西吧：代码里不应该出现' + (f.label || f.re) + '。' + (f.hint ? '\n' + f.hint : '')
        };
      }
    }
    return { ok: true };
  }

  function matchExpect(test, output) {
    var actual = normalize(output);
    if (test.expect !== undefined) {
      var expects = Array.isArray(test.expect) ? test.expect : [test.expect];
      var actLines = splitLines(output);
      var first = null;
      for (var i = 0; i < expects.length; i++) {
        var expLines = splitLines(expects[i]);
        if (!first) first = { expect: expects[i], expLines: expLines };
        if (sameLines(expLines, actLines)) return { ok: true };
      }
      var fb = buildOutputFeedback(first.expLines, actLines);
      return {
        ok: false,
        reason: 'output',
        expected: first.expect,
        actual: actual,
        hint: fb.hint,
        detail: fb.text
      };
    }
    if (test.expectContains) {
      var list = Array.isArray(test.expectContains) ? test.expectContains : [test.expectContains];
      for (var k = 0; k < list.length; k++) {
        if (actual.indexOf(list[k]) < 0) return { ok: false, reason: 'contains', expected: list[k], actual: actual };
      }
      return { ok: true };
    }
    if (test.expectRegex) {
      var re = test.expectRegex instanceof RegExp ? test.expectRegex : new RegExp(test.expectRegex);
      if (!re.test(actual)) return { ok: false, reason: 'regex', expected: String(re), actual: actual };
      return { ok: true };
    }
    if (test.runs) {
      return { ok: true };
    }
    return { ok: true };
  }

  function testName(t, i) {
    if (t.name) return t.name;
    if (t.stdin) return '输入「' + String(t.stdin).replace(/\n/g, '⏎') + '」';
    return '测试 ' + (i + 1);
  }

  function gradeTask(task, code, options) {
    options = options || {};
    var result = {
      pass: false,
      reason: '',
      message: '',
      results: [],
      warnings: [],
      error: null,
      output: ''
    };

    if (!String(code || '').trim()) {
      result.reason = 'empty';
      result.message = '代码区还是空的哦～先写点什么，再点「试一试」或「交给捉虫看看」。';
      return result;
    }

    var rules = checkRules(task, code);
    if (!rules.ok) {
      result.reason = 'rule';
      result.message = rules.message;
      return result;
    }

    var tests = (task.tests && task.tests.length) ? task.tests : [{ runs: true, name: '能正常运行' }];
    for (var i = 0; i < tests.length; i++) {
      var t = tests[i];
      var run = CC.run(code, {
        stdin: t.stdin || '',
        maxSteps: options.maxSteps || 2000000,
        timeLimitMs: options.timeLimitMs || 4000,
        fixedTime: 1735689600
      });
      result.warnings = result.warnings.concat(run.warnings || []);
      var name = testName(t, i);

      if (t.expectErrorContains) {
        var blob = run.ok ? '' : (run.error.message + ' ' + (run.error.hint || ''));
        var hit = !run.ok && blob.indexOf(t.expectErrorContains) >= 0;
        result.results.push({ name: name, ok: hit, reason: hit ? '' : 'error-text', expected: t.expectErrorContains, actual: run.ok ? '（程序正常运行了）' : run.error.message });
        continue;
      }

      if (!run.ok) {
        result.results.push({ name: name, ok: false, reason: 'crash', error: run.error, actual: run.output });
        if (!result.error) result.error = run.error;
        if (run.output && !result.output) result.output = run.output;
        continue;
      }

      result.output = result.output || run.output;
      var m = matchExpect(t, run.output);
      result.results.push({
        name: name,
        ok: m.ok,
        reason: m.reason || '',
        expected: m.expected,
        actual: m.actual === undefined ? normalize(run.output) : m.actual,
        hint: m.hint || '',
        detail: m.detail || '',
        stdout: run.output
      });
    }

    var allOk = result.results.length > 0 && result.results.every(function (r) { return r.ok; });
    result.pass = allOk;
    if (allOk) {
      result.reason = 'ok';
      result.message = '全部通过！';
      return result;
    }

    var firstCrash = null;
    for (var c = 0; c < result.results.length; c++) {
      if (result.results[c].reason === 'crash') { firstCrash = result.results[c]; break; }
    }
    if (firstCrash) {
      result.reason = 'crash';
      result.message = firstCrash.error.message + (firstCrash.error.hint ? '\n' + firstCrash.error.hint : '');
      return result;
    }
    for (var d = 0; d < result.results.length; d++) {
      var r2 = result.results[d];
      if (r2.ok) continue;
      result.reason = r2.reason || 'output';
      if (r2.reason === 'error-text') {
        result.message = '这个任务希望你「故意」制造一个报错，并且报错信息里要出现「' + r2.expected + '」。\n现在的报错是：' + r2.actual;
      } else if (r2.reason === 'contains') {
        result.message = '输出里缺少了「' + r2.expected + '」。\n你的输出：' + JSON.stringify(r2.actual);
      } else if (r2.reason === 'regex') {
        result.message = '输出和要求的格式不太一样。\n你的输出：' + JSON.stringify(r2.actual);
      } else {
        result.message = (r2.hint || '输出和期望的不一样。') + (r2.detail ? '\n\n' + r2.detail : '');
      }
      break;
    }
    if (!result.message) result.message = '还有一点小问题，再试一次吧！';
    return result;
  }

  CC.Grade = {
    stripComments: stripComments,
    normalize: normalize,
    splitLines: splitLines,
    sameLines: sameLines,
    buildOutputFeedback: buildOutputFeedback,
    checkRules: checkRules,
    gradeTask: gradeTask,
    runCode: function (code, stdin) {
      return CC.run(code, { stdin: stdin || '', maxSteps: 2000000, timeLimitMs: 4000, fixedTime: 1735689600 });
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);