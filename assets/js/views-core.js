/*!
 * 粉猫捉虫 · 界面渲染（外壳 / 学习地图 / 课程内容）
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var doc = root.document;

  function el(tag, cls, text) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }
  function $(id) { return doc.getElementById(id); }

  var CHAPTERS = [
    { name: '第一章 · 打开 C 语言的大门', from: 0, to: 2 },
    { name: '第二章 · 让数据动起来', from: 3, to: 6 },
    { name: '第三章 · 重复与批量处理', from: 7, to: 10 },
    { name: '第四章 · 函数与指针', from: 11, to: 15 }
  ];

  var UI = {
    el: el,
    clear: clear,
    $: $,
    currentView: 'map',
    currentLessonId: null,
    currentBugId: null,
    editors: {},
    pets: {},

    init: function () {
      var self = this;
      CC.App.onChange(function () { self.refresh(); });
      this.buildNav();
      this.buildMute();
      this.buildViews();
      this.showView('world');
      this.refresh();
      return this;
    },

    // ---------- 顶栏 ----------
    buildNav: function () {
      var nav = $('nav');
      clear(nav);
      var items = [
        ['world', '🗺️ 世界冒险'],
        ['map', '📖 故事书'],
        ['lesson', '继续上课'],
        ['flow', '🧭 流程图'],
        ['funcs', '📚 函数手册'],
        ['bugs', '🐛 虫虫洞'],
        ['playground', '🧪 练习场'],
        ['room', '🏠 猫窝'],
        ['about', 'ℹ️ 关于']
      ];
      for (var i = 0; i < items.length; i++) {
        (function (key, label) {
          var b = el('button', 'nav-btn', label);
          b.setAttribute('data-view', key);
          b.addEventListener('click', function () {
            if (key === 'lesson' && !UI.currentLessonId) {
              UI.openLesson(CC.App.state.lastLesson || (CC.App.lessons[0] && CC.App.lessons[0].id));
              return;
            }
            UI.showView(key);
          });
          nav.appendChild(b);
        })(items[i][0], items[i][1]);
      }
    },

    buildMute: function () {
      var host = document.querySelector('.wallet');
      if (!host || document.getElementById('mute-btn')) return;
      var b = document.createElement('button');
      b.id = 'mute-btn';
      b.className = 'mute-btn';
      b.type = 'button';
      b.addEventListener('click', function () {
        CC.App.state.muted = !CC.App.state.muted;
        CC.App.save();
        CC.UI.syncMute();
        if (!CC.App.state.muted && CC.FX) CC.FX.sound('pop');
      });
      host.appendChild(b);
      this.syncMute();
    },
    syncMute: function () {
      var b = document.getElementById('mute-btn');
      if (!b) return;
      var m = !!(CC.App.state && CC.App.state.muted);
      b.textContent = m ? '🔇' : '🔊';
      b.title = m ? '音效已关闭（点一下打开）' : '音效已打开（点一下关闭）';
    },

    showView: function (name) {
      var prev = this.currentView;
      if (prev === 'world' && name !== 'world' && CC.WorldView) CC.WorldView.leave();
      this.currentView = name;
      var views = doc.querySelectorAll('.view');
      for (var i = 0; i < views.length; i++) {
        views[i].classList.toggle('on', views[i].id === 'view-' + name);
      }
      var btns = doc.querySelectorAll('.nav-btn');
      for (var j = 0; j < btns.length; j++) {
        var k = btns[j].getAttribute('data-view');
        btns[j].classList.toggle('on', k === name || (k === 'lesson' && name === 'lesson'));
      }
      if (name === 'world' && CC.WorldView) CC.WorldView.enter();
      if (name === 'flow' && CC.FlowView) CC.FlowView.enter();
      if (name === 'funcs' && CC.FuncView) CC.FuncView.enter();
      if (name === 'lesson') this.renderLessonContent();
      if (name === 'room') this.renderRoom();
      if (name === 'about') this.renderAbout();
      if (name === 'playground' && !this.pgEditor) this.initPlayground();
      if (name === 'bugs') this.renderBugList();
      this.refresh();
      root.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // 首次进入时把各个视图都准备好
    buildViews: function () {
      this.renderMap();
      if (!this.currentLessonId && CC.App.state.lastLesson) this.currentLessonId = CC.App.state.lastLesson;
      this.renderLessonNav();
      if (this.currentLessonId) this.renderLessonContent();
      this.renderBugList();
    },

    // ---------- 顶栏数值 ----------
    refresh: function () {
      var st = CC.App.state;
      var lv = CC.App.level();
      $('fish-count').textContent = st.fish;
      $('level-label').textContent = 'Lv.' + lv.level + ' ' + lv.title;
      var bar = $('level-bar');
      if (bar) bar.style.width = Math.round(lv.progress * 100) + '%';
      var doneEl = $('done-count');
      if (doneEl) doneEl.textContent = CC.App.doneCount() + ' / ' + CC.App.totalTasks();
      this.renderMap();
      this.renderPetPanel();
      if (this.currentLessonId) this.renderLessonNav();
      if (this.currentView === 'room') this.renderRoom();
      if (this.currentView === 'world' && CC.WorldView) CC.WorldView.refresh();
      if (this.currentView === 'bugs') this.renderBugList();
    },

    // ---------- 学习地图 ----------
    renderMap: function () {
      var self = this;
      var host = $('map-chapters');
      if (!host) return;
      clear(host);

      var heroSpeech = $('map-speech');
      if (heroSpeech) {
        var st = CC.App.state;
        var lv = CC.App.level();
        var msg = '';
        if (CC.App.doneCount() === 0) msg = '我是捉虫！在大世界里到处走走，点一点身边的东西，就能发现编程的秘密～';
        else if (st.hunger < 25) msg = '喵…我有点饿了。写代码赚点小鱼干喂我好不好？';
        else if (lv.level >= 8) msg = '你已经是很厉害的 C 语言猫啦！要不要去捉虫挑战里练练手？';
        else msg = '你回来啦！已完成 ' + CC.App.doneCount() + ' / ' + CC.App.totalTasks() + ' 个任务，继续加油～';
        heroSpeech.textContent = msg;
      }

      var stats = $('map-stats');
      if (stats) {
        clear(stats);
        var lv2 = CC.App.level();
        stats.appendChild(el('span', 'chip', '🐟 小鱼干 ' + CC.App.state.fish));
        stats.appendChild(el('span', 'chip', '⭐ 经验 ' + CC.App.state.xp));
        stats.appendChild(el('span', 'chip', '❤️ 亲密度 ' + CC.App.state.intimacy));
        stats.appendChild(el('span', 'chip', '✅ 任务 ' + CC.App.doneCount() + ' / ' + CC.App.totalTasks()));
        stats.appendChild(el('span', 'chip', '🐛 捉虫 ' + CC.Store.count(CC.App.state.bugsFixed) + ' / ' + CC.App.bugs.length));
      }

      for (var c = 0; c < CHAPTERS.length; c++) {
        var ch = CHAPTERS[c];
        var sec = el('div', 'chapter');
        var title = el('div', 'chapter-title', ch.name);
        sec.appendChild(title);
        var grid = el('div', 'lesson-grid');
        for (var i = ch.from; i <= ch.to && i < CC.App.lessons.length; i++) {
          grid.appendChild(this.lessonCard(CC.App.lessons[i]));
        }
        sec.appendChild(grid);
        host.appendChild(sec);
      }
    },

    lessonCard: function (lesson) {
      var self = this;
      var p = CC.App.lessonProgress(lesson);
      var done = p.total > 0 && p.done === p.total;
      var card = el('button', 'lesson-card');
      card.type = 'button';
      if (done) card.appendChild(el('span', 'badge-done', '🎀'));
      card.appendChild(el('h4', null, lesson.title));
      card.appendChild(el('p', null, lesson.subtitle));
      var meta = el('div', 'row');
      meta.appendChild(el('span', 'tag', '约 ' + lesson.minutes + ' 分钟'));
      meta.appendChild(el('span', 'tag' + (done ? ' done' : ''), p.done + ' / ' + p.total + ' 任务'));
      card.appendChild(meta);
      var dots = el('div', 'dots');
      for (var i = 0; i < lesson.tasks.length; i++) {
        dots.appendChild(el('i', CC.App.isTaskDone(lesson.tasks[i].id) ? 'done' : ''));
      }
      card.appendChild(dots);
      card.addEventListener('click', function () { self.openLesson(lesson.id); });
      return card;
    },

    // ---------- 课程 ----------
    openLesson: function (id) {
      if (!id) return;
      this.currentLessonId = id;
      CC.App.state.lastLesson = id;
      CC.App.save();
      this.showView('lesson');
    },

    renderLessonNav: function () {
      var self = this;
      var host = $('lesson-nav');
      if (!host) return;
      clear(host);
      for (var i = 0; i < CC.App.lessons.length; i++) {
        (function (lesson) {
          var b = el('button');
          b.type = 'button';
          if (lesson.id === self.currentLessonId) b.className = 'on';
          var done = CC.App.isLessonDone(lesson);
          var dot = el('span', 'nav-dot', done ? '🎀' : (CC.App.lessonProgress(lesson).done > 0 ? '·' : '○'));
          b.appendChild(dot);
          b.appendChild(el('span', null, lesson.title.replace(/^第 \d+ 课 · /, '')));
          b.addEventListener('click', function () { self.openLesson(lesson.id); });
          host.appendChild(b);
        })(CC.App.lessons[i]);
      }
    },

    renderLessonContent: function () {
      var self = this;
      var lesson = CC.App.findLesson(this.currentLessonId);
      var host = $('lesson-content');
      if (!host || !lesson) return;
      clear(host);

      var head = el('div', 'lesson-head');
      head.appendChild(el('h2', null, lesson.title));
      head.appendChild(el('div', 'sub', lesson.subtitle));
      var meta = el('div', 'row');
      meta.appendChild(el('span', 'tag', '约 ' + lesson.minutes + ' 分钟'));
      var prog = CC.App.lessonProgress(lesson);
      meta.appendChild(el('span', 'tag' + (prog.done === prog.total ? ' done' : ''), '已完成 ' + prog.done + ' / ' + prog.total + ' 个任务'));
      head.appendChild(meta);
      if (lesson.goals && lesson.goals.length) {
        var ul = el('ul', 'goal-list');
        head.appendChild(el('div', 'tiny muted', '读完这页，你就会：'));
        for (var g = 0; g < lesson.goals.length; g++) ul.appendChild(el('li', null, lesson.goals[g]));
        head.appendChild(ul);
      }
      host.appendChild(head);

      var sections = lesson.sections || [];
      for (var i = 0; i < sections.length; i++) host.appendChild(this.renderSection(sections[i]));

      var taskHead = el('div', 'lesson-head');
      taskHead.appendChild(el('h2', null, '🧩 试炼场'));
      taskHead.appendChild(el('div', 'sub', '这一课有 ' + lesson.tasks.length + ' 个小试炼。通过一个，捉虫就多一条小鱼干。'));
      host.appendChild(taskHead);

      for (var t = 0; t < lesson.tasks.length; t++) {
        host.appendChild(this.taskRunner(lesson.tasks[t], { kind: 'lesson' }));
      }

      // 上一课 / 下一课
      var idx = -1;
      for (var k = 0; k < CC.App.lessons.length; k++) if (CC.App.lessons[k].id === lesson.id) idx = k;
      var navRow = el('div', 'row');
      navRow.style.marginTop = '16px';
      if (idx > 0) {
        var prev = el('button', 'btn', '← ' + CC.App.lessons[idx - 1].title);
        prev.addEventListener('click', function () { self.openLesson(CC.App.lessons[idx - 1].id); });
        navRow.appendChild(prev);
      }
      navRow.appendChild(el('div', 'spacer'));
      if (idx >= 0 && idx < CC.App.lessons.length - 1) {
        var next = el('button', 'btn primary', CC.App.lessons[idx + 1].title + ' →');
        next.addEventListener('click', function () { self.openLesson(CC.App.lessons[idx + 1].id); });
        navRow.appendChild(next);
      }
      host.appendChild(navRow);
      this.renderLessonNav();
    },

    codeBlock: function (title, code) {
      var box = el('div', 'codeblock');
      var head = el('div', 'codeblock-head');
      head.appendChild(el('span', null, title || 'C 代码'));
      var copy = el('button', 'copy', '复制');
      copy.type = 'button';
      copy.addEventListener('click', function () {
        try {
          if (root.navigator && root.navigator.clipboard) {
            root.navigator.clipboard.writeText(code);
            copy.textContent = '已复制';
            setTimeout(function () { copy.textContent = '复制'; }, 1200);
          }
        } catch (e) { }
      });
      head.appendChild(copy);
      box.appendChild(head);
      var pre = el('pre');
      pre.textContent = code;
      box.appendChild(pre);
      return box;
    },

    renderSection: function (s) {
      if (s.type === 'text') {
        var box = el('div', 'section');
        box.appendChild(el('h3', null, s.h));
        for (var i = 0; i < s.p.length; i++) box.appendChild(el('p', null, s.p[i]));
        return box;
      }
      if (s.type === 'code') {
        var cbox = el('div', 'section');
        if (s.title) cbox.appendChild(el('h3', null, s.title));
        cbox.appendChild(this.codeBlock(s.title || '示例代码', s.code));
        if (s.explain && s.explain.length) {
          var ul = el('ul', 'explain-list');
          for (var e = 0; e < s.explain.length; e++) {
            var li = el('li');
            li.appendChild(el('code', null, s.explain[e][0]));
            li.appendChild(el('span', null, s.explain[e][1]));
            ul.appendChild(li);
          }
          cbox.appendChild(ul);
        }
        return cbox;
      }
      if (s.type === 'table') {
        var tbox = el('div', 'section');
        if (s.title) tbox.appendChild(el('h3', null, s.title));
        var table = el('table', 'data');
        var thead = el('thead');
        var tr = el('tr');
        for (var h = 0; h < s.head.length; h++) tr.appendChild(el('th', null, s.head[h]));
        thead.appendChild(tr);
        table.appendChild(thead);
        var tbody = el('tbody');
        for (var r = 0; r < s.rows.length; r++) {
          var row = el('tr');
          for (var c = 0; c < s.rows[r].length; c++) {
            var td = el('td');
            td.textContent = s.rows[r][c];
            row.appendChild(td);
          }
          tbody.appendChild(row);
        }
        table.appendChild(tbody);
        tbox.appendChild(table);
        if (s.note) {
          var box2 = el('div', 'callout tip', s.note);
          tbox.appendChild(box2);
        }
        return tbox;
      }
      if (s.type === 'tip') {
        var tip = el('div', 'section');
        tip.appendChild(el('div', 'callout tip', s.text));
        return tip;
      }
      if (s.type === 'mistakes') {
        var mbox = el('div', 'section');
        var callout = el('div', 'callout mistake');
        callout.appendChild(el('h4', null, s.title || '常见错误'));
        for (var m = 0; m < s.items.length; m++) {
          var it = s.items[m];
          var wrap = el('div', 'mistake-item');
          wrap.appendChild(el('div', 'bad', '❌ ' + it.bad));
          wrap.appendChild(el('div', 'why', '为什么错：' + it.why));
          wrap.appendChild(el('div', 'fix', '✅ 正确做法：' + it.fix));
          callout.appendChild(wrap);
        }
        mbox.appendChild(callout);
        return mbox;
      }
      if (s.type === 'list' || s.type === 'steps') {
        var lbox = el('div', 'section');
        if (s.title) lbox.appendChild(el('h3', null, s.title));
        var ol = el(s.type === 'steps' ? 'ol' : 'ul');
        for (var q = 0; q < s.items.length; q++) ol.appendChild(el('li', null, s.items[q]));
        lbox.appendChild(ol);
        return lbox;
      }
      return el('div', 'section');
    }
  };

  CC.UI = UI;
})(typeof globalThis !== 'undefined' ? globalThis : this);