/*!
 * 粉猫捉虫 · 判题器
 * 把学习者的代码跑起来，检查输出、结构要求，并给出人话反馈。
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

  function normalize(text) {
    return String(text == null ? '' : text)
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map(function (l) { return l.replace(/[ \t]+$/, ''); })
      .join('\n')
      .replace(/^\n+/, '')
      .replace(/\n+$/, '');
  }

  function checkRules(task, code) {
    var clean = stripComments(code);
    var raw = String(code == null ? "" : code);
    var must = task.mustInclude || [];
    for (var i = 0; i < must.length; i++) {
      var r = must[i];
      if (!r || !r.re) continue;
      // 有些要求是「必须写注释」，那就要在带注释的原文里找
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
      for (var i = 0; i < expects.length; i++) {
        if (normalize(expects[i]) === actual) return { ok: true };
      }
      return { ok: false, reason: 'output', expected: expects[0], actual: actual };
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
      // 只要求“能正常运行”，这时只要不报错就通过
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
      result.message = '代码区还是空的哦～先写点什么，再点「运行」或「提交」。';
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

    // 给出人话反馈
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
      } else {
        result.message = '输出和期望的不一样。\n期望：' + JSON.stringify(r2.expected) + '\n实际：' + JSON.stringify(r2.actual);
      }
      break;
    }
    if (!result.message) result.message = '还有一点小问题，再试一次吧！';
    return result;
  }

  CC.Grade = {
    stripComments: stripComments,
    normalize: normalize,
    checkRules: checkRules,
    gradeTask: gradeTask,
    runCode: function (code, stdin) {
      return CC.run(code, { stdin: stdin || '', maxSteps: 2000000, timeLimitMs: 4000, fixedTime: 1735689600 });
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);