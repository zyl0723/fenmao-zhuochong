/*!
 * 粉猫捉虫 · 像素猫画稿（v2）
 * 全部用代码画出来（不依赖任何图片文件），离线也能显示。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});

  // ---------- 调色板（藕粉 / 灰粉色调） ----------
  var PALETTE = {
    '.': null,      // 透明
    '#': '#5b4453', // 深紫灰轮廓
    P: '#f9c9dd',   // 主毛色（粉）
    p: '#eba6c4',   // 毛色阴影
    L: '#ffe4ef',   // 毛色高光 / 口鼻
    E: '#ff9ec4',   // 耳朵内侧
    Y: '#3f2c37',   // 眼睛
    W: '#ffffff',   // 眼睛高光
    B: '#f888b0',   // 腮红
    M: '#b9527a',   // 鼻子 / 嘴巴
    R: '#e2698f',   // 项圈
    G: '#ffd479',   // 铃铛
    S: '#fff2a8',   // 星星
    H: '#ff8fb4',   // 爱心
    Z: '#c9a7d6',   // 睡觉的 Z
    T: '#f7b7d3'    // 尾巴
  };

  var W = 32, H = 32;

  // ---------- 正面坐姿（32 × 32） ----------
  var BASE = [
    '................................',
    '................................',
    '..........#..........#..........',
    '.........#E#........#E#.........',
    '........#EEE#......#EEE#........',
    '........#EEE#######EEE#........',
    '.......#PPPPPPPPPPPPPPPP#.......',
    '......#PPPPPPPPPPPPPPPPPP#......',
    '......#PPPPPPPPPPPPPPPPPP#......',
    '......#PPPPPPPPPPPPPPPPPP#......',
    '......#PPPPPPPPPPPPPPPPPP#......',
    '......#pPPPPPPPPPPPPPPPPp#......',
    '......#PPPPPPPPPPPPPPPPPP#......',
    '......#PPPPPPPPPPPPPPPPPP#......',
    '......#PPPPPPPPPPPPPPPPPP#......',
    '......#PPPPPPPPPPPPPPPPPP#......',
    '......#BBPPPLLLLLLLLPPPBB#......',
    '......#BBPPPLLLMMLLLPPPBB#......',
    '......#PPPPPLLMLLMLLPPPPP#......',
    '......#PPPPPLLLMMLLLPPPPP#......',
    '.......#pPPPPPPPPPPPPPPp#.......',
    '........#PPPPPPPPPPPPPP#........',
    '.........#RRRRRRRRRRRR#TT.......',
    '..........#RRRRGGRRRR#TT........',
    '.........#PPPPPPPPPPPP#TT.......',
    '.........#PPPPPPPPPPPP#TT.......',
    '.........#PPPPPPPPPPPP#TT.......',
    '.........#PPPPPPPPPPPP#TT.......',
    '.........#PPpPPPPPPpPP#TTT......',
    '.........#LLL#PPPP#LLL#TTTT.....',
    '.........##############TTTTT....',
    '................................'
  ];

  // ---------- 表情替换 ----------
  // 眼睛区域：行 12~15，列 9~12（右侧自动镜像到 19~22）
  var EYES = {
    open: ['YYYY', 'YWYY', 'YYYY', 'PYYP'],
    blink: ['PPPP', '####', 'PPPP', 'PPPP'],
    happy: ['P##P', '#PP#', 'PPPP', 'PPPP'],
    sad: ['####', 'PPPP', 'PPPP', 'PPPP'],
    sleep: ['PPPP', '####', 'PPPP', 'PPPP'],
    closed: ['PPPP', '####', 'PPPP', 'PPPP'],
    sparkle: ['WPPP', 'PYYY', 'YYYW', 'PWPP'],
    none: ['PPPP', 'PPPP', 'PPPP', 'PPPP']
  };

  // 嘴巴区域：行 18~19，列 14~17
  var MOUTHS = {
    none: ['LLLL', 'LLLL'],
    normal: null,
    open: ['MMMM', 'LMML'],
    smile: ['LMML', 'MMMM'],
    small: ['LLLL', 'LMML'],
    wide: ['MLLM', 'MMMM'],
    sad: ['LLLL', 'LMML']
  };

  var FRAMES = {
    idle: { eyes: 'open', mouth: 'normal' },
    blink: { eyes: 'blink', mouth: 'normal' },
    happy: { eyes: 'happy', mouth: 'smile' },
    eat: { eyes: 'happy', mouth: 'open' },
    chew: { eyes: 'blink', mouth: 'small' },
    sleep: { eyes: 'sleep', mouth: 'small', extras: [{ sprite: 'zzz', row: 6, col: 22 }] },
    sad: { eyes: 'sad', mouth: 'sad', extras: [{ sprite: 'sweat', row: 9, col: 24 }] },
    love: { eyes: 'happy', mouth: 'smile', extras: [{ sprite: 'heart', row: 6, col: 26 }, { sprite: 'heart', row: 10, col: 1 }] },
    dizzy: { eyes: 'sparkle', mouth: 'wide', extras: [{ sprite: 'sparkle', row: 4, col: 2 }, { sprite: 'sparkle', row: 8, col: 27 }] },
    // 大世界里用到：背影（往上看）、迈步、扑通扑通
    back: { eyes: 'none', mouth: 'none' },
    walk: { eyes: 'open', mouth: 'normal' },
    walkBack: { eyes: 'none', mouth: 'none' }
  };

  // ---------- 小装饰 / 小图标 ----------
  var SPRITES = {
    heart: [
      '.HH.HH.',
      'HHHHHHH',
      'HHHHHHH',
      '.HHHHH.',
      '..HHH..',
      '...H...'
    ],
    star: [
      '...S...',
      '...S...',
      '.SSSSS.',
      '..SSS..',
      '.SS.SS.',
      '..S...S'
    ],
    sparkle: [
      '...S...',
      '.S.S.S.',
      '..SSS..',
      'SSSSSSS',
      '..SSS..',
      '.S.S.S.',
      '...S...'
    ],
    zzz: [
      'ZZZZZ..',
      '...Z...',
      '..Z....',
      '.Z.....',
      'ZZZZZ..'
    ],
    sweat: [
      '.T.',
      'TTT',
      '.T.'
    ],
    face: [
      '..#........#..',
      '.#E#......#E#.',
      '.#EE#....#EE#.',
      '#PPPPPPPPPPPP#',
      '#PPPPPPPPPPPP#',
      '#PYYPPPPPPYYP#',
      '#PYWPPPPPPWYP#',
      '#PYYPPPPPPYYP#',
      '#PPPPMMPPPPPP#',
      '#PPPPPPPPPPPP#',
      '.#PPPPPPPPPP#.',
      '..##########..'
    ],
    fish: [
      '...ppppp..',
      '.pppppppp.',
      'pppp#ppppp',
      'ppppppppp.',
      '.pppppppp.',
      '...ppppp..'
    ],
    anger: [
      '.Y..Y.',
      '..YY..',
      '.Y..Y.'
    ]
  };

  // ---------- 组装 ----------

  function cloneGrid() {
    var g = [];
    for (var y = 0; y < H; y++) g.push(BASE[y].split(''));
    return g;
  }

  function paint(grid, rows, atRow, atCol) {
    for (var y = 0; y < rows.length; y++) {
      for (var x = 0; x < rows[y].length; x++) {
        var ch = rows[y][x];
        var gy = atRow + y;
        var gx = atCol + x;
        if (gy < 0 || gy >= H || gx < 0 || gx >= W) continue;
        if (ch === '.' ) continue;          // 透明像素不覆盖
        if (grid[gy][gx] === '#') continue; // 保留轮廓线
        grid[gy][gx] = ch;
      }
    }
  }

  function buildFrame(name) {
    var def = FRAMES[name] || FRAMES.idle;
    var grid = cloneGrid();
    var eyes = EYES[def.eyes] || EYES.open;
    paint(grid, eyes, 12, 9);
    paint(grid, eyes, 12, W - 9 - 4);
    if (def.mouth && MOUTHS[def.mouth]) paint(grid, MOUTHS[def.mouth], 18, 14);
    var extras = def.extras || [];
    for (var i = 0; i < extras.length; i++) {
      var ex = extras[i];
      var sp = SPRITES[ex.sprite];
      if (!sp) continue;
      paint(grid, sp, ex.row, ex.col);
    }
    return grid;
  }

  function colorOf(ch) {
    var c = PALETTE[ch];
    return c === undefined ? null : c;
  }

  // 把一帧画到 canvas 上（scale = 放大倍数，保持像素风）
  function drawFrame(ctx, name, scale, offsetX, offsetY) {
    var grid = buildFrame(name);
    var s = scale || 1;
    var ox = offsetX || 0;
    var oy = offsetY || 0;
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var color = colorOf(grid[y][x]);
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(ox + x * s, oy + y * s, s, s);
      }
    }
    return grid;
  }

  function drawSprite(ctx, name, scale, offsetX, offsetY) {
    var sp = SPRITES[name];
    if (!sp) return;
    var s = scale || 1;
    for (var y = 0; y < sp.length; y++) {
      for (var x = 0; x < sp[y].length; x++) {
        var color = colorOf(sp[y][x]);
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect((offsetX || 0) + x * s, (offsetY || 0) + y * s, s, s);
      }
    }
  }

  CC.PetArt = {
    WIDTH: W,
    HEIGHT: H,
    PALETTE: PALETTE,
    SPRITES: SPRITES,
    FRAMES: FRAMES,
    buildFrame: buildFrame,
    drawFrame: drawFrame,
    drawSprite: drawSprite,
    colorOf: colorOf
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);