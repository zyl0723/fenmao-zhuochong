/*!
 * 粉猫捉虫 · 函数闯关（题海模式）
 * 89 道标准库选择题 + 126 道 PTA 风格编程题，按函数/训练阶段筛选，含错题本与连对纪录。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var doc = root.document;
  var UI = CC.UI;

  var HEADERS = [
    { id: 'all', label: '全部' },
    { id: 'stdio.h', label: 'stdio' },
    { id: 'string.h', label: 'string' },
    { id: 'stdlib.h', label: 'stdlib' },
    { id: 'ctype.h', label: 'ctype' },
    { id: 'math.h', label: 'math' },
    { id: '综合', label: '综合' }
  ];

  var Drills = {
    built: false,
    header: 'all',
    level: 0,
    onlyWrong: false,
    queue: [],
    index: 0,
    selected: null,
    answeredThis: false,
    ui: {},

    state: function () {
      var st = CC.App.state;
      if (!st.drills) st.drills = { answered: {}, wrong: {}, streak: 0, best: 0, total: 0 };
      if (!st.drills.answered) st.drills.answered = {};
      if (!st.drills.wrong) st.drills.wrong = {};
      return st.drills;
    },

    build: function () {
      if (this.built) return;
      var host = doc.getElementById('drills-root');
      if (!host) return;
      UI.clear(host);
      var self = this;
      var layout = UI.el('div', 'drills-layout');

      // 主区
      var main = UI.el('div', 'drills-main');
      var bar = UI.el('div', 'card drills-bar');
      var headRow = UI.el('div', 'drills-head-row');
      headRow.appendChild(UI.el('h2', null, '🧪 函数闯关'));
      self.streakEl = UI.el('div', 'drills-streak', '');
      headRow.appendChild(self.streakEl);
      bar.appendChild(headRow);
      bar.appendChild(UI.el('p', 'tiny muted', '题海模式：一次一题，答完立刻解析。所有「输出题」都用真实 gcc 编译运行核对过答案。'));

      var chips = UI.el('div', 'drills-chips');
      HEADERS.forEach(function (h) {
        var b = UI.el('button', 'drills-chip' + (self.header === h.id ? ' on' : ''), h.label);
        b.type = 'button';
        b.setAttribute('data-header', h.id);
        b.addEventListener('click', function () { self.header = h.id; self.startQueue(false); });
        chips.appendChild(b);
      });
      bar.appendChild(chips);
      var levelRow = UI.el('div', 'drills-chips');
      [['全部难度', 0], ['★ 入门', 1], ['★★ 进阶', 2], ['★★★ 坑题', 3]].forEach(function (p) {
        var b = UI.el('button', 'drills-chip small' + (self.level === p[1] ? ' on' : ''), p[0]);
        b.type = 'button';
        b.setAttribute('data-level', String(p[1]));
        b.addEventListener('click', function () { self.level = p[1]; self.startQueue(false); });
        levelRow.appendChild(b);
      });
      bar.appendChild(levelRow);
      var modeRow = UI.el('div', 'drills-mode');
      var randomBtn = UI.el('button', 'btn small primary', '🎲 随机 10 题');
      randomBtn.type = 'button';
      randomBtn.addEventListener('click', function () { self.startQueue(true); });
      modeRow.appendChild(randomBtn);
      var wrongBtn = UI.el('button', 'btn small', '📕 只刷错题');
      wrongBtn.type = 'button';
      wrongBtn.addEventListener('click', function () { self.startWrong(); });
      modeRow.appendChild(wrongBtn);
      var resetBtn = UI.el('button', 'btn small ghost', '重置答题记录');
      resetBtn.type = 'button';
      resetBtn.addEventListener('click', function () {
        if (!root.confirm('清空答题记录和错题本？（题目本身不会消失）')) return;
        CC.App.state.drills = { answered: {}, wrong: {}, streak: 0, best: 0, total: 0 };
        CC.App.save();
        self.startQueue(false);
        self.renderStats();
      });
      modeRow.appendChild(resetBtn);
      bar.appendChild(modeRow);
      main.appendChild(bar);

      self.qCard = UI.el('div', 'card drills-question');
      main.appendChild(self.qCard);
      layout.appendChild(main);

      // 侧栏
      var side = UI.el('aside', 'drills-side');
      var statsCard = UI.el('div', 'side-card');
      statsCard.appendChild(UI.el('div', 'side-title', '战绩'));
      self.statsEl = UI.el('div', 'drills-stats');
      statsCard.appendChild(self.statsEl);
      side.appendChild(statsCard);

      var chapters = UI.el('div', 'side-card');
      chapters.appendChild(UI.el('div', 'side-title', '分类进度'));
      self.chaptersEl = UI.el('div', 'drills-chapters');
      chapters.appendChild(self.chaptersEl);
      side.appendChild(chapters);

      var wrongCard = UI.el('div', 'side-card');
      wrongCard.appendChild(UI.el('div', 'side-title', '错题本'));
      self.wrongEl = UI.el('div', 'drills-wrong');
      wrongCard.appendChild(self.wrongEl);
      side.appendChild(wrongCard);
      layout.appendChild(side);

      host.appendChild(layout);
      this.built = true;
      this.startQueue(false);
      this.renderStats();
      this.bindKeys();
    },

    bindKeys: function () {
      var self = this;
      doc.addEventListener('keydown', function (e) {
        if (!self.built || CC.UI.currentView !== 'drills') return;
        var tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (e.key >= '1' && e.key <= '4') {
          e.preventDefault();
          self.answer(parseInt(e.key, 10) - 1);
        } else if (e.key === 'Enter' && self.answeredThis) {
          e.preventDefault();
          self.next();
        }
      });
    },

    filtered: function () {
      var self = this;
      return (CC.DRILLS || []).filter(function (d) {
        if (self.header !== 'all' && d.header !== self.header) return false;
        if (self.level && d.level !== self.level) return false;
        return true;
      });
    },

    shuffle: function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    },

    startQueue: function (random) {
      var list = this.filtered();
      this.onlyWrong = false;
      this.queue = random ? this.shuffle(list).slice(0, 10) : list;
      if (!this.queue.length) {
        this.queue = this.filtered();
      }
      this.index = 0;
      this.selected = null;
      this.answeredThis = false;
      this.syncChips();
      this.renderQuestion();
      this.renderStats();
    },

    startWrong: function () {
      var st = this.state();
      var ids = Object.keys(st.wrong);
      var all = CC.DRILLS || [];
      this.queue = all.filter(function (d) { return ids.indexOf(d.id) >= 0; });
      this.onlyWrong = true;
      this.index = 0;
      this.selected = null;
      this.answeredThis = false;
      this.syncChips();
      if (!this.queue.length) {
        UI.toast('错题本是空的', '先做几道题吧，答错的会自动进来。');
        this.queue = this.filtered();
      }
      this.renderQuestion();
      this.renderStats();
    },

    syncChips: function () {
      var chips = doc.querySelectorAll('.drills-chip');
      for (var i = 0; i < chips.length; i++) {
        var h = chips[i].getAttribute('data-header');
        var lv = chips[i].getAttribute('data-level');
        if (h) chips[i].classList.toggle('on', h === this.header);
        if (lv) chips[i].classList.toggle('on', Number(lv) === this.level);
      }
    },

    current: function () {
      return this.queue[this.index] || null;
    },

    renderQuestion: function () {
      var self = this;
      var box = this.qCard;
      if (!box) return;
      UI.clear(box);
      var d = this.current();
      if (!d) {
        box.appendChild(UI.el('div', 'center muted', '这个筛选下没有题目，换一个分类试试～'));
        return;
      }
      var st = this.state();
      var done = !!st.answered[d.id];
      var meta = UI.el('div', 'drills-meta');
      meta.appendChild(UI.el('span', 'tag', d.header));
      meta.appendChild(UI.el('span', 'tag star', new Array(d.level + 1).join('★')));
      meta.appendChild(UI.el('span', 'tag' + (done ? ' done' : ''), done ? '答过 ✓' : '新题'));
      meta.appendChild(UI.el('span', 'drills-counter', (this.index + 1) + ' / ' + this.queue.length + (this.onlyWrong ? '（错题本）' : '')));
      box.appendChild(meta);
      box.appendChild(UI.el('div', 'drills-q', d.q));
      if (d.code) box.appendChild(UI.codeBlock('这段代码的输出是？', d.code));

      var optBox = UI.el('div', 'drills-options');
      var letters = ['A', 'B', 'C', 'D'];
      d.options.forEach(function (opt, i) {
        var b = UI.el('button', 'drills-option');
        b.type = 'button';
        b.appendChild(UI.el('span', 'drills-letter', letters[i]));
        var body = UI.el('span', 'drills-option-text');
        body.textContent = opt;
        b.appendChild(body);
        if (self.answeredThis) {
          if (i === d.answer) b.classList.add('correct');
          if (i === self.selected && i !== d.answer) b.classList.add('wrong');
          b.disabled = true;
        } else {
          b.addEventListener('click', function () { self.answer(i); });
        }
        optBox.appendChild(b);
      });
      box.appendChild(optBox);

      if (this.answeredThis) {
        var ok = this.selected === d.answer;
        var fb = UI.el('div', 'drills-feedback ' + (ok ? 'ok' : 'bad'));
        fb.appendChild(UI.el('div', 'drills-fb-title', ok ? '✅ 答对啦！' : '❌ 不对哦，正确答案是 ' + letters[d.answer] + '。'));
        fb.appendChild(UI.el('div', 'drills-explain', d.explain));
        box.appendChild(fb);
        var nextBtn = UI.el('button', 'btn primary', this.index + 1 < this.queue.length ? '下一题 →' : '再来一轮 →');
        nextBtn.type = 'button';
        nextBtn.addEventListener('click', function () { self.next(); });
        box.appendChild(nextBtn);
      } else {
        box.appendChild(UI.el('div', 'drills-hint', '点击选项作答；也可以按键盘 1 / 2 / 3 / 4。'));
      }
    },

    answer: function (i) {
      if (this.answeredThis) return;
      var d = this.current();
      if (!d || i < 0 || i > 3) return;
      var st = this.state();
      this.selected = i;
      this.answeredThis = true;
      var ok = i === d.answer;
      var prev = st.answered[d.id];
      st.answered[d.id] = { ok: ok, tries: (prev && prev.tries ? prev.tries : 0) + 1 };
      st.total = (st.total || 0) + 1;
      if (ok) {
        st.streak = (st.streak || 0) + 1;
        st.best = Math.max(st.best || 0, st.streak);
        delete st.wrong[d.id];
        CC.App.addXp(1);
        if (st.streak % 5 === 0) CC.App.addFish(1);
        if (st.streak === 10 && CC.FX) {
          CC.FX.celebrate({ title: '🔥 连对 10 题！', subtitle: '你对标准库越来越熟了', count: 18, exitLabel: '继续刷题' });
        }
      } else {
        st.streak = 0;
        st.wrong[d.id] = true;
      }
      CC.App.save();
      this.renderQuestion();
      this.renderStats();
    },

    next: function () {
      if (!this.answeredThis) return;
      this.index++;
      if (this.index >= this.queue.length) {
        this.index = 0;
        this.queue = this.shuffle(this.queue);
      }
      this.selected = null;
      this.answeredThis = false;
      this.renderQuestion();
    },

    renderStats: function () {
      if (!this.statsEl) return;
      var self = this;
      var st = this.state();
      var all = CC.DRILLS || [];
      var answeredIds = Object.keys(st.answered);
      var correct = answeredIds.filter(function (id) { return st.answered[id].ok; }).length;
      var acc = answeredIds.length ? Math.round(correct / answeredIds.length * 100) : 0;
      UI.clear(this.statsEl);
      [['已答题', answeredIds.length + ' / ' + all.length],
        ['正确率', acc + '%'],
        ['当前连对', (st.streak || 0) + ' 题'],
        ['最高连对', (st.best || 0) + ' 题'],
        ['错题本', Object.keys(st.wrong).length + ' 题']].forEach(function (r) {
        var row = UI.el('div', 'kv');
        row.appendChild(UI.el('span', null, r[0]));
        row.appendChild(UI.el('b', null, r[1]));
        UI.el('div');
        this.statsEl.appendChild(row);
      }, this);

      UI.clear(this.chaptersEl);
      HEADERS.filter(function (h) { return h.id !== 'all'; }).forEach(function (h) {
        var list = all.filter(function (d) { return d.header === h.id; });
        var done = list.filter(function (d) { return st.answered[d.id]; }).length;
        var ok = list.filter(function (d) { return st.answered[d.id] && st.answered[d.id].ok; }).length;
        var row = UI.el('div', 'drills-chapter');
        var top = UI.el('div', 'drills-chapter-top');
        top.appendChild(UI.el('span', null, h.label));
        top.appendChild(UI.el('span', 'drills-chapter-num', ok + '✓ / ' + done + ' / ' + list.length));
        row.appendChild(top);
        var bar = UI.el('div', 'pz-progress');
        var fill = UI.el('div', 'pz-progress-fill');
        fill.style.width = (list.length ? Math.round(done / list.length * 100) : 0) + '%';
        bar.appendChild(fill);
        row.appendChild(bar);
        this.chaptersEl.appendChild(row);
      }, this);

      UI.clear(this.wrongEl);
      var wrongIds = Object.keys(st.wrong);
      if (!wrongIds.length) {
        this.wrongEl.appendChild(UI.el('div', 'pz-small', '还没有错题，继续保持～'));
      } else {
        wrongIds.forEach(function (id) {
          var d = null;
          all.forEach(function (x) { if (x.id === id) d = x; });
          if (!d) return;
          var b = UI.el('button', 'drills-wrong-item');
          b.type = 'button';
          b.appendChild(UI.el('span', 'tag', d.header));
          b.appendChild(UI.el('span', null, d.q.slice(0, 34) + (d.q.length > 34 ? '…' : '')));
          b.addEventListener('click', function () {
            self.queue = [d];
            self.index = 0;
            self.onlyWrong = true;
            self.selected = null;
            self.answeredThis = false;
            self.renderQuestion();
            self.renderStats();
          });
          self.wrongEl.appendChild(b);
        });
      }
      if (this.streakEl) {
        this.streakEl.textContent = '🔥 连对 ' + (st.streak || 0) + '　🏆 最高 ' + (st.best || 0);
      }
    },

    enter: function () {
      this.build();
      if (!this.queue.length) this.startQueue(false);
      this.renderQuestion();
      this.renderStats();
    }
  };

  CC.DrillsView = Drills;
})(typeof globalThis !== 'undefined' ? globalThis : this);
