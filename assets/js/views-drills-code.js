/*!
 * 粉猫捉虫 · 函数闯关：PTA 风格在线编程工作台
 * 在选择题模块上增加「在线编程」模式，包含编辑器、自定义输入、隐藏测试点与逐点判题。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var doc = root.document;
  var UI = CC.UI;
  var D = CC.DrillsView;
  if (!D || !UI) return;

  var origBuild = D.build;
  var origEnter = D.enter;
  var origRenderQuestion = D.renderQuestion;
  var origRenderStats = D.renderStats;
  var origStartQueue = D.startQueue;
  var origStartWrong = D.startWrong;
  var origAnswer = D.answer;

  function byId(id) {
    var all = CC.CODE_DRILLS || [];
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  function codeState() {
    var st = D.state();
    if (!st.code) st.code = { solved: {}, wrong: {}, attempts: 0 };
    if (!st.code.solved) st.code.solved = {};
    if (!st.code.wrong) st.code.wrong = {};
    if (!st.code.attempts) st.code.attempts = 0;
    return st.code;
  }

  function stars(n) {
    var s = '';
    for (var i = 0; i < n; i++) s += '★';
    return s;
  }

  D.mode = 'choice';
  D.codeQueue = [];
  D.codeIndex = 0;
  D.codeOnlyWrong = false;
  D.codeTrack = 'single';
  D.codeTarget = 'all';

  D.build = function () {
    if (this.built) return;
    origBuild.call(this);
    if (!this.qCard) return;
    var bar = this.qCard.parentNode && this.qCard.parentNode.querySelector('.drills-bar');
    if (!bar) return;
    var self = this;
    var tabs = UI.el('div', 'drills-mode-tabs');
    this.choiceTab = UI.el('button', 'drills-mode-tab on', '📝 选择题 ' + (CC.DRILLS || []).length);
    this.codeTab = UI.el('button', 'drills-mode-tab', '⌨️ 在线编程 ' + (CC.CODE_DRILLS || []).length);
    this.choiceTab.type = 'button';
    this.codeTab.type = 'button';
    this.choiceTab.addEventListener('click', function () { self.setMode('choice'); });
    this.codeTab.addEventListener('click', function () { self.setMode('code'); });
    tabs.appendChild(this.choiceTab);
    tabs.appendChild(this.codeTab);
    tabs.appendChild(UI.el('span', 'drills-mode-note', '编程题：写代码 → 跑样例 → 提交隐藏测试点'));
    bar.insertBefore(tabs, bar.children[1] || null);
    this.drillIntro = bar.querySelector('.tiny.muted');
    var route = UI.el('div', 'code-route-filter');
    var routeTitle = UI.el('div', 'code-route-title');
    routeTitle.appendChild(UI.el('strong', null, '训练路线'));
    routeTitle.appendChild(UI.el('span', 'tiny muted', '先单函数，再组合，最后综合'));
    route.appendChild(routeTitle);
    var routeBtns = UI.el('div', 'drills-chips');
    this.routeBtns = {};
    [['single','① 单函数专练'],['bridge','② 组合过渡'],['mixed','③ 综合挑战'],['all','全部']].forEach(function (p) {
      var b = UI.el('button', 'drills-chip small' + (self.codeTrack === p[0] ? ' on' : ''), p[1]);
      b.type = 'button';
      b.addEventListener('click', function () {
        self.codeTrack = p[0];
        self.codeTarget = 'all';
        self.startCodeQueue(false);
        self.syncCodeFilters();
        self.renderCodeQuestion();
        self.renderStats();
      });
      self.routeBtns[p[0]] = b;
      routeBtns.appendChild(b);
    });
    route.appendChild(routeBtns);
    var fnRow = UI.el('div', 'code-fn-filter');
    fnRow.appendChild(UI.el('label', null, '练哪个函数'));
    this.codeFnSelect = UI.el('select', 'code-fn-select');
    this.codeFnSelect.addEventListener('change', function () {
      self.codeTarget = self.codeFnSelect.value;
      self.startCodeQueue(false);
      self.renderCodeQuestion();
      self.renderStats();
    });
    fnRow.appendChild(this.codeFnSelect);
    route.appendChild(fnRow);
    route.classList.add('hidden');
    this.codeRoute = route;
    bar.insertBefore(route, this.drillIntro || null);
    this.updateCodeTargets();
  };

  D.setMode = function (mode) {
    if (mode !== 'choice' && mode !== 'code') mode = 'choice';
    this.mode = mode;
    if (this.choiceTab) this.choiceTab.classList.toggle('on', mode === 'choice');
    if (this.codeTab) this.codeTab.classList.toggle('on', mode === 'code');
    if (this.codeRoute) this.codeRoute.classList.toggle('hidden', mode !== 'code');
    if (this.drillIntro) {
      this.drillIntro.textContent = mode === 'code'
        ? 'PTA 风格工作台：写完整 C 程序，样例可自测，提交后会跑多组隐藏测试点。每道题都有提示和参考答案。'
        : '题海模式：一次一题，答完立刻解析。所有「输出题」都用真实 gcc 编译运行核对过答案。';
    }
    var randomBtn = doc.querySelector('.drills-mode .btn.primary');
    if (randomBtn) randomBtn.textContent = mode === 'code' ? '🎲 随机 5 道编程题' : '🎲 随机 10 题';
    if (mode === 'code') {
      if (!this.codeQueue.length) this.startCodeQueue(false);
      this.renderCodeQuestion();
    } else {
      if (!this.queue.length) this.startQueue(false);
      origRenderQuestion.call(this);
    }
    this.renderStats();
  };

  D.filteredCode = function () {
    var self = this;
    return (CC.CODE_DRILLS || []).filter(function (d) {
      if (self.codeTrack !== 'all' && d.stage !== self.codeTrack) return false;
      if (self.codeTarget !== 'all' && d.target !== self.codeTarget) return false;
      if (self.header !== 'all' && d.header !== self.header) return false;
      if (self.level && d.level !== self.level) return false;
      return true;
    });
  };

  D.updateCodeTargets = function () {
    if (!this.codeFnSelect) return;
    var all = CC.CODE_DRILLS || [];
    var solved = codeState().solved;
    var names = [];
    all.filter(function (d) { return d.stage === 'single'; }).forEach(function (d) { if (names.indexOf(d.target) < 0) names.push(d.target); });
    UI.clear(this.codeFnSelect);
    var allOpt = UI.el('option', null, '全部函数（' + all.filter(function (d) { return d.stage === 'single'; }).length + ' 题）');
    allOpt.value = 'all';
    this.codeFnSelect.appendChild(allOpt);
    names.forEach(function (fn) {
      var list = all.filter(function (d) { return d.stage === 'single' && d.target === fn; });
      var done = list.filter(function (d) { return solved[d.id]; }).length;
      var opt = UI.el('option', null, fn + ' (' + done + '/' + list.length + ')');
      opt.value = fn;
      this.codeFnSelect.appendChild(opt);
    }, this);
    this.codeFnSelect.value = this.codeTarget;
    this.codeFnSelect.disabled = this.codeTrack !== 'single';
  };

  D.syncCodeFilters = function () {
    if (this.routeBtns) for (var k in this.routeBtns) this.routeBtns[k].classList.toggle('on', k === this.codeTrack);
    this.updateCodeTargets();
  };

  D.startCodeQueue = function (random) {
    var list = this.filteredCode();
    this.codeQueue = random ? this.shuffle(list).slice(0, 5) : list;
    if (!this.codeQueue.length) this.codeQueue = list;
    this.codeIndex = 0;
    this.codeOnlyWrong = false;
    this.syncChips();
    this.syncCodeFilters();
  };

  D.startQueue = function (random) {
    if (this.mode === 'code') {
      this.startCodeQueue(random);
      this.renderCodeQuestion();
      this.renderStats();
      return;
    }
    origStartQueue.call(this, random);
  };

  D.startWrong = function () {
    if (this.mode === 'code') {
      var st = codeState();
      var ids = Object.keys(st.wrong);
      this.codeQueue = (CC.CODE_DRILLS || []).filter(function (d) { return ids.indexOf(d.id) >= 0; });
      this.codeIndex = 0;
      this.codeOnlyWrong = true;
      if (!this.codeQueue.length) {
        UI.toast('编程错题本是空的', '先提交几道编程题吧，没过的会自动进来。');
        this.codeQueue = this.filteredCode();
        this.codeOnlyWrong = false;
      }
      this.syncChips();
      this.renderCodeQuestion();
      this.renderStats();
      return;
    }
    origStartWrong.call(this);
  };

  D.currentCode = function () {
    return this.codeQueue[this.codeIndex] || null;
  };

  D.renderQuestion = function () {
    if (this.mode === 'code') return this.renderCodeQuestion();
    return origRenderQuestion.call(this);
  };

  D.answer = function (i) {
    if (this.mode === 'code') return;
    return origAnswer.call(this, i);
  };

  D.renderCodeQuestion = function () {
    var self = this;
    var box = this.qCard;
    if (!box) return;
    UI.clear(box);
    var d = this.currentCode();
    if (!d) {
      box.appendChild(UI.el('div', 'center muted', '这个筛选下没有编程题，换一个分类试试～'));
      return;
    }

    var st = codeState();
    var solved = !!st.solved[d.id];
    var meta = UI.el('div', 'drills-meta');
    if (d.stage === 'single') meta.appendChild(UI.el('span', 'tag' + (solved ? ' done' : ''), '单函数 · ' + d.target));
    else if (d.stage === 'bridge') meta.appendChild(UI.el('span', 'tag', '组合过渡'));
    else meta.appendChild(UI.el('span', 'tag', '综合挑战'));
    meta.appendChild(UI.el('span', 'tag', d.header));
    meta.appendChild(UI.el('span', 'tag star', stars(d.level)));
    meta.appendChild(UI.el('span', 'tag' + (solved ? ' done' : ''), solved ? '已通关 ✓' : '待挑战'));
    meta.appendChild(UI.el('span', 'drills-counter', (this.codeIndex + 1) + ' / ' + this.codeQueue.length + (this.codeOnlyWrong ? '（编程错题本）' : '')));
    box.appendChild(meta);

    var shell = UI.el('div', 'code-drill-shell');
    var brief = UI.el('section', 'code-drill-brief');
    var work = UI.el('section', 'code-drill-workbench');
    shell.appendChild(brief);
    shell.appendChild(work);
    box.appendChild(shell);

    var titleRow = UI.el('div', 'code-drill-title-row');
    titleRow.appendChild(UI.el('h3', 'code-drill-title', '🐾 ' + d.title));
    brief.appendChild(titleRow);
    brief.appendChild(UI.el('p', 'code-drill-story', d.story));

    var goal = UI.el('div', 'code-drill-goal');
    goal.appendChild(UI.el('strong', null, '任务目标'));
    goal.appendChild(UI.el('span', null, d.goal));
    brief.appendChild(goal);

    var spec = UI.el('div', 'code-drill-spec');
    var inputRow = UI.el('div', 'code-drill-spec-row');
    inputRow.appendChild(UI.el('b', null, '输入'));
    inputRow.appendChild(UI.el('span', null, d.inputFormat));
    spec.appendChild(inputRow);
    var outputRow = UI.el('div', 'code-drill-spec-row');
    outputRow.appendChild(UI.el('b', null, '输出'));
    outputRow.appendChild(UI.el('span', null, d.outputFormat));
    spec.appendChild(outputRow);
    if (d.constraints) {
      var limitRow = UI.el('div', 'code-drill-spec-row');
      limitRow.appendChild(UI.el('b', null, '约定'));
      limitRow.appendChild(UI.el('span', null, d.constraints));
      spec.appendChild(limitRow);
    }
    brief.appendChild(spec);

    var chips = UI.el('div', 'code-drill-functions');
    chips.appendChild(UI.el('span', 'tiny muted', '本题重点：'));
    d.functions.forEach(function (f) {
      var t = UI.el('code', 'code-fn-chip', f);
      chips.appendChild(t);
    });
    brief.appendChild(chips);

    var sample = d.examples[0];
    var sampleBox = UI.el('div', 'code-drill-sample');
    var sampleHead = UI.el('div', 'code-drill-sample-head');
    sampleHead.appendChild(UI.el('b', null, '公开样例'));
    var fillBtn = UI.el('button', 'btn small ghost', '↪ 填入下方测试框');
    fillBtn.type = 'button';
    sampleHead.appendChild(fillBtn);
    sampleBox.appendChild(sampleHead);
    sampleBox.appendChild(UI.codeBlock('输入', sample.stdin));
    sampleBox.appendChild(UI.codeBlock('期望输出', sample.stdout));
    if (sample.note) sampleBox.appendChild(UI.el('div', 'tiny muted', sample.note));
    brief.appendChild(sampleBox);

    var hintBox = UI.el('div', 'code-drill-hidden-panel hidden');
    var hintUl = UI.el('ul', 'hint-list');
    d.hints.forEach(function (h) { hintUl.appendChild(UI.el('li', null, h)); });
    hintBox.appendChild(hintUl);
    brief.appendChild(hintBox);

    var solBox = UI.el('div', 'code-drill-hidden-panel hidden');
    solBox.appendChild(UI.el('div', 'tiny muted', '参考答案不是唯一的。先让测试点变绿，再对照看看有没有更清楚的写法。'));
    solBox.appendChild(UI.codeBlock('参考实现', d.solution));
    solBox.appendChild(UI.el('p', 'tiny', d.explain));
    brief.appendChild(solBox);

    var workHead = UI.el('div', 'code-drill-work-head');
    workHead.appendChild(UI.el('strong', null, '猫猫工作台'));
    workHead.appendChild(UI.el('span', 'tiny muted', '代码会自动保存到这个浏览器'));
    work.appendChild(workHead);

    var editorHost = UI.el('div', 'code-drill-editor');
    work.appendChild(editorHost);
    var draft = CC.CodeStore.get('code-drill-v2:' + d.id, d.starter);
    var editor = new CC.CodeEditor(editorHost, {
      value: draft,
      fileName: d.id + '.c',
      minHeight: 330,
      onRun: function () { doRun(); },
      onChange: function (code) { CC.CodeStore.set('code-drill-v2:' + d.id, code); }
    });
    this.codeEditor = editor;
    editor.textarea.placeholder = '从第一行开始写：头文件、main、变量、输入输出。起始区不会替你写 #include。';

    var stdinHead = UI.el('div', 'code-drill-stdin-head');
    stdinHead.appendChild(UI.el('label', null, '程序输入（可以改成自己的数据）'));
    var sampleBtn = UI.el('button', 'btn small ghost', '填入样例');
    sampleBtn.type = 'button';
    stdinHead.appendChild(sampleBtn);
    work.appendChild(stdinHead);
    var stdin = UI.el('textarea', 'code-drill-stdin');
    stdin.rows = 3;
    stdin.spellcheck = false;
    stdin.value = sample.stdin;
    stdin.placeholder = '程序会从这里读取输入，例如：3 4';
    work.appendChild(stdin);
    fillBtn.addEventListener('click', function () { stdin.value = sample.stdin; stdin.focus(); });
    sampleBtn.addEventListener('click', function () { stdin.value = sample.stdin; stdin.focus(); });

    var actions = UI.el('div', 'code-drill-actions');
    var runBtn = UI.el('button', 'btn', '▶ 运行我的输入');
    runBtn.type = 'button';
    var submitBtn = UI.el('button', 'btn primary', '🚀 提交判题');
    submitBtn.type = 'button';
    var hintBtn = UI.el('button', 'btn small ghost', '💡 提示');
    hintBtn.type = 'button';
    var solBtn = UI.el('button', 'btn small ghost', '👀 参考答案');
    solBtn.type = 'button';
    var resetBtn = UI.el('button', 'btn small ghost', '↺ 重置代码');
    resetBtn.type = 'button';
    actions.appendChild(runBtn);
    actions.appendChild(submitBtn);
    actions.appendChild(hintBtn);
    actions.appendChild(solBtn);
    actions.appendChild(resetBtn);
    if (CC.ApiView) {
      var aiBtn = UI.el('button', 'btn small ghost', '🤖 问 AI 助教');
      aiBtn.type = 'button';
      aiBtn.addEventListener('click', function () {
        if (!CC.ApiView.ensure()) return;
        CC.ApiView.ask({
          title: '🤖 AI 助教 · ' + d.title,
          system: '你是面向零基础学习者的 C 语言助教。用简体中文回答，最多 7 行。只给调试方向和下一步检查点，不要直接给完整答案。',
          prompt: '题目：' + d.title + '\n要求：' + d.goal + '\n输入格式：' + d.inputFormat + '\n输出格式：' + d.outputFormat + '\n\n我的代码：\n' + editor.getValue() + '\n\n我运行得到的输出：\n' + (self.codeOutputText || '（还没有运行）')
        });
      });
      actions.appendChild(aiBtn);
    }
    work.appendChild(actions);

    var nav = UI.el('div', 'code-drill-nav');
    var prevBtn = UI.el('button', 'btn small ghost', '← 上一题');
    prevBtn.type = 'button';
    var nextBtn = UI.el('button', 'btn small ghost', '下一题 →');
    nextBtn.type = 'button';
    prevBtn.disabled = this.codeIndex <= 0;
    nextBtn.disabled = this.codeIndex >= this.codeQueue.length - 1;
    prevBtn.addEventListener('click', function () { self.codeIndex--; self.renderCodeQuestion(); });
    nextBtn.addEventListener('click', function () { self.codeIndex++; self.renderCodeQuestion(); });
    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    work.appendChild(nav);

    var result = UI.el('div', 'code-drill-result');
    result.appendChild(UI.el('div', 'code-drill-result-title', '判题结果会出现在这里'));
    result.appendChild(UI.el('div', 'tiny muted', '运行只测试你填的输入；提交才会跑全部隐藏测试点。'));
    work.appendChild(result);

    function showRun(run) {
      UI.clear(result);
      result.className = 'code-drill-result ' + (run.ok ? 'ok' : 'bad');
      var head = UI.el('div', 'code-drill-result-title', run.ok ? '▶ 运行完成' : '💥 程序没有跑完');
      result.appendChild(head);
      var pre = UI.el('pre', 'code-drill-console');
      if (run.ok) {
        pre.textContent = run.output || '（程序正常运行，但没有打印内容）';
        self.codeOutputText = run.output || '';
      } else {
        pre.textContent = run.error.message + (run.error.hint ? '\n\n' + run.error.hint : '');
        self.codeOutputText = pre.textContent;
      }
      result.appendChild(pre);
      if (run.warnings && run.warnings.length) {
        var warn = UI.el('div', 'code-drill-warning');
        run.warnings.forEach(function (w) { warn.appendChild(UI.el('div', null, '💡 ' + w.message + (w.hint ? '　→ ' + w.hint : ''))); });
        result.appendChild(warn);
      }
    }

    function doRun() {
      var run = CC.Grade.runCode(editor.getValue(), stdin.value);
      showRun(run);
      CC.App.state.stats.runs = (CC.App.state.stats.runs || 0) + 1;
      if (run.ok) CC.App.state.stats.successRuns = (CC.App.state.stats.successRuns || 0) + 1;
      else CC.App.state.stats.failRuns = (CC.App.state.stats.failRuns || 0) + 1;
      CC.App.react(run.ok ? 'happy' : 'sad');
      CC.App.save();
    }

    function doSubmit() {
      var code = editor.getValue();
      var res = CC.Grade.gradeTask({ id: d.id, title: d.title, tests: d.tests }, code, { timeLimitMs: 4500 });
      var st2 = codeState();
      st2.attempts++;
      if (res.pass) {
        var first = !st2.solved[d.id];
        st2.solved[d.id] = { at: Date.now(), tries: (st2.solved[d.id] && st2.solved[d.id].tries || 0) + 1 };
        delete st2.wrong[d.id];
        if (first) {
          var xp = 5 + d.level * 2;
          var fish = 1 + d.level;
          CC.App.addXp(xp);
          CC.App.addFish(fish);
          CC.App.react('love');
          CC.App.save();
          UI.refresh();
          if (CC.FX && CC.FX.celebrate) {
            CC.FX.celebrate({
              title: '🎉 全部测试点通过！',
              subtitle: '🐟 +' + fish + '　⭐ +' + xp + '　这道编程题已经收进猫猫的勋章墙',
              exitLabel: '收下夸夸，继续挑战',
              count: 20
            });
          }
        } else {
          CC.App.save();
          UI.refresh();
          UI.toast('又通过一次！', '熟练度在悄悄上涨。');
        }
      } else {
        st2.wrong[d.id] = true;
        CC.App.react('sad');
        CC.App.save();
        UI.refresh();
        if (CC.FX && CC.FX.failTask) {
          CC.FX.failTask('code:' + d.id, { onHint: function () { hintBtn.click(); } });
        }
      }
      renderJudge(res);
      self.renderStats();
    }

    function renderJudge(res) {
      UI.clear(result);
      var passCount = 0;
      for (var i = 0; i < res.results.length; i++) if (res.results[i].ok) passCount++;
      result.className = 'code-drill-result ' + (res.pass ? 'ok' : 'bad');
      var title = UI.el('div', 'code-drill-result-title', res.pass
        ? '✅ 全部测试点通过　' + passCount + ' / ' + res.results.length
        : '🐱 还差一点点　' + passCount + ' / ' + res.results.length + ' 个测试点通过');
      result.appendChild(title);
      if (!res.pass) result.appendChild(UI.el('p', 'code-drill-judge-msg', res.message));
      var list = UI.el('div', 'code-drill-tests');
      res.results.forEach(function (r, idx) {
        var item = UI.el('div', 'code-drill-test ' + (r.ok ? 'pass' : 'fail'));
        var row = UI.el('div', 'code-drill-test-head');
        row.appendChild(UI.el('span', 'code-drill-test-icon', r.ok ? '✓' : '✕'));
        row.appendChild(UI.el('b', null, r.name || ('测试点 ' + (idx + 1))));
        row.appendChild(UI.el('span', 'code-drill-test-state', r.ok ? '通过' : (r.reason === 'crash' ? '运行错误' : '答案不符')));
        item.appendChild(row);
        if (!r.ok) {
          if (r.reason === 'crash' && r.error) {
            item.appendChild(UI.el('pre', 'code-drill-diff', r.error.message + (r.error.hint ? '\n' + r.error.hint : '')));
          } else {
            item.appendChild(UI.el('div', 'code-drill-diff-label', '期望输出'));
            item.appendChild(UI.el('pre', 'code-drill-diff', String(r.expected == null ? '' : r.expected)));
            item.appendChild(UI.el('div', 'code-drill-diff-label', '你的输出'));
            item.appendChild(UI.el('pre', 'code-drill-diff', String(r.actual == null ? '' : r.actual)));
          }
        }
        list.appendChild(item);
      });
      result.appendChild(list);
    }

    runBtn.addEventListener('click', doRun);
    submitBtn.addEventListener('click', doSubmit);
    hintBtn.addEventListener('click', function () { hintBox.classList.toggle('hidden'); });
    solBtn.addEventListener('click', function () { solBox.classList.toggle('hidden'); });
    resetBtn.addEventListener('click', function () {
      if (!root.confirm('把这道题的代码恢复成起始模板？')) return;
      editor.setValue(d.starter);
      CC.CodeStore.set('code-drill-v2:' + d.id, d.starter);
    });
  };

  D.renderStats = function () {
    origRenderStats.call(this);
    if (!this.statsEl) return;
    var st = codeState();
    var total = (CC.CODE_DRILLS || []).length;
    var solved = Object.keys(st.solved).length;
    var wrong = Object.keys(st.wrong).length;
    var chapterTitle = this.chaptersEl && this.chaptersEl.previousElementSibling;
    if (chapterTitle) chapterTitle.textContent = '选择题分类进度';
    var statRows = this.statsEl.querySelectorAll('.kv');
    if (statRows[0] && statRows[0].firstChild) statRows[0].firstChild.textContent = '选择题已答';
    if (statRows[1] && statRows[1].firstChild) statRows[1].firstChild.textContent = '选择题正确率';
    this.statsEl.appendChild(UI.el('div', 'drills-stat-divider'));
    [['编程题通关', solved + ' / ' + total],
      ['单函数专练', Object.keys(st.solved).filter(function (id) { var q = byId(id); return q && q.stage === 'single'; }).length + ' / 90'],
      ['组合过渡', Object.keys(st.solved).filter(function (id) { var q = byId(id); return q && q.stage === 'bridge'; }).length + ' / 12'],
      ['综合挑战', Object.keys(st.solved).filter(function (id) { var q = byId(id); return q && q.stage === 'mixed'; }).length + ' / 24'],
      ['编程提交', (st.attempts || 0) + ' 次'],
      ['编程错题', wrong + ' 道']].forEach(function (r) {
      var row = UI.el('div', 'kv');
      row.appendChild(UI.el('span', null, r[0]));
      row.appendChild(UI.el('b', null, r[1]));
      this.statsEl.appendChild(row);
    }, this);

    this.updateCodeTargets();
    var codeWrongIds = Object.keys(st.wrong);
    if (!codeWrongIds.length) return;
    var placeholder = this.wrongEl && this.wrongEl.querySelector('.pz-small');
    if (placeholder) placeholder.parentNode.removeChild(placeholder);
    codeWrongIds.forEach(function (id) {
      var d = byId(id);
      if (!d) return;
      var b = UI.el('button', 'drills-wrong-item code-wrong-item');
      b.type = 'button';
      b.appendChild(UI.el('span', 'tag', '编程'));
      b.appendChild(UI.el('span', null, d.title));
      b.addEventListener('click', function () {
        D.setMode('code');
        D.codeQueue = [d];
        D.codeIndex = 0;
        D.codeOnlyWrong = true;
        D.renderCodeQuestion();
        D.renderStats();
      });
      this.wrongEl.appendChild(b);
    }, this);
  };

  D.enter = function () {
    origEnter.call(this);
    if (this.mode === 'code') this.renderCodeQuestion();
    this.renderStats();
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
