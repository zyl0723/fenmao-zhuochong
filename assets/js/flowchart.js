/*!
 * 粉猫捉虫 · 流程图工坊
 * 先把思路画出来：开始/结束、处理、判断、输入输出、箭头。
 * 6 个模板 + 自动生成「思路提纲 / C 代码骨架」+ 本地保存 + 导出 PNG。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var doc = root.document;
  var UI = CC.UI;

  var W = 1400, H = 900;
  var SHAPES = {
    start: { label: '开始 / 结束', w: 150, h: 56, fill: '#f9cfe0', stroke: '#c96b93', text: '#7a3c58' },
    process: { label: '处理', w: 180, h: 68, fill: '#dcb891', stroke: '#a87c56', text: '#4a3a44' },
    decision: { label: '判断', w: 170, h: 110, fill: '#ffefc2', stroke: '#d9a04c', text: '#8f6421' },
    io: { label: '输入 / 输出', w: 180, h: 64, fill: '#dcefee', stroke: '#7cb9a2', text: '#2f6b55' }
  };

  var TEMPLATES = [
    {
      id: 'pass', name: '判断成绩是否及格', desc: '最基础的分支：成立走一边，不成立走另一边',
      code: '#include <stdio.h>\n\nint main() {\n    int score;\n    scanf("%d", &score);\n    if (score >= 60) {\n        printf("及格\\n");\n    } else {\n        printf("不及格\\n");\n    }\n    return 0;\n}',
      nodes: [
        { id: 'n1', type: 'start', x: 560, y: 40, text: '开始' },
        { id: 'n2', type: 'io', x: 545, y: 150, text: '输入成绩 score' },
        { id: 'n3', type: 'decision', x: 550, y: 260, text: 'score >= 60 ?' },
        { id: 'n4', type: 'process', x: 300, y: 430, text: '输出「及格」' },
        { id: 'n5', type: 'process', x: 800, y: 430, text: '输出「不及格」' },
        { id: 'n6', type: 'start', x: 560, y: 560, text: '结束' }
      ],
      edges: [
        { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'n4', label: '是' }, { from: 'n3', to: 'n5', label: '否' },
        { from: 'n4', to: 'n6' }, { from: 'n5', to: 'n6' }
      ]
    },
    {
      id: 'sum', name: '1 到 100 求和', desc: '循环：判断 → 处理 → 回到判断',
      code: '#include <stdio.h>\n\nint main() {\n    int sum = 0;\n    for (int i = 1; i <= 100; i++) {\n        sum += i;\n    }\n    printf("%d\\n", sum);\n    return 0;\n}',
      nodes: [
        { id: 'n1', type: 'start', x: 560, y: 40, text: '开始' },
        { id: 'n2', type: 'process', x: 535, y: 140, text: 'sum = 0，i = 1' },
        { id: 'n3', type: 'decision', x: 550, y: 250, text: 'i <= 100 ?' },
        { id: 'n4', type: 'process', x: 800, y: 260, text: 'sum = sum + i；i = i + 1' },
        { id: 'n5', type: 'io', x: 545, y: 420, text: '输出 sum' },
        { id: 'n6', type: 'start', x: 560, y: 530, text: '结束' }
      ],
      edges: [
        { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'n4', label: '是' }, { from: 'n4', to: 'n3' },
        { from: 'n3', to: 'n5', label: '否' }, { from: 'n5', to: 'n6' }
      ]
    },
    {
      id: 'max3', name: '三个数的最大值', desc: '连续判断：每次和「目前最大」比一比',
      code: '#include <stdio.h>\n\nint main() {\n    int a, b, c, max;\n    scanf("%d %d %d", &a, &b, &c);\n    max = a;\n    if (b > max) max = b;\n    if (c > max) max = c;\n    printf("%d\\n", max);\n    return 0;\n}',
      nodes: [
        { id: 'n1', type: 'start', x: 560, y: 30, text: '开始' },
        { id: 'n2', type: 'io', x: 545, y: 120, text: '输入 a、b、c' },
        { id: 'n3', type: 'process', x: 535, y: 220, text: 'max = a' },
        { id: 'n4', type: 'decision', x: 550, y: 320, text: 'b > max ?' },
        { id: 'n5', type: 'process', x: 300, y: 350, text: 'max = b' },
        { id: 'n6', type: 'decision', x: 550, y: 470, text: 'c > max ?' },
        { id: 'n7', type: 'process', x: 300, y: 500, text: 'max = c' },
        { id: 'n8', type: 'io', x: 545, y: 620, text: '输出 max' },
        { id: 'n9', type: 'start', x: 560, y: 720, text: '结束' }
      ],
      edges: [
        { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' },
        { from: 'n4', to: 'n5', label: '是' }, { from: 'n4', to: 'n6', label: '否' },
        { from: 'n5', to: 'n6' },
        { from: 'n6', to: 'n7', label: '是' }, { from: 'n6', to: 'n8', label: '否' },
        { from: 'n7', to: 'n8' }, { from: 'n8', to: 'n9' }
      ]
    },    {
      id: 'prime', name: '判断素数', desc: '判断里再套判断，还要记得循环的「刹车」',
      code: '#include <stdio.h>\n\nint main() {\n    int n, i, isPrime = 1;\n    scanf("%d", &n);\n    if (n < 2) isPrime = 0;\n    for (i = 2; i * i <= n; i++) {\n        if (n % i == 0) { isPrime = 0; break; }\n    }\n    printf(isPrime ? "是素数\\n" : "不是素数\\n");\n    return 0;\n}',
      nodes: [
        { id: 'n1', type: 'start', x: 560, y: 30, text: '开始' },
        { id: 'n2', type: 'io', x: 545, y: 120, text: '输入 n' },
        { id: 'n3', type: 'decision', x: 550, y: 220, text: 'n < 2 ?' },
        { id: 'n4', type: 'io', x: 250, y: 240, text: '输出「不是素数」' },
        { id: 'n5', type: 'process', x: 535, y: 350, text: 'i = 2' },
        { id: 'n6', type: 'decision', x: 550, y: 450, text: 'i * i <= n ?' },
        { id: 'n7', type: 'decision', x: 800, y: 460, text: 'n % i == 0 ?' },
        { id: 'n8', type: 'process', x: 820, y: 610, text: 'i = i + 1' },
        { id: 'n9', type: 'io', x: 220, y: 620, text: '输出「是素数」' },
        { id: 'n10', type: 'io', x: 540, y: 620, text: '输出「不是素数」' },
        { id: 'n11', type: 'start', x: 560, y: 730, text: '结束' }
      ],
      edges: [
        { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'n4', label: '是' }, { from: 'n3', to: 'n5', label: '否' },
        { from: 'n5', to: 'n6' },
        { from: 'n6', to: 'n7', label: '是' }, { from: 'n6', to: 'n9', label: '否' },
        { from: 'n7', to: 'n10', label: '是' }, { from: 'n7', to: 'n8', label: '否' },
        { from: 'n8', to: 'n6' },
        { from: 'n4', to: 'n11' }, { from: 'n9', to: 'n11' }, { from: 'n10', to: 'n11' }
      ]
    },
    {
      id: 'table', name: '九九乘法表（一行）', desc: '循环输出：每次打印一个小算式',
      code: '#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 9; i++) {\n        printf("%d x %d = %d\\n", i, 3, i * 3);\n    }\n    return 0;\n}',
      nodes: [
        { id: 'n1', type: 'start', x: 560, y: 60, text: '开始' },
        { id: 'n2', type: 'process', x: 535, y: 160, text: 'i = 1' },
        { id: 'n3', type: 'decision', x: 550, y: 270, text: 'i <= 9 ?' },
        { id: 'n4', type: 'io', x: 800, y: 280, text: '输出 i × 3 的算式' },
        { id: 'n5', type: 'process', x: 815, y: 400, text: 'i = i + 1' },
        { id: 'n6', type: 'start', x: 560, y: 430, text: '结束' }
      ],
      edges: [
        { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'n4', label: '是' }, { from: 'n4', to: 'n5' }, { from: 'n5', to: 'n3' },
        { from: 'n3', to: 'n6', label: '否' }
      ]
    },
    {
      id: 'water', name: '机器人浇水', desc: '大世界里的那个谜题：重复 5 次「前进 + 浇水」',
      code: '#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 5; i++) {\n        printf("往前走一格\\n");\n        printf("浇水\\n");\n    }\n    printf("五朵花都浇好啦\\n");\n    return 0;\n}',
      nodes: [
        { id: 'n1', type: 'start', x: 560, y: 60, text: '开始' },
        { id: 'n2', type: 'process', x: 535, y: 160, text: 'i = 1' },
        { id: 'n3', type: 'decision', x: 550, y: 270, text: 'i <= 5 ?' },
        { id: 'n4', type: 'process', x: 800, y: 270, text: '前进一格；浇水' },
        { id: 'n5', type: 'process', x: 815, y: 390, text: 'i = i + 1' },
        { id: 'n6', type: 'start', x: 560, y: 430, text: '结束' }
      ],
      edges: [
        { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'n4', label: '是' }, { from: 'n4', to: 'n5' }, { from: 'n5', to: 'n3' },
        { from: 'n3', to: 'n6', label: '否' }
      ]
    }
  ];

  var Flow = {
    built: false,
    nodes: [], edges: [], selected: null, mode: 'select', connectFrom: null,
    history: [], future: [], canvas: null, ctx: null, dpr: 2, drag: null,
    name: '未命名流程图', currentId: null, template: null, dirty: false,

    build: function () {
      if (this.built) return;
      var host = doc.getElementById('flow-root');
      if (!host) return;
      UI.clear(host);
      var self = this;
      var layout = UI.el('div', 'flow-layout');

      var tools = UI.el('aside', 'flow-tools card');
      tools.appendChild(UI.el('div', 'side-title', '画图工具'));
      var addWrap = UI.el('div', 'flow-tool-grid');
      ['start', 'process', 'decision', 'io'].forEach(function (t) {
        var b = UI.el('button', 'flow-tool');
        b.type = 'button';
        b.appendChild(UI.el('span', 'flow-tool-shape flow-shape-' + t));
        b.appendChild(UI.el('span', null, '+ ' + SHAPES[t].label));
        b.addEventListener('click', function () { self.addNode(t); });
        addWrap.appendChild(b);
      });
      tools.appendChild(addWrap);
      tools.appendChild(UI.el('div', 'side-title', '操作'));
      var ops = UI.el('div', 'flow-ops');
      self.connectBtn = UI.el('button', 'btn small', '🔗 连线');
      self.connectBtn.type = 'button';
      self.connectBtn.addEventListener('click', function () { self.toggleConnect(); });
      ops.appendChild(self.connectBtn);
      [['↶ 撤销', function () { self.undo(); }], ['↷ 重做', function () { self.redo(); }], ['🗑 删除选中', function () { self.removeSelected(); }]].forEach(function (pair) {
        var b = UI.el('button', 'btn small', pair[0]);
        b.type = 'button';
        b.addEventListener('click', pair[1]);
        ops.appendChild(b);
      });
      var clearBtn = UI.el('button', 'btn small ghost', '清空画布');
      clearBtn.type = 'button';
      clearBtn.addEventListener('click', function () {
        if (!root.confirm('清空整张流程图？撤销还可以救回来。')) return;
        self.pushHistory();
        self.nodes = [];
        self.edges = [];
        self.selected = null;
        self.render();
      });
      ops.appendChild(clearBtn);
      tools.appendChild(ops);
      tools.appendChild(UI.el('div', 'side-title', '保存 / 导出'));
      var saveRow = UI.el('div', 'flow-ops');
      var saveBtn = UI.el('button', 'btn small primary', '💾 保存');
      saveBtn.type = 'button';
      saveBtn.addEventListener('click', function () { self.saveNamed(); });
      saveRow.appendChild(saveBtn);
      var openBtn = UI.el('button', 'btn small', '📂 打开');
      openBtn.type = 'button';
      openBtn.addEventListener('click', function () { self.openNamed(); });
      saveRow.appendChild(openBtn);
      var exportBtn = UI.el('button', 'btn small', '🖼 导出图片');
      exportBtn.type = 'button';
      exportBtn.addEventListener('click', function () { self.exportPNG(); });
      saveRow.appendChild(exportBtn);
      tools.appendChild(saveRow);
      self.nameEl = UI.el('div', 'flow-name', this.name);
      tools.appendChild(self.nameEl);
      layout.appendChild(tools);

      var wrap = UI.el('div', 'flow-canvas-wrap card');
      var canvas = UI.el('canvas', 'flow-canvas');
      canvas.width = W * 2;
      canvas.height = H * 2;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      wrap.appendChild(canvas);
      layout.appendChild(wrap);
      this.wrapEl = wrap;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.bindCanvas();

      var side = UI.el('aside', 'flow-side');
      var prop = UI.el('div', 'side-card');
      prop.appendChild(UI.el('div', 'side-title', '选中的图形'));
      self.propBox = UI.el('div', 'flow-prop');
      prop.appendChild(self.propBox);
      side.appendChild(prop);

      var teach = UI.el('div', 'side-card');
      teach.appendChild(UI.el('div', 'side-title', '流程图怎么画'));
      var legend = UI.el('div', 'flow-legend');
      [['start', '开始 / 结束：椭圆，流程的头和尾'], ['io', '输入 / 输出：平行四边形，读数据或显示结果'],
        ['process', '处理：矩形，做一件事（赋值、计算）'], ['decision', '判断：菱形，一个问题，两个出口（是 / 否）']].forEach(function (row) {
        var item = UI.el('div', 'flow-legend-item');
        item.appendChild(UI.el('span', 'flow-tool-shape flow-shape-' + row[0]));
        item.appendChild(UI.el('span', null, row[1]));
        legend.appendChild(item);
      });
      teach.appendChild(legend);
      var tips = UI.el('ul', 'flow-tips');
      ['顺着箭头读：一个框只做一件事。', '判断的菱形里写「问题」，两条出口分别标「是 / 否」。',
        '循环要有一条箭头绕回上面的判断。', '画完检查：每条路最终都能走到「结束」吗？'].forEach(function (t) {
        tips.appendChild(UI.el('li', null, t));
      });
      teach.appendChild(tips);
      side.appendChild(teach);

      var tplCard = UI.el('div', 'side-card');
      tplCard.appendChild(UI.el('div', 'side-title', '现成模板'));
      var tplList = UI.el('div', 'flow-templates');
      TEMPLATES.forEach(function (tpl) {
        var b = UI.el('button', 'flow-template');
        b.type = 'button';
        b.appendChild(UI.el('b', null, tpl.name));
        b.appendChild(UI.el('small', null, tpl.desc));
        b.addEventListener('click', function () { self.loadTemplate(tpl.id); });
        tplList.appendChild(b);
      });
      tplCard.appendChild(tplList);
      side.appendChild(tplCard);

      var codeCard = UI.el('div', 'side-card');
      codeCard.appendChild(UI.el('div', 'side-title', '思路提纲 / 代码骨架'));
      var genBtn = UI.el('button', 'btn small primary wide', '🧩 从我的流程图生成');
      genBtn.type = 'button';
      genBtn.addEventListener('click', function () { self.generate(); });
      codeCard.appendChild(genBtn);
      self.outlineBox = UI.el('pre', 'flow-outline', '点上面的按钮，把画好的流程变成提纲和 C 代码骨架。');
      codeCard.appendChild(self.outlineBox);
      side.appendChild(codeCard);

      layout.appendChild(side);
      host.appendChild(layout);
      this.built = true;
      this.loadDraft();
      this.render();
      this.renderProps();
    },    snapshot: function () {
      return JSON.stringify({ nodes: this.nodes, edges: this.edges, name: this.name });
    },
    pushHistory: function () {
      this.history.push(this.snapshot());
      if (this.history.length > 60) this.history.shift();
      this.future = [];
      this.dirty = true;
    },
    restore: function (json) {
      var d = JSON.parse(json);
      this.nodes = d.nodes || [];
      this.edges = d.edges || [];
      this.name = d.name || this.name;
      this.selected = null;
      if (this.nameEl) this.nameEl.textContent = this.name;
      this.render();
      this.renderProps();
    },
    undo: function () {
      if (!this.history.length) return;
      this.future.push(this.snapshot());
      this.restore(this.history.pop());
    },
    redo: function () {
      if (!this.future.length) return;
      this.history.push(this.snapshot());
      this.restore(this.future.pop());
    },

    addNode: function (type) {
      this.pushHistory();
      var s = SHAPES[type];
      var n = this.nodes.length;
      var id = 'n' + Date.now().toString(36) + Math.floor(Math.random() * 100);
      this.nodes.push({
        id: id, type: type,
        x: 80 + (n % 4) * 230,
        y: 80 + Math.floor(n / 4) * 150,
        text: s.label
      });
      this.selected = { kind: 'node', id: id };
      this.render();
      this.renderProps();
      this.saveDraft();
    },
    nodeById: function (id) {
      for (var i = 0; i < this.nodes.length; i++) if (this.nodes[i].id === id) return this.nodes[i];
      return null;
    },
    removeSelected: function () {
      if (!this.selected) return;
      this.pushHistory();
      if (this.selected.kind === 'node') {
        var id = this.selected.id;
        this.nodes = this.nodes.filter(function (n) { return n.id !== id; });
        this.edges = this.edges.filter(function (e) { return e.from !== id && e.to !== id; });
      } else if (this.selected.kind === 'edge') {
        this.edges.splice(this.selected.index, 1);
      }
      this.selected = null;
      this.render();
      this.renderProps();
      this.saveDraft();
    },
    toggleConnect: function () {
      this.mode = this.mode === 'connect' ? 'select' : 'connect';
      this.connectFrom = null;
      if (this.connectBtn) {
        this.connectBtn.classList.toggle('primary', this.mode === 'connect');
        this.connectBtn.textContent = this.mode === 'connect' ? '🔗 连线中…（点两个图形）' : '🔗 连线';
      }
      this.render();
    },
    connect: function (fromId, toId) {
      if (fromId === toId) return;
      for (var i = 0; i < this.edges.length; i++) {
        if (this.edges[i].from === fromId && this.edges[i].to === toId) return;
      }
      this.pushHistory();
      var from = this.nodeById(fromId);
      var label = '';
      if (from && from.type === 'decision') {
        var count = this.edges.filter(function (e) { return e.from === fromId; }).length;
        label = count === 0 ? '是' : (count === 1 ? '否' : '');
      }
      this.edges.push({ from: fromId, to: toId, label: label });
      this.render();
      this.saveDraft();
    },

    bindCanvas: function () {
      var self = this;
      var c = this.canvas;
      function pos(e) {
        var r = c.getBoundingClientRect();
        return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
      }
      function hitNode(p) {
        for (var i = self.nodes.length - 1; i >= 0; i--) {
          var n = self.nodes[i], s = SHAPES[n.type];
          if (p.x >= n.x && p.x <= n.x + s.w && p.y >= n.y && p.y <= n.y + s.h) return n;
        }
        return null;
      }
      function hitEdge(p) {
        for (var i = self.edges.length - 1; i >= 0; i--) {
          var a = self.nodeById(self.edges[i].from), b = self.nodeById(self.edges[i].to);
          if (!a || !b) continue;
          var sa = SHAPES[a.type], sb = SHAPES[b.type];
          var ax = a.x + sa.w / 2, ay = a.y + sa.h / 2;
          var bx = b.x + sb.w / 2, by = b.y + sb.h / 2;
          if (distToSeg(p.x, p.y, ax, ay, bx, by) < 9) return i;
        }
        return -1;
      }
      c.addEventListener('pointerdown', function (e) {
        var p = pos(e);
        var n = hitNode(p);
        if (self.mode === 'connect') {
          if (n) {
            if (!self.connectFrom) self.connectFrom = n.id;
            else { self.connect(self.connectFrom, n.id); self.connectFrom = null; }
            self.render();
          }
          return;
        }
        if (n) {
          self.pushHistory();
          self.selected = { kind: 'node', id: n.id };
          self.drag = { id: n.id, dx: p.x - n.x, dy: p.y - n.y, moved: false };
          if (c.setPointerCapture) { try { c.setPointerCapture(e.pointerId); } catch (err) { } }
          self.render();
          self.renderProps();
          return;
        }
        var ei = hitEdge(p);
        if (ei >= 0) {
          self.selected = { kind: 'edge', index: ei };
        } else {
          self.selected = null;
        }
        self.render();
        self.renderProps();
      });
      c.addEventListener('pointermove', function (e) {
        if (!self.drag) return;
        var p = pos(e);
        var n = self.nodeById(self.drag.id);
        if (!n) return;
        var s = SHAPES[n.type];
        var nx = Math.max(8, Math.min(W - s.w - 8, p.x - self.drag.dx));
        var ny = Math.max(8, Math.min(H - s.h - 8, p.y - self.drag.dy));
        if (Math.abs(nx - n.x) > 1 || Math.abs(ny - n.y) > 1) self.drag.moved = true;
        n.x = Math.round(nx);
        n.y = Math.round(ny);
        self.render();
      });
      c.addEventListener('pointerup', function () {
        if (self.drag) {
          if (!self.drag.moved) self.history.pop();
          self.drag = null;
          self.saveDraft();
        }
      });
      c.addEventListener('dblclick', function (e) {
        var n = hitNode(pos(e));
        if (!n) return;
        self.selected = { kind: 'node', id: n.id };
        self.render();
        self.renderProps();
        var input = self.propBox.querySelector('textarea');
        if (input) input.focus();
      });
    },

    renderProps: function () {
      var self = this;
      var box = this.propBox;
      if (!box) return;
      UI.clear(box);
      if (!this.selected) {
        box.appendChild(UI.el('div', 'pz-small', '点一个图形（或箭头），这里可以改文字。'));
        return;
      }
      if (this.selected.kind === 'node') {
        var n = this.nodeById(this.selected.id);
        if (!n) return;
        box.appendChild(UI.el('div', 'tiny muted', SHAPES[n.type].label));
        var ta = UI.el('textarea', 'flow-text');
        ta.value = n.text;
        ta.rows = 2;
        ta.addEventListener('input', function () { n.text = ta.value; self.render(); self.saveDraft(); });
        ta.addEventListener('change', function () { self.pushHistory(); });
        box.appendChild(ta);
        var del = UI.el('button', 'btn small ghost', '删除这个图形');
        del.type = 'button';
        del.addEventListener('click', function () { self.removeSelected(); });
        box.appendChild(del);
      } else if (this.selected.kind === 'edge') {
        var edge = this.edges[this.selected.index];
        if (!edge) return;
        box.appendChild(UI.el('div', 'tiny muted', '箭头标签（判断的两条出口要标「是 / 否」）'));
        var row = UI.el('div', 'flow-edge-labels');
        ['是', '否', ''].forEach(function (lab) {
          var b = UI.el('button', 'btn small' + (edge.label === lab ? ' primary' : ''), lab === '' ? '不标' : lab);
          b.type = 'button';
          b.addEventListener('click', function () {
            self.pushHistory();
            edge.label = lab;
            self.render();
            self.renderProps();
            self.saveDraft();
          });
          row.appendChild(b);
        });
        box.appendChild(row);
        var del2 = UI.el('button', 'btn small ghost', '删除这条箭头');
        del2.type = 'button';
        del2.addEventListener('click', function () { self.removeSelected(); });
        box.appendChild(del2);
      }
    },    render: function () {
      var ctx = this.ctx;
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.scale(this.dpr, this.dpr);
      ctx.fillStyle = '#fffdfa';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#efdfe7';
      for (var gx = 20; gx < W; gx += 40) {
        for (var gy = 20; gy < H; gy += 40) ctx.fillRect(gx, gy, 2, 2);
      }
      var self = this;
      this.edges.forEach(function (edge, idx) {
        var a = self.nodeById(edge.from), b = self.nodeById(edge.to);
        if (!a || !b) return;
        var sa = SHAPES[a.type], sb = SHAPES[b.type];
        var p1 = edgePoint(a, sa, b, sb);
        var p2 = edgePoint(b, sb, a, sa);
        var selected = self.selected && self.selected.kind === 'edge' && self.selected.index === idx;
        self.drawArrow(ctx, p1.x, p1.y, p2.x, p2.y, selected ? '#c96b93' : '#8a6f7c', edge.label);
      });
      this.nodes.forEach(function (n) {
        var s = SHAPES[n.type];
        var selected = self.selected && self.selected.kind === 'node' && self.selected.id === n.id;
        var connecting = self.connectFrom === n.id;
        self.drawShape(ctx, n, s, selected || connecting);
      });
      if (this.mode === 'connect') {
        ctx.fillStyle = '#c96b93';
        ctx.font = '600 14px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(this.connectFrom ? '再点一个图形，完成连线' : '点第一个图形作为起点', 20, 30);
      }
    },

    drawShape: function (ctx, n, s, highlight) {
      var x = n.x, y = n.y, w = s.w, h = s.h;
      ctx.save();
      ctx.lineWidth = highlight ? 4 : 2.5;
      ctx.strokeStyle = highlight ? '#c96b93' : s.stroke;
      ctx.fillStyle = s.fill;
      ctx.beginPath();
      if (n.type === 'start') {
        var r = h / 2;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
      } else if (n.type === 'decision') {
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w, y + h / 2);
        ctx.lineTo(x + w / 2, y + h);
        ctx.lineTo(x, y + h / 2);
      } else if (n.type === 'io') {
        ctx.moveTo(x + 18, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w - 18, y + h);
        ctx.lineTo(x, y + h);
      } else {
        ctx.rect(x, y, w, h);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = s.text;
      ctx.font = '600 15px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var lines = wrapText(ctx, n.text || '', w - 28);
      var lh = 20;
      var startY = y + h / 2 - (lines.length - 1) * lh / 2;
      for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], x + w / 2, startY + i * lh);
      ctx.restore();
    },

    drawArrow: function (ctx, x1, y1, x2, y2, color, label) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      var dx = x2 - x1, dy = y2 - y1;
      var len = Math.hypot(dx, dy) || 1;
      var ux = dx / len, uy = dy / len;
      var ex = x2 - ux * 4, ey = y2 - uy * 4;
      ctx.beginPath();
      ctx.moveTo(x1 + ux * 2, y1 + uy * 2);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      var a = 9;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - ux * a - uy * a * 0.6, ey - uy * a + ux * a * 0.6);
      ctx.lineTo(ex - ux * a + uy * a * 0.6, ey - uy * a - ux * a * 0.6);
      ctx.closePath();
      ctx.fill();
      if (label) {
        var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        ctx.font = '700 14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var tw = ctx.measureText(label).width + 14;
        ctx.fillStyle = '#fffdfa';
        ctx.fillRect(mx - tw / 2, my - 12, tw, 24);
        ctx.fillStyle = color;
        ctx.fillText(label, mx, my);
      }
      ctx.restore();
    },

    loadTemplate: function (id) {
      var tpl = null;
      for (var i = 0; i < TEMPLATES.length; i++) if (TEMPLATES[i].id === id) tpl = TEMPLATES[i];
      if (!tpl) return;
      this.pushHistory();
      this.nodes = JSON.parse(JSON.stringify(tpl.nodes));
      this.edges = JSON.parse(JSON.stringify(tpl.edges));
      this.name = tpl.name;
      this.template = tpl;
      this.selected = null;
      if (this.nameEl) this.nameEl.textContent = this.name;
      this.render();
      this.renderProps();
      this.saveDraft();
      this.showTemplateCode(tpl);
      this.centerCanvas();
    },

    showTemplateCode: function (tpl) {
      var self = this;
      this.outlineBox.textContent = '模板参考代码（可以打开到练习场里改）：\n\n' + tpl.code;
      var old = this.outlineBox.parentNode.querySelector('.flow-open-code');
      if (old) old.parentNode.removeChild(old);
      var btn = UI.el('button', 'btn small primary flow-open-code', '▶ 在练习场打开这段代码');
      btn.type = 'button';
      btn.addEventListener('click', function () { self.openInPlayground(tpl.code); });
      this.outlineBox.parentNode.appendChild(btn);
    },

    openInPlayground: function (code) {
      CC.CodeStore.set('playground', code);
      UI.showView('playground');
      setTimeout(function () {
        if (CC.UI.pgEditor) CC.UI.pgEditor.setValue(code);
        var st = doc.getElementById('pg-stdin');
        if (st) st.value = '';
      }, 60);
    },

    readSaved: function () {
      try {
        var raw = root.localStorage.getItem('fenmao-flowcharts');
        var list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
      } catch (e) { return []; }
    },
    saveNamed: function () {
      var name = root.prompt('给这张流程图起个名字：', this.name);
      if (!name) return;
      this.name = name;
      if (this.nameEl) this.nameEl.textContent = name;
      var list = this.readSaved();
      var id = this.currentId || ('f' + Date.now().toString(36));
      var entry = { id: id, name: name, updatedAt: Date.now(), nodes: this.nodes, edges: this.edges };
      var found = false;
      for (var i = 0; i < list.length; i++) if (list[i].id === id) { list[i] = entry; found = true; }
      if (!found) list.push(entry);
      try { root.localStorage.setItem('fenmao-flowcharts', JSON.stringify(list)); } catch (e) { }
      this.currentId = id;
      this.saveDraft();
      UI.toast('流程图已保存', name);
    },
    openNamed: function () {
      var self = this;
      var list = this.readSaved();
      if (!list.length) { UI.toast('还没有保存过流程图', '先画一张，再点「💾 保存」。'); return; }
      var back = UI.el('div', 'fx-comfort-back');
      var card = UI.el('div', 'fx-comfort-card');
      card.appendChild(UI.el('h3', 'fx-comfort-title', '打开一张流程图'));
      list.forEach(function (item) {
        var b = UI.el('button', 'flow-saved-item');
        b.type = 'button';
        b.appendChild(UI.el('b', null, item.name));
        b.appendChild(UI.el('small', null, new Date(item.updatedAt).toLocaleString()));
        b.addEventListener('click', function () {
          self.pushHistory();
          self.nodes = JSON.parse(JSON.stringify(item.nodes || []));
          self.edges = JSON.parse(JSON.stringify(item.edges || []));
          self.name = item.name;
          self.currentId = item.id;
          self.selected = null;
          if (self.nameEl) self.nameEl.textContent = self.name;
          self.render();
          self.renderProps();
          self.saveDraft();
          if (back.parentNode) back.parentNode.removeChild(back);
        });
        card.appendChild(b);
      });
      var close = UI.el('button', 'btn small ghost', '关闭');
      close.type = 'button';
      close.addEventListener('click', function () { if (back.parentNode) back.parentNode.removeChild(back); });
      card.appendChild(close);
      back.appendChild(card);
      doc.body.appendChild(back);
    },
    saveDraft: function () {
      try { root.localStorage.setItem('fenmao-flow-draft', this.snapshot()); } catch (e) { }
    },
    loadDraft: function () {
      try {
        var raw = root.localStorage.getItem('fenmao-flow-draft');
        if (!raw) { this.loadTemplate('pass'); return; }
        var d = JSON.parse(raw);
        this.nodes = d.nodes || [];
        this.edges = d.edges || [];
        this.name = d.name || '我的流程图';
        if (this.nameEl) this.nameEl.textContent = this.name;
      } catch (e) { this.loadTemplate('pass'); }
    },
    exportPNG: function () {
      try {
        var tmp = doc.createElement('canvas');
        tmp.width = this.canvas.width;
        tmp.height = this.canvas.height;
        var tctx = tmp.getContext('2d');
        tctx.fillStyle = '#fffdfa';
        tctx.fillRect(0, 0, tmp.width, tmp.height);
        tctx.drawImage(this.canvas, 0, 0);
        var a = doc.createElement('a');
        a.download = (this.name || 'flowchart') + '.png';
        a.href = tmp.toDataURL('image/png');
        a.click();
        UI.toast('图片导出啦', '文件已经下载到你的电脑。');
      } catch (e) {
        UI.toast('导出失败', '浏览器可能不允许下载，试试截图保存。', 'urgent');
      }
    },

    generate: function () {
      if (!this.nodes.length) { this.outlineBox.textContent = '画布还是空的，先放几个图形吧～'; return; }
      var self = this;
      var start = this.nodes.filter(function (n) { return n.type === 'start'; })[0] || this.nodes[0];
      var out = {};
      this.edges.forEach(function (e) { (out[e.from] = out[e.from] || []).push(e); });
      var lines = [];
      var codeLines = ['int main() {'];
      var step = 1;
      var visiting = {};
      function ind(d) { return new Array(d + 1).join('  '); }
      function lab(n) { return n.text || SHAPES[n.type].label; }
      function walk(id, depth, codeDepth) {
        var n = self.nodeById(id);
        if (!n) return;
        if (visiting[id]) {
          lines.push(ind(depth) + '↺ （回到上面的步骤：形成循环）');
          codeLines.push(ind(codeDepth) + '// ↺ 回到上面的判断（循环）');
          return;
        }
        if (depth > 14) return;
        visiting[id] = true;
        if (n.type === 'decision') {
          lines.push(ind(depth) + '◆ 判断：' + lab(n));
          codeLines.push(ind(codeDepth) + '// ' + step + '. 判断：' + lab(n));
          step++;
          (out[id] || []).forEach(function (edge) {
            var to = self.nodeById(edge.to);
            if (!to) return;
            var tag = edge.label || '然后';
            lines.push(ind(depth + 1) + '├─[' + tag + ']');
            codeLines.push(ind(codeDepth + 1) + '//   [' + tag + '] ' + (to.type === 'start' ? '结束' : (to.type === 'decision' ? '判断：' + lab(to) : lab(to))));
            walk(edge.to, depth + 1, codeDepth + 1);
          });
        } else {
          if (n.type !== 'start') {
            lines.push(ind(depth) + '• ' + lab(n));
            codeLines.push(ind(codeDepth) + '// ' + step + '. ' + lab(n));
            step++;
          }
          var next = (out[id] || [])[0];
          if (next) walk(next.to, depth, codeDepth);
        }
        visiting[id] = false;
      }
      walk(start.id, 0, 0);
      codeLines.push('    return 0;');
      codeLines.push('}');
      this.outlineBox.textContent = '【思路提纲】\n' + (lines.join('\n') || '（还没有连线）') +
        '\n\n【C 代码骨架】\n' + codeLines.join('\n') +
        '\n\n提示：骨架只是把流程翻译成注释，真正的代码还要你自己填。';
      this.saveDraft();
    },

    centerCanvas: function () {
      if (!this.wrapEl) return;
      this.wrapEl.scrollLeft = 300;
      this.wrapEl.scrollTop = 0;
    },

    enter: function () {
      this.build();
      this.render();
      this.renderProps();
      this.saveDraft();
      this.centerCanvas();
    }
  };

  function wrapText(ctx, text, maxWidth) {
    var out = [];
    var paras = String(text).split('\n');
    for (var p = 0; p < paras.length; p++) {
      var line = '';
      var chars = paras[p].split('');
      for (var i = 0; i < chars.length; i++) {
        var test = line + chars[i];
        if (ctx.measureText(test).width > maxWidth && line) {
          out.push(line);
          line = chars[i];
        } else {
          line = test;
        }
      }
      out.push(line);
    }
    return out;
  }

  function edgePoint(node, shape, other, otherShape) {
    var cx = node.x + shape.w / 2, cy = node.y + shape.h / 2;
    var ox = other.x + otherShape.w / 2, oy = other.y + otherShape.h / 2;
    var dx = ox - cx, dy = oy - cy;
    if (Math.abs(dx) > Math.abs(dy)) {
      return { x: cx + (dx > 0 ? shape.w / 2 : -shape.w / 2), y: cy };
    }
    return { x: cx, y: cy + (dy > 0 ? shape.h / 2 : -shape.h / 2) };
  }

  CC.FlowView = Flow;
  CC.FLOW_TEMPLATES = TEMPLATES;
})(typeof globalThis !== 'undefined' ? globalThis : this);