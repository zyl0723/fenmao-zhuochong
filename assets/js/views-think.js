/*!
 * 粉猫捉虫 · 思维训练（题目 + 流程图 + 代码）
 * 复用流程图引擎（CC.FlowView）的画布能力，但整个流程围绕「题目」：
 * 读题 → 画流程图 → 检查思路 → 看参考 → 写代码
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var doc = root.document;
  var UI = CC.UI;

  var Think = Object.create(CC.FlowView);
  Think.problems = CC.THINK_PROBLEMS || [];
  Think.problemId = null;
  Think.built = false;
  Think.history = [];
  Think.future = [];
  Think.selected = null;
  Think.mode = 'select';
  Think.connectFrom = null;
  Think.drag = null;
  Think.name = '思维训练';
  Think.currentId = null;
  Think.STORAGE = 'fenmao-think-flows';

  Think.readAll = function () {
    try {
      var raw = root.localStorage.getItem(this.STORAGE);
      var d = raw ? JSON.parse(raw) : {};
      return d && typeof d === 'object' ? d : {};
    } catch (e) { return {}; }
  };
  Think.writeAll = function (all) {
    try { root.localStorage.setItem(this.STORAGE, JSON.stringify(all)); } catch (e) { }
  };
  Think.saveDraft = function () {
    if (!this.problemId) return;
    var all = this.readAll();
    all[this.problemId] = { nodes: this.nodes, edges: this.edges, updatedAt: Date.now() };
    this.writeAll(all);
    this.renderList();
  };
  Think.passed = function (id) {
    return !!(CC.App.state.thinkPassed && CC.App.state.thinkPassed[id]);
  };
  Think.markPassed = function (id) {
    CC.App.state.thinkPassed = CC.App.state.thinkPassed || {};
    var first = !CC.App.state.thinkPassed[id];
    CC.App.state.thinkPassed[id] = true;
    CC.App.addFish(2);
    CC.App.addXp(10);
    CC.App.save();
    this.renderList();
    return first;
  };
  Think.problemById = function (id) {
    for (var i = 0; i < this.problems.length; i++) if (this.problems[i].id === id) return this.problems[i];
    return null;
  };
  Think.findTask = function (taskId) {
    var found = null;
    (CC.App.lessons || []).forEach(function (l) {
      l.tasks.forEach(function (t) { if (t.id === taskId) found = t; });
    });
    (CC.App.bugs || []).forEach(function (b) { if (b.id === taskId) found = b; });
    return found;
  };
  Think.referenceOf = function (problem) {
    if (problem.reference) return problem.reference;
    if (problem.referenceTemplate) {
      var tpls = CC.FLOW_TEMPLATES || [];
      for (var i = 0; i < tpls.length; i++) {
        if (tpls[i].id === problem.referenceTemplate) return { nodes: tpls[i].nodes, edges: tpls[i].edges };
      }
    }
    return null;
  };

  // ---------- 检查「思路」 ----------
  Think.countCycles = function () {
    var byId = {};
    this.nodes.forEach(function (n) { byId[n.id] = n; });
    var out = {};
    this.edges.forEach(function (e) { (out[e.from] = out[e.from] || []).push(e.to); });
    var color = {};
    var backEdges = 0;
    var self = this;
    function dfs(id) {
      color[id] = 1;
      (out[id] || []).forEach(function (to) {
        if (!byId[to]) return;
        if (color[to] === 1) backEdges++;
        else if (!color[to]) dfs(to);
      });
      color[id] = 2;
    }
    this.nodes.forEach(function (n) { if (!color[n.id]) dfs(n.id); });
    return backEdges;
  };

  Think.check = function (problem) {
    var issues = [];
    var good = [];
    var nodes = this.nodes;
    var edges = this.edges;
    var needs = problem.needs || {};
    var self = this;
    function label(n) { return n.text || '（没写字的框）'; }
    if (!nodes.length) {
      issues.push('画布还是空的：先放一个「开始」，再一步步往下画。');
      return { ok: false, issues: issues, good: good };
    }
    var sorted = nodes.slice().sort(function (a, b) { return a.y - b.y; });
    var start = null;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].type === 'start' && /开始/.test(nodes[i].text)) { start = nodes[i]; break; }
    }
    if (!start) start = nodes.filter(function (n) { return n.type === 'start'; })[0] || null;
    var ends = nodes.filter(function (n) { return n.type === 'start' && /结束/.test(n.text); });
    if (!start) issues.push('缺少「开始」：流程要有一个起点。');
    if (!ends.length) issues.push('缺少「结束」：每条路最后都要走到结束。');
    if (nodes.length < (needs.minNodes || 3)) {
      issues.push('步骤太少了（现在 ' + nodes.length + ' 个）：把读入、处理、输出拆成单独的框，至少 ' + (needs.minNodes || 3) + ' 个。');
    }
    var decisions = nodes.filter(function (n) { return n.type === 'decision'; });
    if (decisions.length < (needs.decisions || 0)) {
      issues.push('这道题需要 ' + needs.decisions + ' 个判断（菱形），你现在画了 ' + decisions.length + ' 个。');
    }
    var outCount = {}, inCount = {};
    edges.forEach(function (e) {
      outCount[e.from] = (outCount[e.from] || 0) + 1;
      inCount[e.to] = (inCount[e.to] || 0) + 1;
    });
    nodes.forEach(function (n) {
      var isEnd = n.type === 'start' && /结束/.test(n.text);
      if (!isEnd && !outCount[n.id]) issues.push('「' + label(n) + '」后面还没有箭头：流程走到这里就断了。');
      if (n !== start && !inCount[n.id]) issues.push('「' + label(n) + '」没有入口箭头：它和流程没连起来。');
    });
    decisions.forEach(function (d) {
      var outs = edges.filter(function (e) { return e.from === d.id; });
      if (outs.length < 2) {
        issues.push('判断「' + label(d) + '」只有一条出口：判断应该分成「是」和「否」两条路。');
      } else if (!outs.some(function (e) { return e.label === '是'; }) || !outs.some(function (e) { return e.label === '否'; })) {
        issues.push('判断「' + label(d) + '」的两条出口要标上「是 / 否」：点一下箭头就能设置。');
      }
    });
    var cycles = this.countCycles();
    if (needs.loop && cycles === 0) {
      issues.push('这道题需要循环：要有一条箭头绕回上面的判断。');
    }
    if (needs.cycles && cycles < needs.cycles) {
      issues.push('这道题有 ' + needs.cycles + ' 层循环，你画出了 ' + cycles + ' 个循环。再想想哪一层还需要重复。');
    }
    if (!needs.loop && cycles > 0) {
      good.push('你加了循环——这道题不是必须，但也可以。');
    }
    var allText = nodes.map(function (n) { return n.text || ''; }).join(' ').toLowerCase();
    (needs.keywords || []).forEach(function (group) {
      var hit = group.some(function (k) { return allText.indexOf(String(k).toLowerCase()) >= 0; });
      if (!hit) issues.push('好像少了「' + group[0] + '」这一步：检查流程里有没有写它。');
    });
    if (!issues.length) {
      good.push('有开始、有结束，所有框都连起来了。');
      if (decisions.length) good.push('判断分成了「是 / 否」两条路。');
      if (cycles) good.push('用箭头绕回去，形成了循环。');
      good.push('思路过关！下一步：照着流程图把它翻译成 C 代码。');
    }
    return { ok: issues.length === 0, issues: issues, good: good, cycles: cycles, decisions: decisions.length };
  };  Think.build = function () {
    if (this.built) return;
    var host = doc.getElementById('flow-root');
    if (!host) return;
    UI.clear(host);
    var self = this;
    var layout = UI.el('div', 'think-layout');

    // 左：题目列表
    var left = UI.el('aside', 'think-left');
    var listCard = UI.el('div', 'side-card');
    listCard.appendChild(UI.el('div', 'side-title', '思维训练 · 先想后写'));
    self.progressEl = UI.el('div', 'think-progress', '');
    listCard.appendChild(self.progressEl);
    self.listEl = UI.el('div', 'think-list');
    listCard.appendChild(self.listEl);
    left.appendChild(listCard);
    layout.appendChild(left);

    // 中：题目 + 画布
    var main = UI.el('main', 'think-main');
    self.problemEl = UI.el('div', 'card think-problem');
    main.appendChild(self.problemEl);

    var bar = UI.el('div', 'think-toolbar');
    ['start', 'process', 'decision', 'io'].forEach(function (t) {
      var b = UI.el('button', 'flow-tool think-tool');
      b.type = 'button';
      b.appendChild(UI.el('span', 'flow-tool-shape flow-shape-' + t));
      b.appendChild(UI.el('span', null, '+ ' + (t === 'start' ? '开始/结束' : (t === 'io' ? '输入/输出' : (t === 'process' ? '处理' : '判断')))));
      b.addEventListener('click', function () { self.addNode(t); });
      bar.appendChild(b);
    });
    self.connectBtn = UI.el('button', 'btn small', '🔗 连线');
    self.connectBtn.type = 'button';
    self.connectBtn.addEventListener('click', function () { self.toggleConnect(); });
    bar.appendChild(self.connectBtn);
    [['↶', function () { self.undo(); }, '撤销'], ['↷', function () { self.redo(); }, '重做'], ['🗑', function () { self.removeSelected(); }, '删除选中']].forEach(function (x) {
      var b = UI.el('button', 'btn small', x[0]);
      b.type = 'button';
      b.title = x[2];
      b.addEventListener('click', x[1]);
      bar.appendChild(b);
    });
    main.appendChild(bar);

    var wrap = UI.el('div', 'flow-canvas-wrap card think-canvas-wrap');
    var canvas = UI.el('canvas', 'flow-canvas');
    canvas.width = 1400 * 2;
    canvas.height = 900 * 2;
    canvas.style.width = '1400px';
    canvas.style.height = '900px';
    wrap.appendChild(canvas);
    main.appendChild(wrap);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.wrapEl = wrap;
    this.dpr = 2;
    this.bindCanvas();
    layout.appendChild(main);

    // 右：检查 / 参考 / 代码 / 教学
    var side = UI.el('aside', 'think-side');
    var stepCard = UI.el('div', 'side-card');
    stepCard.appendChild(UI.el('div', 'side-title', '四步走'));
    var steps = UI.el('ol', 'think-steps');
    ['读题：看清输入、输出和例子。', '画图：开始 → 读入 → 处理 / 判断 → 输出 → 结束。',
      '检查：点「检查我的思路」，把红色问题一个个解决。', '写代码：点「去写代码」，照着图翻译成 C。'].forEach(function (t) {
      steps.appendChild(UI.el('li', null, t));
    });
    stepCard.appendChild(steps);
    var checkBtn = UI.el('button', 'btn primary wide', '🔍 检查我的思路');
    checkBtn.type = 'button';
    checkBtn.addEventListener('click', function () { self.runCheck(); });
    stepCard.appendChild(checkBtn);
    self.resultEl = UI.el('div', 'think-result', '');
    stepCard.appendChild(self.resultEl);
    var actions = UI.el('div', 'think-actions');
    var refBtn = UI.el('button', 'btn small', '👀 看参考流程图');
    refBtn.type = 'button';
    refBtn.addEventListener('click', function () { self.showReference(); });
    actions.appendChild(refBtn);
    var codeBtn = UI.el('button', 'btn small primary', '✍️ 去写代码');
    codeBtn.type = 'button';
    codeBtn.addEventListener('click', function () { self.openCode(); });
    actions.appendChild(codeBtn);
    var resetBtn = UI.el('button', 'btn small ghost', '↺ 重新画');
    resetBtn.type = 'button';
    resetBtn.addEventListener('click', function () {
      if (!root.confirm('清空这道题的流程图，从头开始画？')) return;
      self.pushHistory();
      self.nodes = [{ id: 's' + Date.now().toString(36), type: 'start', x: 560, y: 40, text: '开始' }];
      self.edges = [];
      self.selected = null;
      self.render();
      self.renderProps();
      self.saveDraft();
      self.resultEl.textContent = '';
    });
    actions.appendChild(resetBtn);
    stepCard.appendChild(actions);
    side.appendChild(stepCard);

    var propCard = UI.el('div', 'side-card');
    propCard.appendChild(UI.el('div', 'side-title', '选中的图形'));
    self.propBox = UI.el('div', 'flow-prop');
    propCard.appendChild(self.propBox);
    side.appendChild(propCard);

    var teachCard = UI.el('div', 'side-card');
    teachCard.appendChild(UI.el('div', 'side-title', '这一题在练什么'));
    self.teachEl = UI.el('div', 'think-teach', '');
    teachCard.appendChild(self.teachEl);
    var tipsEl = UI.el('ul', 'flow-tips');
    self.tipsEl = tipsEl;
    teachCard.appendChild(tipsEl);
    var genBtn = UI.el('button', 'btn small wide', '🧩 从我的流程图生成提纲');
    genBtn.type = 'button';
    genBtn.addEventListener('click', function () { self.generate(); });
    teachCard.appendChild(genBtn);
    self.outlineBox = UI.el('pre', 'flow-outline', '画好之后可以点上面的按钮，生成思路提纲和 C 代码骨架。');
    teachCard.appendChild(self.outlineBox);
    side.appendChild(teachCard);
    layout.appendChild(side);

    host.appendChild(layout);
    this.built = true;
    this.renderProps();
    if (this.problems.length) this.selectProblem(this.problemId || this.problems[0].id);
  };

  Think.selectProblem = function (id) {
    if (!this.built) return;
    if (this.problemId) this.saveDraft();
    var p = this.problemById(id);
    if (!p) return;
    this.problemId = id;
    var all = this.readAll();
    var saved = all[id];
    if (saved && saved.nodes && saved.nodes.length) {
      this.nodes = JSON.parse(JSON.stringify(saved.nodes));
      this.edges = JSON.parse(JSON.stringify(saved.edges || []));
    } else {
      this.nodes = [{ id: 's' + Date.now().toString(36), type: 'start', x: 560, y: 40, text: '开始' }];
      this.edges = [];
    }
    this.name = p.title;
    this.selected = null;
    this.mode = 'select';
    this.connectFrom = null;
    this.history = [];
    this.future = [];
    if (this.connectBtn) {
      this.connectBtn.classList.remove('primary');
      this.connectBtn.textContent = '🔗 连线';
    }
    this.renderProblem();
    this.renderList();
    this.resultEl.textContent = '';
    this.outlineBox.textContent = '画好之后可以点上面的按钮，生成思路提纲和 C 代码骨架。';
    this.render();
    this.renderProps();
    this.centerCanvas();
  };

  Think.renderProblem = function () {
    var p = this.problemById(this.problemId);
    if (!p) return;
    var self = this;
    UI.clear(this.problemEl);
    var head = UI.el('div', 'think-problem-head');
    head.appendChild(UI.el('h2', null, p.title));
    head.appendChild(UI.el('span', 'tag star', new Array((p.difficulty || 1) + 1).join('★')));
    var task = this.findTask(p.taskId);
    if (task) head.appendChild(UI.el('span', 'tag', '代码练习：' + task.title.replace(/^任务 \d+：/, '')));
    this.problemEl.appendChild(head);
    this.problemEl.appendChild(UI.el('div', 'think-brief', p.brief));
    if (p.examples && p.examples.length) {
      var table = UI.el('table', 'data think-examples');
      var thead = UI.el('thead');
      var tr = UI.el('tr');
      tr.appendChild(UI.el('th', null, '输入'));
      tr.appendChild(UI.el('th', null, '输出'));
      thead.appendChild(tr);
      table.appendChild(thead);
      var tbody = UI.el('tbody');
      p.examples.forEach(function (ex) {
        var r = UI.el('tr');
        r.appendChild(UI.el('td', null, ex[0]));
        r.appendChild(UI.el('td', null, ex[1]));
        tbody.appendChild(r);
      });
      table.appendChild(tbody);
      this.problemEl.appendChild(table);
    }
    var need = UI.el('div', 'row');
    need.appendChild(UI.el('span', 'tag pink', '至少 ' + (p.needs.minNodes || 3) + ' 个框'));
    if (p.needs.decisions) need.appendChild(UI.el('span', 'tag pink', '判断 × ' + p.needs.decisions));
    if (p.needs.loop) need.appendChild(UI.el('span', 'tag pink', '需要循环'));
    if (p.needs.cycles) need.appendChild(UI.el('span', 'tag pink', '循环 × ' + p.needs.cycles));
    this.problemEl.appendChild(need);

    UI.clear(this.teachEl);
    this.teachEl.textContent = p.teach || '';
    UI.clear(this.tipsEl);
    (p.hints || []).forEach(function (h) { self.tipsEl.appendChild(UI.el('li', null, h)); });
  };

  Think.renderList = function () {
    var self = this;
    if (!this.listEl) return;
    UI.clear(this.listEl);
    var flowOk = 0, codeOk = 0;
    this.problems.forEach(function (p) {
      var fo = self.passed(p.id);
      var co = CC.App.isTaskDone(p.taskId);
      if (fo) flowOk++;
      if (co) codeOk++;
      var card = UI.el('button', 'think-item' + (self.problemId === p.id ? ' on' : ''));
      card.type = 'button';
      var top = UI.el('div', 'think-item-top');
      top.appendChild(UI.el('b', null, p.title));
      top.appendChild(UI.el('span', 'think-star', new Array((p.difficulty || 1) + 1).join('★')));
      card.appendChild(top);
      var tags = UI.el('div', 'think-item-tags');
      if (fo) tags.appendChild(UI.el('span', 'tag done', '思路 ✓'));
      if (co) tags.appendChild(UI.el('span', 'tag done', '代码 ✓'));
      if (!fo && !co) tags.appendChild(UI.el('span', 'tag', '还没开始'));
      card.appendChild(tags);
      card.addEventListener('click', function () { self.selectProblem(p.id); });
      self.listEl.appendChild(card);
    });
    if (this.progressEl) this.progressEl.textContent = '思路通过 ' + flowOk + ' / ' + this.problems.length + '　代码通过 ' + codeOk + ' / ' + this.problems.length;
  };  Think.runCheck = function () {
    var p = this.problemById(this.problemId);
    if (!p) return;
    var r = this.check(p);
    UI.clear(this.resultEl);
    var box = UI.el('div', 'think-check ' + (r.ok ? 'ok' : 'bad'));
    if (r.ok) {
      var first = this.markPassed(p.id);
      box.appendChild(UI.el('div', 'think-check-title', '🧠 思路过关！'));
      r.good.forEach(function (g) { box.appendChild(UI.el('div', 'think-good', '✓ ' + g)); });
      box.appendChild(UI.el('div', 'think-next', '下一步：点下面的「✍️ 去写代码」，把这张图翻译成 C。'));
      if (first && CC.FX) {
        CC.FX.celebrate({ title: '🧠 思路过关！', subtitle: p.title + '　🐟 +2　⭐ +10', count: 22, exitLabel: '去写代码' });
      }
    } else {
      box.appendChild(UI.el('div', 'think-check-title', '还差 ' + r.issues.length + ' 处，按顺序改：'));
      r.issues.forEach(function (msg) { box.appendChild(UI.el('div', 'think-issue', '• ' + msg)); });
      if (r.good.length) r.good.forEach(function (g) { box.appendChild(UI.el('div', 'think-good', '✓ ' + g)); });
      box.appendChild(UI.el('div', 'think-next', '看不出来哪里不对？点「👀 看参考流程图」对一对，再回来改自己的。'));
    }
    this.resultEl.appendChild(box);
    this.saveDraft();
  };

  Think.showReference = function () {
    var self = this;
    var p = this.problemById(this.problemId);
    if (!p) return;
    var ref = this.referenceOf(p);
    if (!ref) { UI.toast('这道题还没有参考流程图', '先自己画一画吧～'); return; }
    var task = this.findTask(p.taskId);
    var back = UI.el('div', 'fx-comfort-back');
    var card = UI.el('div', 'fx-comfort-card think-ref-card');
    card.appendChild(UI.el('h3', 'fx-comfort-title', '👀 参考流程图：' + p.title));
    card.appendChild(UI.el('div', 'pz-small', '参考只是其中一种画法。你的画法只要逻辑对、能走通，就可以。'));
    var canvas = UI.el('canvas', 'think-ref-canvas');
    canvas.width = 1400;
    canvas.height = 900;
    card.appendChild(canvas);
    var tmp = Object.create(CC.FlowView);
    tmp.nodes = JSON.parse(JSON.stringify(ref.nodes));
    tmp.edges = JSON.parse(JSON.stringify(ref.edges));
    tmp.canvas = canvas;
    tmp.ctx = canvas.getContext('2d');
    tmp.dpr = 1;
    tmp.selected = null;
    tmp.connectFrom = null;
    tmp.mode = 'select';
    tmp.render();
    if (task && task.solution) {
      card.appendChild(UI.el('div', 'func-field-title', '对应的 C 代码'));
      card.appendChild(UI.codeBlock(p.title + ' 参考代码', task.solution));
    }
    var actions = UI.el('div', 'think-actions');
    var use = UI.el('button', 'btn small', '用参考替换我的画布');
    use.type = 'button';
    use.addEventListener('click', function () {
      if (!root.confirm('确定用参考流程图替换你自己的画布吗？（可以撤销）')) return;
      self.pushHistory();
      self.nodes = JSON.parse(JSON.stringify(ref.nodes));
      self.edges = JSON.parse(JSON.stringify(ref.edges));
      self.selected = null;
      self.render();
      self.renderProps();
      self.saveDraft();
      if (back.parentNode) back.parentNode.removeChild(back);
      UI.toast('已载入参考流程图', '对照一下它和你的思路哪里不一样。');
    });
    actions.appendChild(use);
    var close = UI.el('button', 'btn small ghost', '关闭');
    close.type = 'button';
    close.addEventListener('click', function () { if (back.parentNode) back.parentNode.removeChild(back); });
    actions.appendChild(close);
    card.appendChild(actions);
    back.appendChild(card);
    doc.body.appendChild(back);
  };

  Think.openCode = function () {
    var self = this;
    var p = this.problemById(this.problemId);
    if (!p) return;
    var task = this.findTask(p.taskId);
    if (!task) { UI.toast('这道题还没有对应的代码练习', '换一道题试试～'); return; }
    var back = UI.el('div', 'fx-comfort-back');
    var card = UI.el('div', 'fx-comfort-card think-code-card');
    var head = UI.el('div', 'think-code-head');
    head.appendChild(UI.el('h3', 'fx-comfort-title', '✍️ 写代码：' + p.title));
    var close = UI.el('button', 'btn small ghost', '关闭');
    close.type = 'button';
    close.addEventListener('click', function () {
      if (back.parentNode) back.parentNode.removeChild(back);
      self.renderList();
    });
    head.appendChild(close);
    card.appendChild(head);
    card.appendChild(UI.el('div', 'pz-small', '小提示：不会写的时候，回到流程图，把每个框翻译成一行代码。'));
    var body = UI.el('div', 'think-code-body');
    body.appendChild(UI.taskRunner(task, { kind: 'lesson' }));
    card.appendChild(body);
    back.appendChild(card);
    doc.body.appendChild(back);
  };

  Think.enter = function () {
    this.build();
    if (!this.problemId && this.problems.length) this.selectProblem(this.problems[0].id);
    this.renderList();
    this.render();
    this.renderProps();
    this.centerCanvas();
  };

  CC.ThinkView = Think;
})(typeof globalThis !== 'undefined' ? globalThis : this);