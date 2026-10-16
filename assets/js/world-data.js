/*!
 * 粉猫捉虫 · 大世界地图数据
 * 用「画笔」一格一格铺地图，比手写字符网格更不容易出错。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});

  // ---------- 铺地图的小工具 ----------
  function blank(w, h, ch) {
    var rows = [];
    for (var y = 0; y < h; y++) {
      var row = [];
      for (var x = 0; x < w; x++) row.push(ch);
      rows.push(row);
    }
    return rows;
  }
  function rect(g, x, y, w, h, ch) {
    for (var j = y; j < y + h; j++) {
      if (j < 0 || j >= g.length) continue;
      for (var i = x; i < x + w; i++) {
        if (i < 0 || i >= g[j].length) continue;
        g[j][i] = ch;
      }
    }
  }
  function put(g, x, y, ch) {
    if (g[y] && g[y][x] !== undefined) g[y][x] = ch;
  }
  function border(g, ch) {
    var h = g.length, w = g[0].length;
    rect(g, 0, 0, w, 1, ch);
    rect(g, 0, h - 1, w, 1, ch);
    rect(g, 0, 0, 1, h, ch);
    rect(g, w - 1, 0, 1, h, ch);
  }
  function join(g) {
    return g.map(function (row) { return row.join(''); });
  }

  // 地形字符表（只有一个字母：好写、好读）
  var LEGEND = {
    g: 'grass', G: 'grass2', p: 'path', s: 'sand', w: 'water',
    f: 'floor', W: 'wall', u: 'rug', S: 'stone', B: 'bridge', X: 'bridge_broken'
  };

  // ---------- 1. 小猫的家（室内） ----------
  function buildHome() {
    var g = blank(20, 13, 'f');
    border(g, 'W');
    rect(g, 9, 11, 4, 1, 'f');    // 门口的过道
    rect(g, 11, 5, 2, 2, 'u');    // 小地毯
    rect(g, 12, 6, 2, 2, 'u');
    // 门（往下走到外面）
    put(g, 10, 12, 'f');
    put(g, 11, 12, 'f');
    return {
      id: 'home',
      name: '小猫的家',
      size: { w: 20, h: 13 },
      rows: join(g),
      spawn: { x: 10.5, y: 10.2 },
      objects: [
        { id: 'bed', kind: 'bed', x: 2, y: 1, puzzle: 'sleep' },
        { id: 'jars', kind: 'jarShelf', x: 6, y: 1, solid: [0, 1, 2, 1], puzzle: 'jars' },
        { id: 'books', kind: 'bookshelf', x: 14, y: 1, solid: [0, 1, 2, 2], puzzle: 'books' },
        { id: 'bowl', kind: 'bowl', x: 3, y: 10, puzzle: 'feed' },
        { id: 'chest', kind: 'chest', x: 16, y: 10, puzzle: 'bag' },
        { id: 'doorOut', kind: 'door', x: 10, y: 11, solid: [0, 1, 1, 1], to: 'town', spawn: { x: 3.5, y: 12.6 }, talk: ['出门啦！'] }
      ],
      exits: []
    };
  }

  // ---------- 2. 家门口的大世界（中央枢纽） ----------
  function buildTown() {
    var g = blank(28, 18, 'g');
    // 河 + 沙滩
    rect(g, 20, 0, 2, 18, 'w');
    rect(g, 22, 0, 6, 18, 's');
    // 断桥（修好后变成桥）
    rect(g, 20, 9, 2, 2, 'B');
    // 小路
    rect(g, 13, 1, 2, 9, 'p');
    rect(g, 4, 9, 16, 2, 'p');
    rect(g, 22, 9, 6, 2, 'p');
    rect(g, 16, 11, 2, 7, 'p');
    // 花园草地
    rect(g, 2, 1, 7, 6, 'G');
    var objects = [];
    // 屋子 + 工坊
    objects.push({ id: 'house', kind: 'house', x: 2, y: 7, solid: [0, 2, 3, 1], to: 'home', spawn: { x: 6.5, y: 8.4 }, talk: ['这是我们的家。'] });
    objects.push({ id: 'shed', kind: 'shed', x: 10, y: 1, solid: [0, 2, 3, 1], to: 'workshop', spawn: { x: 8.5, y: 8.6 }, talk: ['工坊！里面全是好玩的机器。'] });
    // 花园的栅栏 + 花 + 机器人
    for (var fx = 1; fx <= 9; fx++) objects.push({ id: 'fence' + fx, kind: 'fence', x: fx, y: 0.15, solid: [0, 0, 1, 1] });
    objects.push({ id: 'robot', kind: 'robot', x: 2, y: 5, solid: [0, 0, 1, 1], puzzle: 'robot' });
    var flowers = [[3, 3, 'flowerPink'], [4, 3, 'flowerBlue'], [5, 3, 'flowerPink'], [6, 3, 'flowerBlue'], [7, 3, 'flowerPink']];
    flowers.forEach(function (f, i) {
      objects.push({ id: 'flower' + i, kind: f[2], x: f[0], y: f[1], flower: true, talk: ['这朵花还没浇水…有点蔫。'] });
    });
    objects.push({ id: 'sprinkler', kind: 'sprinkler', x: 8, y: 5, talk: ['洒水器。要是有人能帮我按下开关…'] });
    // 森林大门（解开谜题才打开）
    objects.push({ id: 'gate', kind: 'gate', x: 16, y: 15, solid: [0, 0, 2, 3], puzzle: 'gate' });
    // 桥（断了）
    objects.push({ id: 'bridge', kind: 'bridgeSpot', x: 20, y: 9, solid: [0, 0, 2, 2], puzzle: 'bridge' });
    // 海边
    objects.push({ id: 'lamp1', kind: 'lamp', x: 25, y: 3, solid: [0, 1, 1, 1], puzzle: 'lighthouse' });
    objects.push({ id: 'lamp2', kind: 'lamp', x: 25, y: 5, solid: [0, 1, 1, 1], talk: ['灯柱。灯塔不亮，船就不敢靠岸。'] });
    objects.push({ id: 'boat', kind: 'boat', x: 23, y: 13, solid: [0, 0, 2, 1], puzzle: 'boat' });
    objects.push({ id: 'sign1', kind: 'sign', x: 12, y: 11, solid: [0, 1, 1, 1], talk: ['【路口木牌】\n↑ 工坊　← 家　↓ 森林　→ 海边', '用方向键走路，靠近东西按空格和它说话。'] });
    objects.push({ id: 'sign2', kind: 'sign', x: 18, y: 11, solid: [0, 1, 1, 1], talk: ['【歪歪的牌子】\n桥被大水冲断了。听说集齐 3 颗宝石就能修好…'] });
    // 装饰
    [[0, 16], [27, 16], [0, 1], [27, 1]].forEach(function (t, i) {
      objects.push({ id: 'tree' + i, kind: 'tree', x: t[0], y: t[1], solid: [0, 2, 2, 1] });
    });
    [[9, 14], [12, 6], [19, 3], [7, 12]].forEach(function (t, i) {
      objects.push({ id: 'bush' + i, kind: 'bush', x: t[0], y: t[1], solid: [0, 0, 1, 1] });
    });
    [[24, 16], [3, 14]].forEach(function (t, i) {
      objects.push({ id: 'rock' + i, kind: 'rock', x: t[0], y: t[1], solid: [0, 0, 1, 1] });
    });
    objects.push({ id: 'bfly1', kind: 'butterfly', x: 5, y: 8, ambient: 'butterfly' });
    objects.push({ id: 'bfly2', kind: 'butterfly', x: 17, y: 6, ambient: 'butterfly' });
    return {
      id: 'town',
      name: '家门口',
      size: { w: 28, h: 18 },
      rows: join(g),
      spawn: { x: 13.5, y: 12.5 },
      objects: objects,
      gardens: [[1, 1, 9, 7]]
    };
  }

  // ---------- 3. 工坊（室内，机器们的家） ----------
  function buildWorkshop() {
    var g = blank(22, 13, 'S');
    border(g, 'W');
    rect(g, 9, 11, 4, 1, 'S');
    return {
      id: 'workshop',
      name: '工坊',
      size: { w: 22, h: 13 },
      rows: join(g),
      spawn: { x: 10.5, y: 9.4 },
      objects: [
        { id: 'drawers', kind: 'drawers', x: 1, y: 1, solid: [0, 0, 2, 3], puzzle: 'drawers' },
        { id: 'machine', kind: 'machine', x: 5, y: 1, solid: [0, 0, 3, 3], puzzle: 'machine' },
        { id: 'ropes', kind: 'ropePost', x: 17, y: 1, solid: [0, 0, 1, 1], puzzle: 'rope' },
        { id: 'boxA', kind: 'box', x: 15, y: 3, opt: { label: true }, talk: ['箱子 A，里面写着 5。'] },
        { id: 'boxB', kind: 'box', x: 19, y: 3, opt: { label: true }, talk: ['箱子 B，里面写着 9。'] },
        { id: 'desk', kind: 'desk', x: 6, y: 8, solid: [0, 0, 2, 2], puzzle: 'desk' },
        { id: 'bench', kind: 'chest', x: 15, y: 9, puzzle: 'bag' },
        { id: 'signWork', kind: 'sign', x: 19, y: 6, solid: [0, 1, 1, 1], talk: ['【工坊守则】\n东西坏了就打开里面看看——抽屉里可能还有抽屉。'] },
        { id: 'doorWork', kind: 'door', x: 10, y: 11, solid: [0, 1, 1, 1], to: 'town', spawn: { x: 11.5, y: 5.5 }, talk: ['回外面去。'] }
      ],
      exits: []
    };
  }

  // ---------- 4. 森林（虫虫洞） ----------
  function buildForest() {
    var g = blank(28, 18, 'G');
    // 一条弯弯曲曲的小路
    rect(g, 1, 15, 8, 2, 'p');
    rect(g, 7, 8, 2, 9, 'p');
    rect(g, 7, 8, 10, 2, 'p');
    rect(g, 16, 4, 2, 6, 'p');
    rect(g, 16, 4, 7, 2, 'p');
    rect(g, 21, 2, 2, 4, 'p');
    var objects = [];
    // 入口木牌
    objects.push({ id: 'signForest', kind: 'sign', x: 3, y: 12, solid: [0, 1, 1, 1], talk: ['【森林】\n前面有个洞，洞里全是会咬代码的小虫子…'] });
    // 珠子串台子
    objects.push({ id: 'beads', kind: 'box', x: 9, y: 9, solid: [0, 0, 1, 1], puzzle: 'beads' });
    // 虫虫洞
    objects.push({ id: 'cave', kind: 'cave', x: 20, y: 1, solid: [0, 2, 3, 1], puzzle: 'cave' });
    // 树 + 灌木
    var trees = [[0, 0], [3, 0], [6, 0], [9, 0], [12, 0], [15, 0], [18, 0], [24, 0], [26, 0],
      [0, 3], [24, 4], [26, 6], [0, 7], [3, 6], [5, 4], [12, 4], [14, 6], [10, 12], [13, 14], [16, 16], [20, 16], [24, 14], [26, 16], [0, 11], [2, 9]];
    trees.forEach(function (t, i) {
      objects.push({ id: 'ftree' + i, kind: 'tree', x: t[0], y: t[1], solid: [0, 2, 2, 1] });
    });
    [[4, 2], [11, 7], [19, 8], [22, 12], [5, 16], [17, 10]].forEach(function (t, i) {
      objects.push({ id: 'fbush' + i, kind: 'bush', x: t[0], y: t[1], solid: [0, 0, 1, 1] });
    });
    [[2, 5], [14, 12], [23, 6], [8, 2]].forEach(function (t, i) {
      objects.push({ id: 'fflower' + i, kind: i % 2 ? 'flowerBlue' : 'flowerPink', x: t[0], y: t[1] });
    });
    objects.push({ id: 'frock' + 0, kind: 'rock', x: 25, y: 9, solid: [0, 0, 1, 1] });
    objects.push({ id: 'fbfly', kind: 'butterfly', x: 12, y: 10, ambient: 'butterfly' });
    return {
      id: 'forest',
      name: '森林',
      size: { w: 28, h: 18 },
      rows: join(g),
      spawn: { x: 2.5, y: 15.5 },
      objects: objects,
      exits: []
    };
  }

  var BUILDERS = { home: buildHome, town: buildTown, workshop: buildWorkshop, forest: buildForest };

  var Area = {
    cache: {},
    get: function (id) {
      if (!this.cache[id]) {
        var b = BUILDERS[id] || BUILDERS.town;
        this.cache[id] = b();
      }
      return this.cache[id];
    },
    has: function (id) { return !!BUILDERS[id]; },
    ids: function () { return Object.keys(BUILDERS); },
    legend: LEGEND,
    decode: function (rows) {
      var out = [];
      for (var y = 0; y < rows.length; y++) {
        var line = [];
        for (var x = 0; x < rows[y].length; x++) {
          var ch = rows[y][x];
          line.push(LEGEND[ch] || 'grass');
        }
        out.push(line);
      }
      return out;
    }
  };

  CC.WorldData = {
    TILE: 24,
    Area: Area,
    LEGEND: LEGEND,
    walkable: function (tileId) {
      return tileId !== 'water' && tileId !== 'wall' && tileId !== 'bridge_broken';
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
