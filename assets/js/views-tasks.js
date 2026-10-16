/*!
 * 粉猫捉虫 · 任务运行器（写代码 → 运行 → 判题 → 拿奖励）
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var doc = root.document;
  var UI = CC.UI;
  var el = UI.el, clear = UI.clear, $ = UI.$;

  function fmtReward(r) {
    if (!r) return '';
    return '🐟 × ' + (r.fish == null ? 3 : r.fish) + '　⭐ × ' + (r.xp == null ? 20 : r.xp);
  }

  UI.toast = function (title, body, kind) {
    var layer = $('toast-layer');
    if (!layer) return;
    var box = el('div', 'toast' + (kind === 'urgent' ? ' urgent' : ''));
    box.appendChild(el('div', 't-title', title));
    if (body) box.appendChild(el('div', null, body));
    layer.appendChild(box);
    setTimeout(function () {
      box.style.transition = 'opacity .3s ease';
      box.style.opacity = '0';
      setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 320);
    }, 4200);
  };

  UI.rewardToasts = function (out, kind) {
    if (!out) return;
    if (out.first) {
      this.toast(kind === 'bug' ? '捉到一只虫！🐛' : (kind === 'puzzle' ? '谜题解开啦！🎉' : '这个小试炼过啦！🎉'),
        '🐟 小鱼干 +' + out.fish + '　⭐ 经验 +' + out.xp + '　❤️ 亲密度 +1');
    }
    if (out.levels > 0) {
      this.toast('捉虫升级啦！', '现在是 Lv.' + CC.App.level().level + '「' + CC.App.level().title + '」，额外奖励小鱼干 +5');
    }
    var ach = out.achievements || [];
    for (var i = 0; i < ach.length; i++) {
      this.toast('🏅 解锁成就：' + ach[i].title, ach[i].desc + '（小鱼干 +' + (ach[i].fish || 5) + '）');
    }
  };

  UI.taskRunner = function (task, opts) {
    opts = opts || {};
    var self = this;
    var isBug = opts.kind === 'bug';
    var card = el('div', 'task-card');
    card.id = 'task-' + task.id;

    var titleRow = el('h3');
    titleRow.appendChild(el('span', null, task.title || '任务'));
    if (task.difficulty) titleRow.appendChild(el('span', 'tag star', '难度 ' + new Array(task.difficulty + 1).join('★')));
    var doneTag = el('span', 'tag' + (isBug ? (CC.App.isBugDone(task.id) ? ' done' : '') : (CC.App.isTaskDone(task.id) ? ' done' : '')), '还没过');
    doneTag.setAttribute('data-done', '1');
    titleRow.appendChild(doneTag);
    if (isBug) {
      titleRow.appendChild(el('span', 'tag', '奖励 🐟×' + (4 + (task.difficulty || 1)) + ' ⭐×' + (20 + (task.difficulty || 1) * 10)));
    } else {
      titleRow.appendChild(el('span', 'tag', '奖励 ' + fmtReward(task.reward)));
    }
    card.appendChild(titleRow);
    card.appendChild(el('div', 'task-brief', task.brief));

    var starterCode = isBug ? task.buggy : task.starter;
    var saved = CC.CodeStore.get(task.id, null);

    var editorHost = el('div');
    card.appendChild(editorHost);
    var editor = new CC.CodeEditor(editorHost, {
      value: saved == null ? starterCode : saved,
      fileName: isBug ? 'buggy.c' : 'main.c',
      onRun: function () { doRun(); },
      onChange: function (code) { CC.CodeStore.set(task.id, code); }
    });
    this.editors[task.id] = editor;

    var stdinRow = el('div', 'stdin-row');
    stdinRow.appendChild(el('label', null, '喂给程序的输入'));
    var stdinInput = el('input');
    stdinInput.type = 'text';
    var sample = task.sampleStdin !== undefined ? task.sampleStdin
      : ((task.tests && task.tests[0] && task.tests[0].stdin) || '');
    stdinInput.value = String(sample).replace(/\n/g, ' ');
    stdinInput.placeholder = '程序要吃的输入，例如 3 4';
    stdinRow.appendChild(stdinInput);
    card.appendChild(stdinRow);

    var btnRow = el('div', 'row');
    btnRow.style.marginTop = '10px';
    var runBtn = el('button', 'btn primary', '▶ 试一试');
    runBtn.type = 'button';
    var submitBtn = el('button', 'btn mint', '✔ 交给捉虫看看');
    submitBtn.type = 'button';
    var hintBtn = el('button', 'btn small ghost', '💡 猫猫提示');
    hintBtn.type = 'button';
    var solBtn = el('button', 'btn small ghost', '👀 偷偷看一眼答案');
    solBtn.type = 'button';
    var resetBtn = el('button', 'btn small ghost', '↺ 从头再来');
    resetBtn.type = 'button';
    btnRow.appendChild(runBtn);
    btnRow.appendChild(submitBtn);
    btnRow.appendChild(el('div', 'spacer'));
    btnRow.appendChild(hintBtn);
    btnRow.appendChild(solBtn);
    btnRow.appendChild(resetBtn);
    card.appendChild(btnRow);

    var consoleBox = el('div', 'console');
    var outBox = el('div', 'console-out');
    outBox.appendChild(el('span', 'ph', '点一下「试一试」，看看程序说了什么～'));
    consoleBox.appendChild(outBox);

    var warnBox = el('div', 'feedback info hidden');
    consoleBox.appendChild(warnBox);

    var fbBox = el('div', 'feedback hidden');
    consoleBox.appendChild(fbBox);

    var hintBox = el('div', 'solution-box hidden');
    var hintUl = el('ul', 'hint-list');
    hintBox.appendChild(el('div', 'tiny muted', '猫猫提示（先自己想想，再看更有效）'));
    hintBox.appendChild(hintUl);
    consoleBox.appendChild(hintBox);

    var solBox = el('div', 'solution-box hidden');
    consoleBox.appendChild(solBox);
    card.appendChild(consoleBox);

    function setTag(done) {
      doneTag.textContent = done ? '过啦 ✓' : '还没过';
      doneTag.className = 'tag' + (done ? ' done' : '');
    }

    function showOutput(run) {
      clear(outBox);
      outBox.classList.toggle('ok', !!run.ok && !!run.output);
      outBox.classList.toggle('bad', !run.ok);
      if (run.output) {
        outBox.textContent = run.output;
      } else if (run.ok) {
        outBox.appendChild(el('span', 'ph', '（程序没有打印任何内容）'));
      } else {
        outBox.textContent = run.error.message + (run.error.hint ? '\n\n' + run.error.hint : '');
      }
      clear(warnBox);
      var ws = run.warnings || [];
      if (ws.length) {
        warnBox.classList.remove('hidden');
        var h = el('div', 'fb-title', '💡 小提醒（不影响运行）');
        warnBox.appendChild(h);
        var ul = el('ul', 'warn-list');
        for (var i = 0; i < ws.length; i++) {
          var li = el('li', null, ws[i].message + (ws[i].hint ? '　→ ' + ws[i].hint : ''));
          ul.appendChild(li);
        }
        warnBox.appendChild(ul);
      } else {
        warnBox.classList.add('hidden');
      }
    }

    function doRun() {
      var code = editor.getValue();
      var run = CC.Grade.runCode(code, stdinInput.value);
      showOutput(run);
      CC.App.state.stats.runs++;
      if (run.ok) {
        CC.App.state.stats.successRuns++;
        if (CC.App.state.stats.successRuns >= 1) {
          var got = CC.App.checkAchievements();
          CC.App.save();
          for (var i = 0; i < got.length; i++) {
            if (got[i].id === 'first_run') self.toast('🏅 解锁成就：' + got[i].title, got[i].desc + '（小鱼干 +' + got[i].fish + '）');
          }
        } else {
          CC.App.save();
        }
        CC.App.react(Math.random() < 0.4 ? 'happy' : 'blink');
      } else {
        CC.App.state.stats.failRuns++;
        CC.App.save();
        CC.App.react('sad');
      }
      fbBox.classList.add('hidden');
    }

    function doSubmit() {
      var code = editor.getValue();
      var res = CC.Grade.gradeTask(task, code);
      var run = { ok: true, output: '', warnings: res.warnings || [], error: null };
      if (res.results && res.results.length && res.results[0].stdout !== undefined) run.output = res.results[0].stdout;
      var crash = null;
      for (var i = 0; i < res.results.length; i++) if (res.results[i].error) crash = res.results[i].error;
      if (crash) { run.ok = false; run.error = crash; }
      showOutput(run);

      clear(fbBox);
      fbBox.classList.remove('hidden');
      if (res.pass) {
        fbBox.className = 'feedback ok';
        fbBox.appendChild(el('div', 'fb-title', isBug ? '🎉 修好啦！虫子被你抓住了' : '🎉 过啦！捉虫开心地打了个滚'));
        var out = isBug ? CC.App.fixBug(task) : CC.App.completeTask(task);
        var extra = el('div', null, out.first
          ? '捉虫得到了 🐟 × ' + out.fish + ' 和 ⭐ × ' + out.xp
          : '这道题之前已经完成过啦，再练一遍也很好～');
        fbBox.appendChild(extra);
        if (task.learn) fbBox.appendChild(el('div', 'tiny', '知识点：' + task.learn));
        setTag(true);
        self.rewardToasts(out, isBug ? 'bug' : 'lesson');
        self.refresh();
      } else {
        fbBox.className = 'feedback bad';
        fbBox.appendChild(el('div', 'fb-title', '🐱 捉虫歪着头看了一会儿…'));
        fbBox.appendChild(el('div', null, res.message));
        if (res.results && res.results.length) {
          var ul = el('ul', 'warn-list');
          for (var r = 0; r < res.results.length; r++) {
            var item = res.results[r];
            ul.appendChild(el('li', null, (item.ok ? '✅ ' : '❌ ') + item.name + (item.ok ? '' : (item.reason === 'crash' ? '（程序报错了）' : '（结果不对）'))));
          }
          fbBox.appendChild(ul);
        }
        if (task.hints && task.hints.length) {
          fbBox.appendChild(el('div', 'tiny', '卡住了？让它给你点「💡 猫猫提示」吧。'));
        }
      }
    }

    runBtn.addEventListener('click', doRun);
    submitBtn.addEventListener('click', doSubmit);
    hintBtn.addEventListener('click', function () {
      var showing = hintBox.classList.contains('hidden');
      hintBox.classList.toggle('hidden');
      if (showing) {
        clear(hintUl);
        for (var i = 0; i < (task.hints || []).length; i++) hintUl.appendChild(el('li', null, task.hints[i]));
      }
    });
    solBtn.addEventListener('click', function () {
      var showing = solBox.classList.contains('hidden');
      solBox.classList.toggle('hidden');
      if (showing) {
        clear(solBox);
        solBox.appendChild(el('div', 'tiny muted', '答案在这儿（看懂思路比抄下来更重要）'));
        solBox.appendChild(self.codeBlock('参考答案', task.solution || task.fixed || '（暂无）'));
      }
    });
    resetBtn.addEventListener('click', function () {
      editor.setValue(starterCode);
      CC.CodeStore.set(task.id, starterCode);
    });

    // 初始状态
    if (isBug ? CC.App.isBugDone(task.id) : CC.App.isTaskDone(task.id)) setTag(true);
    return card;
  };

  // ---------- 捉虫挑战 ----------
  UI.renderBugList = function () {
    var self = this;
    var host = $('bugs-grid');
    if (!host) return;
    clear(host);
    var doneCount = 0;
    for (var i = 0; i < CC.App.bugs.length; i++) {
      var bug = CC.App.bugs[i];
      var done = CC.App.isBugDone(bug.id);
      if (done) doneCount++;
      (function (bug, done) {
        var card = el('button', 'bug-card');
        card.type = 'button';
        var h = el('h4');
        h.appendChild(el('span', null, (done ? '🎀 ' : '🐛 ') + bug.title));
        card.appendChild(h);
        var meta = el('div', 'row');
        meta.appendChild(el('span', 'tag star', new Array((bug.difficulty || 1) + 1).join('★')));
        meta.appendChild(el('span', 'tag' + (done ? ' done' : ''), done ? '已捉到' : '待捉'));
        card.appendChild(meta);
        card.appendChild(el('p', 'tiny muted', String(bug.brief).split('\n')[0]));
        card.addEventListener('click', function () { self.openBug(bug.id); });
        host.appendChild(card);
      })(bug, done);
    }
    var head = $('bugs-progress');
    if (head) head.textContent = '已捉到 ' + doneCount + ' / ' + CC.App.bugs.length + ' 只虫子';
  };

  UI.openBug = function (id) {
    var self = this;
    var bug = CC.App.findBug(id);
    if (!bug) return;
    var host = $('bug-detail');
    clear(host);
    host.classList.remove('hidden');
    var back = el('button', 'btn small ghost', '← 返回关卡列表');
    back.type = 'button';
    back.addEventListener('click', function () {
      host.classList.add('hidden');
      clear(host);
    });
    var bar = el('div', 'row');
    bar.style.marginBottom = '12px';
    bar.appendChild(back);
    if (bug.lesson) {
      var go = el('button', 'btn small ghost', '去上相关课程：' + bug.lesson);
      go.type = 'button';
      go.addEventListener('click', function () { self.openLesson(bug.lesson); });
      bar.appendChild(go);
    }
    host.appendChild(bar);
    host.appendChild(this.taskRunner(bug, { kind: 'bug' }));
    host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);