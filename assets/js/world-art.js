/*!
 * 粉猫捉虫 · 大世界像素素材
 * 全部用代码画出来：地形块 + 屋子/抽屉柜/罐子/机器人/蛋糕机/绳子/珠子/虫虫洞……
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});

  var TILE = 24;

  // ---------- 调色板（游戏用的柔和配色，和粉猫的藕粉灰粉是一家人） ----------
  var P = {
    grass: '#cfe6bd', grass2: '#bdddac', grass3: '#a9cf95', grassDot: '#9ec78d',
    path: '#f0e2c9', path2: '#e5d3b3', pathDot: '#d9c4a0',
    sand: '#f6e8c8', sand2: '#eddab4',
    water: '#bcd9ea', water2: '#a6c9de', waterLine: '#d6ecf6',
    wood: '#dcb891', wood2: '#c69c73', wood3: '#a87c56', woodDark: '#8a6242',
    wall: '#f7e9ee', wall2: '#ecd7de', wallLine: '#e2c9d2',
    floor: '#e8cfae', floor2: '#d9b98f',
    stone: '#d9d0d8', stone2: '#c3b7c1', stone3: '#a99da8',
    roof: '#cf8fab', roof2: '#b4738f',
    leaf: '#a8cd90', leaf2: '#8fbc78', leaf3: '#75a463',
    pink: '#f5aecb', pink2: '#e58fb0', deep: '#a9537b',
    blue: '#a3c8e8', blue2: '#7fa9d0',
    yellow: '#ffd479', orange: '#f0a868', red: '#e07a82',
    metal: '#cdc6d0', metal2: '#a9a1ad', metal3: '#87808c',
    glass: '#e2f2f7', glass2: '#c6e3ec',
    purple: '#c9a7d6', violet: '#a888c4',
    dark: '#5b4453', dark2: '#42323c', white: '#fffdfa', shadow: 'rgba(91,68,83,.18)',
    bug: '#8a6fb0', bug2: '#6d5494'
  };

  function fill(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  // ---------- 地形 ----------
  var TERRAIN = {
    grass: function (ctx, sx, sy, t, tx, ty) {
      fill(ctx, sx, sy, TILE, TILE, P.grass);
      var seed = (tx * 7 + ty * 13) % 5;
      if (seed === 0) fill(ctx, sx + 5, sy + 7, 2, 2, P.grassDot);
      if (seed === 2) fill(ctx, sx + 15, sy + 15, 2, 2, P.grassDot);
      if (seed === 4) { fill(ctx, sx + 9, sy + 17, 1, 3, P.grass2); fill(ctx, sx + 11, sy + 19, 1, 3, P.grass2); }
    },
    grass2: function (ctx, sx, sy, t, tx, ty) {
      fill(ctx, sx, sy, TILE, TILE, P.grass2);
      var seed = (tx * 11 + ty * 5) % 4;
      if (seed === 1) fill(ctx, sx + 6, sy + 12, 2, 2, P.grass3);
    },
    path: function (ctx, sx, sy, t, tx, ty) {
      fill(ctx, sx, sy, TILE, TILE, P.path);
      var seed = (tx * 3 + ty * 7) % 6;
      if (seed === 0) fill(ctx, sx + 4, sy + 6, 3, 2, P.pathDot);
      if (seed === 3) fill(ctx, sx + 14, sy + 14, 2, 2, P.pathDot);
    },
    sand: function (ctx, sx, sy, t, tx, ty) {
      fill(ctx, sx, sy, TILE, TILE, P.sand);
      if ((tx + ty) % 3 === 0) fill(ctx, sx + 8, sy + 10, 2, 2, P.sand2);
    },
    water: function (ctx, sx, sy, t, tx, ty) {
      fill(ctx, sx, sy, TILE, TILE, P.water);
      var phase = Math.floor(t / 420 + tx + ty) % 2;
      fill(ctx, sx + 2, sy + (phase ? 6 : 14), 8, 2, P.waterLine);
      fill(ctx, sx + 13, sy + (phase ? 16 : 4), 7, 2, P.water2);
    },
    floor: function (ctx, sx, sy, t, tx, ty) {
      fill(ctx, sx, sy, TILE, TILE, P.floor);
      fill(ctx, sx, sy + TILE - 2, TILE, 2, P.floor2);
      if (ty % 2 === 0) fill(ctx, sx, sy, TILE, 1, P.floor2);
    },
    wall: function (ctx, sx, sy, t, tx, ty) {
      fill(ctx, sx, sy, TILE, TILE, P.wall);
      fill(ctx, sx, sy + TILE - 3, TILE, 3, P.wall2);
      fill(ctx, sx + 2, sy + 4, TILE - 4, 1, P.wallLine);
    },
    rug: function (ctx, sx, sy, t, tx, ty) {
      fill(ctx, sx, sy, TILE, TILE, '#f6d9e4');
      fill(ctx, sx + 3, sy + 3, TILE - 6, TILE - 6, '#eec2d3');
    },
    stone: function (ctx, sx, sy, t, tx, ty) {
      fill(ctx, sx, sy, TILE, TILE, P.stone);
      fill(ctx, sx + 2, sy + 2, 9, 9, P.stone2);
      fill(ctx, sx + 13, sy + 5, 8, 8, P.stone2);
      fill(ctx, sx + 4, sy + 15, 12, 7, P.stone2);
      fill(ctx, sx, sy + TILE - 1, TILE, 1, P.stone3);
    },
    bridge: function (ctx, sx, sy, t, tx, ty) {
      fill(ctx, sx, sy, TILE, TILE, P.wood);
      for (var i = 0; i < 3; i++) fill(ctx, sx, sy + i * 8 + 2, TILE, 1, P.wood3);
      fill(ctx, sx + 10, sy, 3, TILE, P.wood2);
    },
    bridge_broken: function (ctx, sx, sy, t, tx, ty) {
      fill(ctx, sx, sy, TILE, TILE, P.water);
      fill(ctx, sx + 1, sy + 3, 9, 6, P.wood2);
      fill(ctx, sx + 15, sy + 15, 8, 5, P.wood3);
      fill(ctx, sx + 4, sy + 17, 6, 4, P.wood2);
    }
  };

  // ---------- 物体（以 24 像素为一格来画，可以跨格） ----------
  var OBJ = {
    tree: { w: 2, h: 3, draw: function (ctx, sx, sy) {
      fill(ctx, sx + 16, sy + 34, 10, 30, P.wood3);
      fill(ctx, sx + 18, sy + 34, 6, 30, P.wood2);
      fill(ctx, sx + 2, sy + 12, 42, 26, P.leaf);
      fill(ctx, sx + 8, sy + 4, 30, 20, P.leaf);
      fill(ctx, sx + 6, sy + 26, 14, 10, P.leaf2);
      fill(ctx, sx + 26, sy + 18, 16, 16, P.leaf2);
      fill(ctx, sx + 12, sy + 8, 12, 8, P.leaf3);
    } },
    bush: { w: 1, h: 1, draw: function (ctx, sx, sy) {
      fill(ctx, sx + 2, sy + 10, 20, 12, P.leaf);
      fill(ctx, sx + 6, sy + 4, 12, 12, P.leaf2);
      fill(ctx, sx + 8, sy + 2, 6, 6, P.leaf3);
    } },
    flowerPink: { w: 1, h: 1, draw: function (ctx, sx, sy, opt) {
      if (opt && opt.bloomed === false) { fill(ctx, sx + 10, sy + 14, 4, 8, P.leaf2); return; }
      fill(ctx, sx + 10, sy + 12, 4, 10, P.leaf2);
      fill(ctx, sx + 7, sy + 5, 10, 8, P.pink);
      fill(ctx, sx + 9, sy + 3, 6, 10, P.pink2);
      fill(ctx, sx + 11, sy + 6, 3, 3, P.yellow);
      fill(ctx, sx + 5, sy + 15, 6, 3, P.leaf3);
    } },
    flowerBlue: { w: 1, h: 1, draw: function (ctx, sx, sy, opt) {
      if (opt && opt.bloomed === false) { fill(ctx, sx + 10, sy + 14, 4, 8, P.leaf2); return; }
      fill(ctx, sx + 10, sy + 12, 4, 10, P.leaf2);
      fill(ctx, sx + 7, sy + 5, 10, 8, P.blue);
      fill(ctx, sx + 9, sy + 3, 6, 10, P.blue2);
      fill(ctx, sx + 11, sy + 6, 3, 3, P.yellow);
      fill(ctx, sx + 5, sy + 15, 6, 3, P.leaf3);
    } },
    rock: { w: 1, h: 1, draw: function (ctx, sx, sy) {
      fill(ctx, sx + 3, sy + 10, 18, 12, P.stone);
      fill(ctx, sx + 6, sy + 6, 12, 10, P.stone2);
      fill(ctx, sx + 8, sy + 8, 6, 4, P.stone3);
    } },
    fence: { w: 1, h: 1, draw: function (ctx, sx, sy) {
      fill(ctx, sx + 3, sy + 8, 18, 4, P.wood2);
      fill(ctx, sx + 3, sy + 15, 18, 4, P.wood);
      fill(ctx, sx + 6, sy + 5, 4, 18, P.wood3);
      fill(ctx, sx + 15, sy + 5, 4, 18, P.wood3);
    } },
    sign: { w: 1, h: 2, draw: function (ctx, sx, sy) {
      fill(ctx, sx + 12, sy + 15, 4, 26, P.wood3);
      fill(ctx, sx + 2, sy + 4, 24, 16, P.wood);
      fill(ctx, sx + 4, sy + 6, 20, 12, '#f8e6c8');
      fill(ctx, sx + 7, sy + 10, 14, 2, P.woodDark);
      fill(ctx, sx + 7, sy + 14, 9, 2, P.dark);
    } },
    house: { w: 3, h: 3, draw: function (ctx, sx, sy) {
      fill(ctx, sx + 6, sy + 30, 66, 42, P.wall);
      fill(ctx, sx + 8, sy + 32, 62, 40, P.wall2);
      fill(ctx, sx + 2, sy + 12, 74, 22, P.roof);
      fill(ctx, sx + 10, sy + 4, 58, 12, P.roof2);
      fill(ctx, sx + 26, sy + 44, 22, 28, P.wood3);
      fill(ctx, sx + 30, sy + 48, 14, 24, P.wood2);
      fill(ctx, sx + 48, sy + 44, 14, 14, P.glass);
      fill(ctx, sx + 48, sy + 44, 14, 2, P.wood3);
      fill(ctx, sx + 12, sy + 44, 12, 12, P.glass2);
    } },
    shed: { w: 3, h: 3, draw: function (ctx, sx, sy) {
      fill(ctx, sx + 4, sy + 26, 70, 46, P.wood2);
      fill(ctx, sx + 6, sy + 28, 66, 44, P.wood);
      fill(ctx, sx + 0, sy + 16, 78, 14, P.roof2);
      fill(ctx, sx + 8, sy + 8, 62, 10, P.roof);
      fill(ctx, sx + 26, sy + 44, 24, 28, P.woodDark);
      fill(ctx, sx + 52, sy + 32, 14, 12, P.glass2);
      fill(ctx, sx + 12, sy + 32, 10, 10, P.metal2);
    } },
    door: { w: 1, h: 2, draw: function (ctx, sx, sy, opt) {
      var open = opt && opt.open;
      fill(ctx, sx + 1, sy + 4, 22, 44, P.wood3);
      fill(ctx, sx + 3, sy + 6, 18, 40, P.wood);
      if (open) fill(ctx, sx + 3, sy + 6, 9, 40, '#f6e2c8');
      fill(ctx, sx + 16, sy + 26, 3, 3, P.yellow);
    } },
    jarShelf: { w: 2, h: 2, draw: function (ctx, sx, sy, opt) {
      fill(ctx, sx + 2, sy + 4, 44, 42, P.wood3);
      fill(ctx, sx + 4, sy + 6, 40, 38, P.wood);
      fill(ctx, sx + 3, sy + 26, 42, 4, P.wood3);
      var jars = (opt && opt.jars) || [0, 0, 0];
      var labels = (opt && opt.labels) || [null, null, null];
      for (var i = 0; i < 3; i++) {
        var jx = sx + 6 + i * 13;
        fill(ctx, jx, sy + 8, 11, 18, P.glass);
        fill(ctx, jx + 1, sy + 12, 9, 13, jars[i] ? P.pink : P.glass2);
        if (jars[i] === 2) fill(ctx, jx + 1, sy + 17, 9, 8, P.orange);
        fill(ctx, jx + 2, sy + 5, 7, 4, P.metal2);
        fill(ctx, jx + 1, sy + 9, 3, 6, 'rgba(255,255,255,.55)');
        if (labels[i]) {
          fill(ctx, jx, sy + 30, 11, 12, P.white);
          fill(ctx, jx + 1, sy + 33, 9, 2, P.dark);
          fill(ctx, jx + 1, sy + 37, 6, 2, P.dark);
        }
      }
    } },
    drawers: { w: 2, h: 3, draw: function (ctx, sx, sy, opt) {
      fill(ctx, sx + 3, sy + 4, 42, 66, P.wood3);
      fill(ctx, sx + 5, sy + 6, 38, 62, P.wood);
      var open = (opt && opt.open === undefined) ? -1 : opt.open;
      for (var i = 0; i < 5; i++) {
        var dy = sy + 9 + i * 12;
        fill(ctx, sx + 7, dy, 34, 10, open === i ? '#f9edd6' : P.wood2);
        fill(ctx, sx + 7, dy, 34, 2, P.wood3);
        fill(ctx, sx + 18, dy + 4, 12, 3, P.metal3);
        if (open === i) fill(ctx, sx + 12, dy + 3, 5, 5, P.yellow);
      }
      fill(ctx, sx + 3, sy + 4, 42, 3, P.woodDark);
    } },
    machine: { w: 3, h: 3, draw: function (ctx, sx, sy, opt) {
      fill(ctx, sx + 4, sy + 20, 66, 52, P.metal);
      fill(ctx, sx + 6, sy + 22, 62, 48, P.metal2);
      fill(ctx, sx + 10, sy + 26, 22, 18, P.glass2);
      fill(ctx, sx + 14, sy + 30, 14, 10, (opt && opt.spin) ? P.orange : P.pink2);
      fill(ctx, sx + 38, sy + 26, 24, 10, P.dark2);
      fill(ctx, sx + 40, sy + 28, 20, 6, (opt && opt.on) ? P.yellow : '#6b5c66');
      fill(ctx, sx + 12, sy + 56, 50, 12, P.metal3);
      fill(ctx, sx + 2, sy + 40, 8, 16, P.metal3);
      fill(ctx, sx + 64, sy + 40, 8, 16, P.metal3);
    } },
    robot: { w: 1, h: 1, draw: function (ctx, sx, sy, opt) {
      var bob = opt && opt.bob ? 1 : 0;
      fill(ctx, sx + 7, sy + 3 + bob, 11, 9, P.metal);
      fill(ctx, sx + 9, sy + 5 + bob, 7, 5, P.blue2);
      fill(ctx, sx + 10, sy + 6 + bob, 2, 2, P.white);
      fill(ctx, sx + 4, sy + 13 + bob, 17, 9, P.metal2);
      fill(ctx, sx + 6, sy + 14 + bob, 13, 2, P.pink2);
      fill(ctx, sx + 2, sy + 14 + bob, 3, 6, P.metal3);
      fill(ctx, sx + 20, sy + 14 + bob, 3, 6, P.metal3);
      if (opt && opt.spray) { fill(ctx, sx + 22, sy + 6, 3, 3, P.waterLine); fill(ctx, sx + 25, sy + 9, 2, 2, P.waterLine); }
    } },
    bowl: { w: 1, h: 1, draw: function (ctx, sx, sy, opt) {
      fill(ctx, sx + 4, sy + 14, 16, 7, P.pink2);
      fill(ctx, sx + 6, sy + 12, 12, 5, P.pink);
      if (opt && opt.full) fill(ctx, sx + 8, sy + 11, 8, 4, P.orange);
    } },
    bed: { w: 2, h: 2, draw: function (ctx, sx, sy) {
      fill(ctx, sx + 2, sy + 10, 44, 36, P.wood2);
      fill(ctx, sx + 4, sy + 12, 40, 14, P.white);
      fill(ctx, sx + 4, sy + 26, 40, 18, P.pink);
      fill(ctx, sx + 6, sy + 28, 36, 4, P.pink2);
      fill(ctx, sx + 2, sy + 10, 44, 3, P.wood3);
    } },
    bookshelf: { w: 2, h: 3, draw: function (ctx, sx, sy) {
      fill(ctx, sx + 3, sy + 2, 42, 68, P.wood3);
      fill(ctx, sx + 5, sy + 4, 38, 64, P.wood);
      var cols = [P.pink2, P.blue, P.yellow, P.leaf2, P.purple];
      for (var s = 0; s < 3; s++) {
        var sy2 = sy + 8 + s * 22;
        for (var i = 0; i < 6; i++) {
          fill(ctx, sx + 7 + i * 6, sy2, 5, 16, cols[(i + s) % cols.length]);
          fill(ctx, sx + 7 + i * 6, sy2 + 4, 5, 2, 'rgba(255,255,255,.45)');
        }
        fill(ctx, sx + 5, sy2 + 17, 38, 3, P.wood3);
      }
    } },
    desk: { w: 2, h: 2, draw: function (ctx, sx, sy, opt) {
      fill(ctx, sx + 2, sy + 16, 44, 6, P.wood);
      fill(ctx, sx + 4, sy + 22, 6, 22, P.wood3);
      fill(ctx, sx + 38, sy + 22, 6, 22, P.wood3);
      fill(ctx, sx + 8, sy + 22, 28, 20, P.wood2);
      fill(ctx, sx + 10, sy + 24, 24, 7, (opt && opt.d0) ? '#f9edd6' : P.wood);
      fill(ctx, sx + 10, sy + 33, 24, 7, (opt && opt.d1) ? '#f9edd6' : P.wood);
      fill(ctx, sx + 16, sy + 26, 12, 3, P.dark);
      fill(ctx, sx + 16, sy + 35, 12, 3, P.dark);
    } },
    cave: { w: 3, h: 3, draw: function (ctx, sx, sy, opt) {
      fill(ctx, sx + 2, sy + 18, 70, 54, P.stone2);
      fill(ctx, sx + 6, sy + 10, 62, 46, P.stone);
      fill(ctx, sx + 22, sy + 34, 30, 38, P.dark2);
      fill(ctx, sx + 26, sy + 40, 22, 32, '#241d22');
      fill(ctx, sx + 40, sy + 44, 4, 4, P.bug);
      fill(ctx, sx + 33, sy + 54, 4, 4, P.bug2);
      if (opt && opt.done) fill(ctx, sx + 12, sy + 20, 6, 6, P.yellow);
    } },
    gate: { w: 2, h: 3, draw: function (ctx, sx, sy, opt) {
      var open = opt && opt.open;
      fill(ctx, sx + 0, sy + 6, 8, 66, P.stone3);
      fill(ctx, sx + 40, sy + 6, 8, 66, P.stone3);
      if (!open) {
        for (var i = 0; i < 5; i++) fill(ctx, sx + 6, sy + 12 + i * 12, 36, 6, P.wood3);
      } else {
        fill(ctx, sx + 6, sy + 12, 6, 56, P.wood3);
      }
    } },
    lamp: { w: 1, h: 2, draw: function (ctx, sx, sy, opt) {
      fill(ctx, sx + 11, sy + 20, 3, 26, P.metal3);
      fill(ctx, sx + 5, sy + 6, 15, 14, (opt && opt.on) ? P.yellow : P.metal2);
      fill(ctx, sx + 8, sy + 20, 9, 3, P.metal2);
      if (opt && opt.on) fill(ctx, sx + 2, sy + 2, 21, 20, 'rgba(255,212,121,.22)');
    } },
    chest: { w: 1, h: 1, draw: function (ctx, sx, sy, opt) {
      fill(ctx, sx + 2, sy + 9, 20, 13, P.wood3);
      fill(ctx, sx + 3, sy + 10, 18, 8, (opt && opt.open) ? '#f7e6c9' : P.wood);
      fill(ctx, sx + 2, sy + 9, 20, 3, P.wood2);
      fill(ctx, sx + 11, sy + 14, 4, 5, P.yellow);
    } },
    gem: { w: 1, h: 1, draw: function (ctx, sx, sy, opt) {
      var bob = opt && opt.bob ? 1 : 0;
      fill(ctx, sx + 8, sy + 6 + bob, 8, 10, P.blue);
      fill(ctx, sx + 9, sy + 7 + bob, 6, 4, P.white);
      fill(ctx, sx + 6, sy + 10 + bob, 12, 4, P.blue2);
    } },
    bead: { w: 1, h: 1, draw: function (ctx, sx, sy, opt) {
      var c = (opt && opt.color) || P.pink2;
      fill(ctx, sx + 8, sy + 6, 9, 9, c);
      fill(ctx, sx + 10, sy + 8, 4, 3, P.white);
      fill(ctx, sx, sy + 10, 8, 1, P.wood3);
      fill(ctx, sx + 17, sy + 10, 7, 1, P.wood3);
    } },
    ropePost: { w: 1, h: 1, draw: function (ctx, sx, sy) {
      fill(ctx, sx + 10, sy + 8, 4, 15, P.wood3);
      fill(ctx, sx + 7, sy + 4, 10, 5, P.wood2);
      fill(ctx, sx + 11, sy + 20, 8, 3, P.red);
    } },
    box: { w: 1, h: 1, draw: function (ctx, sx, sy, opt) {
      fill(ctx, sx + 3, sy + 8, 18, 14, P.wood2);
      fill(ctx, sx + 4, sy + 9, 16, 12, (opt && opt.hot) ? '#ffe9b8' : P.wood);
      fill(ctx, sx + 3, sy + 8, 18, 3, P.wood3);
      if (opt && opt.label) {
        fill(ctx, sx + 5, sy + 12, 14, 7, P.white);
        fill(ctx, sx + 7, sy + 14, 10, 3, P.dark);
      }
    } },
    pier: { w: 1, h: 1, draw: function (ctx, sx, sy) {
      fill(ctx, sx, sy, TILE, TILE, P.wood);
      fill(ctx, sx, sy + 5, TILE, 2, P.wood3);
      fill(ctx, sx, sy + 16, TILE, 2, P.wood2);
    } },
    boat: { w: 2, h: 1, draw: function (ctx, sx, sy, opt) {
      var bob = opt && opt.bob ? 1 : 0;
      fill(ctx, sx + 2, sy + 12 + bob, 44, 9, P.wood);
      fill(ctx, sx + 6, sy + 9 + bob, 36, 4, P.wood2);
      fill(ctx, sx + 22, sy + 0 + bob, 3, 12, P.wood3);
      fill(ctx, sx + 25, sy + 2 + bob, 12, 8, P.pink);
    } },
    sprinkler: { w: 1, h: 1, draw: function (ctx, sx, sy, opt) {
      fill(ctx, sx + 9, sy + 12, 7, 9, P.metal2);
      fill(ctx, sx + 5, sy + 8, 15, 5, P.metal);
      if (opt && opt.on) {
        fill(ctx, sx + 2, sy + 2, 3, 3, P.waterLine);
        fill(ctx, sx + 20, sy + 4, 3, 3, P.waterLine);
        fill(ctx, sx + 12, sy, 3, 3, P.waterLine);
      }
    } },
    butterfly: { w: 1, h: 1, draw: function (ctx, sx, sy, opt) {
      var f = opt && opt.flap ? 1 : 0;
      fill(ctx, sx + 10, sy + 10, 3, 5, P.dark);
      fill(ctx, sx + 6 + f, sy + 7, 5, 5, P.purple);
      fill(ctx, sx + 13 - f, sy + 7, 5, 5, P.violet);
      fill(ctx, sx + 7 + f, sy + 13, 4, 4, P.pink);
      fill(ctx, sx + 13 - f, sy + 13, 4, 4, P.pink2);
    } }
  };

  // ---------- 组合绘制 ----------
  function drawTerrain(ctx, id, sx, sy, t, tx, ty) {
    var fn = TERRAIN[id] || TERRAIN.grass;
    fn(ctx, sx, sy, t || 0, tx || 0, ty || 0);
  }

  function drawObject(ctx, kind, sx, sy, opt) {
    var o = OBJ[kind];
    if (!o) return;
    o.draw(ctx, sx, sy, opt || {});
  }

  function sizeOf(kind) {
    var o = OBJ[kind];
    return o ? { w: o.w, h: o.h } : { w: 1, h: 1 };
  }

  // ---------- HUD 小图标 ----------
  var ICON = {
    fish: function (ctx, sx, sy, s) {
      s = s || 2;
      fill(ctx, sx, sy + 2 * s, 3 * s, s, P.pink2);
      fill(ctx, sx, sy + s, 6 * s, 3 * s, P.pink);
      fill(ctx, sx, sy + 2 * s, s, s, P.white);
      fill(ctx, sx + 6 * s, sy + 2 * s, 2 * s, s, P.pink2);
    },
    gem: function (ctx, sx, sy, s) {
      s = s || 2;
      fill(ctx, sx + 2 * s, sy, 3 * s, s, P.blue);
      fill(ctx, sx, sy + s, 7 * s, 3 * s, P.blue);
      fill(ctx, sx + 2 * s, sy + 4 * s, 3 * s, 2 * s, P.blue2);
    },
    heart: function (ctx, sx, sy, s) {
      s = s || 2;
      fill(ctx, sx + s, sy, 2 * s, s, P.pink2);
      fill(ctx, sx + 4 * s, sy, 2 * s, s, P.pink2);
      fill(ctx, sx, sy + s, 7 * s, 2 * s, P.pink2);
      fill(ctx, sx + s, sy + 3 * s, 5 * s, s, P.pink2);
      fill(ctx, sx + 2 * s, sy + 4 * s, 3 * s, s, P.pink2);
      fill(ctx, sx + 3 * s, sy + 5 * s, s, s, P.pink2);
    }
  };

  CC.WorldArt = {
    TILE: TILE,
    PAL: P,
    drawTerrain: drawTerrain,
    drawObject: drawObject,
    sizeOf: sizeOf,
    drawIcon: function (ctx, name, sx, sy, s) {
      if (ICON[name]) ICON[name](ctx, sx, sy, s);
    },
    objectNames: function () { return Object.keys(OBJ); },
    terrainNames: function () { return Object.keys(TERRAIN); }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
