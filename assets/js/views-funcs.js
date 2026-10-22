/*!
 * 粉猫捉虫 · C 函数手册界面
 * 搜索 / 按头文件筛选 / 只看本站能跑的 / 详情 / 一键打开示例
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var doc = root.document;
  var UI = CC.UI;

  var FuncView = {
    built: false,
    q: '',
    header: null,
    mode: 'all',
    current: null,
    ui: {},

    build: function () {
      if (this.built) return;
      var host = doc.getElementById('funcs-root');
      if (!host) return;
      UI.clear(host);
      var self = this;
      var layout = UI.el('div', 'func-layout');

      // 左：头文件
      var left = UI.el('aside', 'func-left');
      var hcard = UI.el('div', 'side-card');
      hcard.appendChild(UI.el('div', 'side-title', '头文件 / 分类'));
      var hlist = UI.el('div', 'func-headers');
      var allBtn = UI.el('button', 'func-header-item all');
      allBtn.type = 'button';
      allBtn.innerHTML = '<b>📚 全部函数</b><small>按名字搜索，或者点下面的头文件</small>';
      allBtn.addEventListener('click', function () { self.header = null; self.render(); });
      hlist.appendChild(allBtn);
      var headers = CC.FUNC_HEADERS || {};
      Object.keys(headers).forEach(function (id) {
        var h = headers[id];
        var b = UI.el('button', 'func-header-item');
        b.type = 'button';
        b.appendChild(UI.el('b', null, (h.icon || '📄') + ' ' + id));
        var cnt = (CC.FUNCS || []).filter(function (f) { return f.header === id; }).length;
        b.appendChild(UI.el('small', null, h.title + ' · ' + (cnt ? (cnt + ' 个函数') : '头文件说明')));
        b.addEventListener('click', function () { self.header = id; self.render(); });
        hlist.appendChild(b);
      });
      hcard.appendChild(hlist);
      left.appendChild(hcard);
      layout.appendChild(left);

      // 中：搜索 + 列表
      var main = UI.el('div', 'func-main');
      var searchCard = UI.el('div', 'card func-search-card');
      var input = UI.el('input', 'func-search');
      input.type = 'search';
      input.placeholder = '搜函数名 / 作用 / 头文件，例如 strlen、随机数、math';
      input.addEventListener('input', function () { self.q = input.value.trim().toLowerCase(); self.renderList(); });
      searchCard.appendChild(input);
      var chips = UI.el('div', 'func-chips');
      [['all', '全部'], ['supported', '✅ 本站能直接跑'], ['unsupported', '⚠️ 需要真编译器'], ['common', '⭐ 最常用']].forEach(function (c) {
        var b = UI.el('button', 'func-chip' + (self.mode === c[0] ? ' on' : ''), c[1]);
        b.type = 'button';
        b.setAttribute('data-mode', c[0]);
        b.addEventListener('click', function () { self.mode = c[0]; self.syncChips(); self.renderList(); });
        chips.appendChild(b);
      });
      searchCard.appendChild(chips);
      self.countEl = UI.el('div', 'func-count', '');
      searchCard.appendChild(self.countEl);
      main.appendChild(searchCard);

      self.headerInfo = UI.el('div', 'func-header-info hidden');
      main.appendChild(self.headerInfo);

      self.listEl = UI.el('div', 'func-list');
      main.appendChild(self.listEl);
      layout.appendChild(main);

      // 右：详情
      var right = UI.el('aside', 'func-right');
      self.detailEl = UI.el('div', 'side-card func-detail');
      self.detailEl.appendChild(UI.el('div', 'pz-small', '← 点左边的函数，这里会显示原型、参数、返回值、坑和示例。'));
      right.appendChild(self.detailEl);
      layout.appendChild(right);

      host.appendChild(layout);
      this.built = true;
      this.ui = { list: self.listEl, detail: self.detailEl, count: self.countEl, headers: hlist };
      this.render();
    },

    syncChips: function () {
      var chips = doc.querySelectorAll('.func-chip');
      for (var i = 0; i < chips.length; i++) {
        chips[i].classList.toggle('on', chips[i].getAttribute('data-mode') === this.mode);
      }
    },

    render: function () {
      if (!this.ui.list) return;
      this.renderList();
      this.renderHeaderInfo();
      if (this.current) this.open(this.current);
    },

    renderHeaderInfo: function () {
      var box = this.headerInfo;
      if (!box) return;
      UI.clear(box);
      if (!this.header) { box.classList.add('hidden'); return; }
      var h = (CC.FUNC_HEADERS || {})[this.header];
      if (!h) { box.classList.add('hidden'); return; }
      box.classList.remove('hidden');
      var card = UI.el('div', 'card func-header-detail');
      card.appendChild(UI.el('h3', null, (h.icon || '📄') + ' ' + h.id + ' · ' + h.title));
      card.appendChild(UI.el('p', null, h.summary));
      card.appendChild(UI.el('p', 'tiny muted', '什么时候用：' + h.when));
      if (h.tips && h.tips.length) {
        var ul = UI.el('ul', 'func-tips');
        h.tips.forEach(function (t) { ul.appendChild(UI.el('li', null, t)); });
        card.appendChild(ul);
      }
      if (h.table) {
        card.appendChild(UI.el('div', 'tiny muted', h.table.title || ''));
        var table = UI.el('table', 'data func-table');
        var thead = UI.el('thead');
        var tr = UI.el('tr');
        h.table.head.forEach(function (c) { tr.appendChild(UI.el('th', null, c)); });
        thead.appendChild(tr);
        table.appendChild(thead);
        var tbody = UI.el('tbody');
        h.table.rows.forEach(function (row) {
          var r = UI.el('tr');
          row.forEach(function (c) { r.appendChild(UI.el('td', null, c)); });
          tbody.appendChild(r);
        });
        table.appendChild(tbody);
        card.appendChild(table);
      }
      box.appendChild(card);
    },

    filtered: function () {
      var self = this;
      var q = this.q;
      return (CC.FUNCS || []).filter(function (f) {
        if (self.header && f.header !== self.header) return false;
        if (self.mode === 'supported' && !f.supported) return false;
        if (self.mode === 'unsupported' && f.supported) return false;
        if (self.mode === 'common' && (f.tags || []).indexOf('最常用') < 0) return false;
        if (!q) return true;
        var hay = [f.name, f.header, f.brief, f.proto, (f.tags || []).join(' '), (f.notes || []).join(' ')].join(' ').toLowerCase();
        return hay.indexOf(q) >= 0;
      });
    },

    renderList: function () {
      var self = this;
      var list = this.filtered();
      if (this.ui.count) {
        this.ui.count.textContent = '共 ' + list.length + ' 个' + (this.q ? ('（搜索：' + this.q + '）') : '');
      }
      UI.clear(this.ui.list);
      if (!list.length) {
        this.ui.list.appendChild(UI.el('div', 'card center muted', '没有找到匹配的函数。换个关键词试试？'));
        return;
      }
      list.forEach(function (f) {
        var card = UI.el('button', 'func-card' + (self.current === f.id ? ' on' : ''));
        card.type = 'button';
        var top = UI.el('div', 'func-card-top');
        top.appendChild(UI.el('b', null, f.name));
        top.appendChild(UI.el('span', 'func-badge' + (f.supported ? ' ok' : ' warn'), f.supported ? '✅ 可运行' : '⚠️ 真编译器'));
        card.appendChild(top);
        card.appendChild(UI.el('div', 'func-card-brief', f.brief));
        var meta = UI.el('div', 'func-card-meta');
        meta.appendChild(UI.el('span', 'tag', f.header));
        (f.tags || []).slice(0, 2).forEach(function (t) { meta.appendChild(UI.el('span', 'tag pink', t)); });
        card.appendChild(meta);
        card.addEventListener('click', function () { self.open(f.id); });
        self.ui.list.appendChild(card);
      });
    },

    open: function (id) {
      var self = this;
      var f = null;
      (CC.FUNCS || []).forEach(function (x) { if (x.id === id) f = x; });
      if (!f) return;
      this.current = id;
      // 列表高亮
      var cards = this.ui.list.querySelectorAll('.func-card');
      for (var i = 0; i < cards.length; i++) cards[i].classList.remove('on');
      var box = this.ui.detail;
      UI.clear(box);
      var head = UI.el('div', 'func-detail-head');
      head.appendChild(UI.el('h3', null, f.name));
      head.appendChild(UI.el('span', 'func-badge' + (f.supported ? ' ok' : ' warn'), f.supported ? '✅ 本站可直接运行' : '⚠️ 需要用真正的编译器'));
      box.appendChild(head);
      var meta = UI.el('div', 'row');
      meta.appendChild(UI.el('span', 'tag', f.header));
      if (f.kind === 'macro') meta.appendChild(UI.el('span', 'tag star', '宏 / 常量'));
      if (f.kind === 'operator') meta.appendChild(UI.el('span', 'tag star', '运算符'));
      (f.tags || []).forEach(function (t) { meta.appendChild(UI.el('span', 'tag pink', t)); });
      box.appendChild(meta);
      box.appendChild(UI.el('p', null, f.brief));

      var protoBox = UI.el('div', 'func-proto');
      protoBox.textContent = f.proto;
      box.appendChild(protoBox);

      function field(title, text) {
        if (!text) return;
        var d = UI.el('div', 'func-field');
        d.appendChild(UI.el('div', 'func-field-title', title));
        d.appendChild(UI.el('div', 'func-field-body', text));
        box.appendChild(d);
      }
      field('参数', f.params);
      field('返回值', f.returns);
      if (f.notes && f.notes.length) {
        var notes = UI.el('div', 'func-field');
        notes.appendChild(UI.el('div', 'func-field-title', '要点 / 常见坑'));
        var ul = UI.el('ul', 'func-tips');
        f.notes.forEach(function (n) { ul.appendChild(UI.el('li', null, n)); });
        notes.appendChild(ul);
        box.appendChild(notes);
      }

      box.appendChild(UI.el('div', 'func-field-title', '例子'));
      box.appendChild(UI.codeBlock(f.name + ' 示例', f.example));
      var actions = UI.el('div', 'func-actions');
      var copy = UI.el('button', 'btn small', '📋 复制代码');
      copy.type = 'button';
      copy.addEventListener('click', function () {
        try {
          if (root.navigator && root.navigator.clipboard) {
            root.navigator.clipboard.writeText(f.example);
            copy.textContent = '已复制 ✓';
            setTimeout(function () { copy.textContent = '📋 复制代码'; }, 1200);
          }
        } catch (e) { }
      });
      actions.appendChild(copy);
      if (f.supported) {
        var run = UI.el('button', 'btn small primary', '▶ 在练习场打开');
        run.type = 'button';
        run.addEventListener('click', function () {
          CC.CodeStore.set('playground', f.example);
          UI.showView('playground');
          setTimeout(function () {
            if (CC.UI.pgEditor) CC.UI.pgEditor.setValue(f.example);
            var st = doc.getElementById('pg-stdin');
            if (st) st.value = f.demoStdin || '';
          }, 60);
        });
        actions.appendChild(run);
      } else {
        var why = UI.el('span', 'tiny muted', '需要文件 / 内存 / 结构体等进阶能力，请用 gcc、Dev-C++ 或 VS Code 练习。');
        actions.appendChild(why);
      }
      var aiMore = UI.el('button', 'btn small', '🤖 让 AI 讲细一点');
      aiMore.type = 'button';
      aiMore.addEventListener('click', function () {
        if (!CC.ApiView || !CC.ApiView.ensure()) return;
        CC.ApiView.ask({
          title: '🤖 ' + f.name + ' 深入讲解',
          system: '你是 C 语言助教，用简体中文回答，最多 8 行。只讲标准 C 里真实存在的行为，不要编造标准库函数。',
          prompt: '请结合这个函数讲细一点：\n名称：' + f.name + '\n头文件：' + f.header + '\n原型：' + f.proto + '\n作用：' + f.brief + '\n注意：' + ((f.notes || []).join('；')) + '\n请给 1 个容易踩的坑和 1 个简短例子。'
        });
      });
      actions.appendChild(aiMore);
      box.appendChild(actions);

      if (f.related && f.related.length) {
        var rel = UI.el('div', 'func-related');
        rel.appendChild(UI.el('span', 'tiny muted', '相关：'));
        f.related.forEach(function (name) {
          var target = null;
          (CC.FUNCS || []).forEach(function (x) { if (x.name === name) target = x; });
          var b = UI.el('button', 'func-rel', name);
          b.type = 'button';
          if (target) b.addEventListener('click', function () { self.open(target.id); });
          else b.disabled = true;
          rel.appendChild(b);
        });
        box.appendChild(rel);
      }
      // 列表里高亮当前项
      var allCards = this.ui.list.querySelectorAll('.func-card');
      for (var k = 0; k < allCards.length; k++) {
        if (allCards[k].textContent.indexOf(f.name) === 0) allCards[k].classList.add('on');
      }
    },

    enter: function () {
      this.build();
      this.render();
      if (!this.current) this.open('printf');
    }
  };

  CC.FuncView = FuncView;
})(typeof globalThis !== 'undefined' ? globalThis : this);