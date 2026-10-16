/*!
 * 粉猫捉虫 · 大世界引擎
 * 走路、碰撞、相机、交互提示、飘动的特效、会自己散步的蝴蝶。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var ART = CC.WorldArt;
  var DATA = CC.WorldData;
  var TILE = DATA.TILE;
  var VIEW_W = 24;   // 视口宽（格子）
  var VIEW_H = 14;   // 视口高（格子）

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  var World = {
    canvas: null,
    ctx: null,
    state: null,
    area: null,
    areaId: '',
    objects: [],
    player: { x: 0, y: 0, dir: 'down', moving: false, anim: 0, blinkAt: 0, blinkUntil: 0 },
    camera: { x: 0, y: 0 },
    keys: {},
    particles: [],
    pad: { up: false, down: false, left: false, right: false },
    target: null,
    hover: null,
    hooks: {},
    t: 0,
    last: 0,
    raf: null,
    running: false,
    sparkleAt: 0,

    init: function (canvas, hooks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      canvas.width = VIEW_W * TILE;
      canvas.height = VIEW_H * TILE;
      if (canvas.style) canvas.style.imageRendering = 'pixelated';
      this.hooks = hooks || {};
      this.state = this.hooks.state || (CC.App && CC.App.state) || {};
      return this;
    },

    flags: function () {
      var st = this.state || {};
      return st.worldFlags || (st.worldFlags = {});
    },
    puzzles: function () {
      var st = this.state || {};
      return st.puzzlesDone || (st.puzzlesDone = {});
    },

    // ---------- 载入区域 ----------
    load: function (areaId, spawn) {
      var area = DATA.Area.get(areaId);
      this.area = area;
      this.areaId = area.id;
      this.tiles = DATA.Area.decode(area.rows);
      this.pixels = { w: area.size.w * TILE, h: area.size.h * TILE };
      // 物件加上像素坐标 + 随机装饰参数
      this.objects = [];
      var self = this;
      (area.objects || []).forEach(function (o, i) {
        var copy = {};
        for (var k in o) copy[k] = o[k];
        copy.px = o.x * TILE;
        copy.py = o.y * TILE;
        copy.seed = i;
        self.objects.push(copy);
      });
      var sp = spawn || area.spawn || { x: area.size.w / 2, y: area.size.h / 2 };
      this.player.x = sp.x * TILE;
      this.player.y = sp.y * TILE;
      this.player.dir = sp.dir || 'down';
      this.particles = [];
      this.hover = null;
      this.updateCamera(true);
      if (this.hooks.onArea) this.hooks.onArea(area);
      this.draw();
      return this;
    },

    savePosition: function () {
      if (!this.state) return;
      this.state.world = { area: this.areaId, x: this.player.x / TILE, y: this.player.y / TILE, dir: this.player.dir };
    },

    // ---------- 碰撞 ----------
    solidRects: function () {
      var out = [];
      var fixed = !!this.flags().bridgeFixed;
      var tiles = this.tiles;
      var h = tiles.length, w = tiles[0].length;
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var id = tiles[y][x];
          var solid = false;
          if (id === 'water' || id === 'wall') solid = true;
          if (id === 'bridge' && !fixed) solid = true;   // 桥没修好 = 过不去
          if (solid) out.push({ x: x * TILE, y: y * TILE, w: TILE, h: TILE });
        }
      }
      for (var i = 0; i < this.objects.length; i++) {
        var o = this.objects[i];
        if (!o.solid) continue;
        out.push({ x: o.px + o.solid[0] * TILE, y: o.py + o.solid[1] * TILE, w: o.solid[2] * TILE, h: o.solid[3] * TILE });
      }
      return out;
    },

    hit: function (x, y, rects) {
      var hw = 7, hh = 5;   // 小猫的脚：一个很小的碰撞盒，走起来才顺
      var left = x - hw, right = x + hw, top = y - hh, bottom = y + hh;
      for (var i = 0; i < rects.length; i++) {
        var r = rects[i];
        if (right > r.x && left < r.x + r.w && bottom > r.y && top < r.y + r.h) return true;
      }
      return false;
    },

    updateCamera: function (force) {
      var vw = VIEW_W * TILE, vh = VIEW_H * TILE;
      var cx, cy;
      if (this.pixels.w <= vw) cx = (this.pixels.w - vw) / 2;
      else cx = clamp(this.player.x - vw / 2, 0, this.pixels.w - vw);
      if (this.pixels.h <= vh) cy = (this.pixels.h - vh) / 2;
      else cy = clamp(this.player.y - vh / 2, 0, this.pixels.h - vh);
      this.camera.x = Math.round(cx);
      this.camera.y = Math.round(cy);
    },

    // ---------- 输入 ----------
    setKey: function (key, down) {
      this.keys[key] = down;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(key) >= 0) this.manual = true;
    },
    setPad: function (dir, down) {
      if (down) this.manual = true;
      this.pad[dir] = down;
    },
    moveTo: function (px, py) {
      this.tapTarget = { x: px, y: py };
      this.manual = false;
    },
    stopMoving: function () {
      this.tapTarget = null;
      this.pad.up = this.pad.down = this.pad.left = this.pad.right = false;
    },

    // ---------- 每帧 ----------
    start: function () {
      if (this.running) return;
      this.running = true;
      this.last = 0;
      var self = this;
      var loop = function (ts) {
        if (!self.running) return;
        var dt = self.last ? Math.min(0.05, (ts - self.last) / 1000) : 0.016;
        self.last = ts;
        self.tick(dt);
        self.raf = root.requestAnimationFrame(loop);
      };
      this.raf = root.requestAnimationFrame(loop);
    },
    stop: function () {
      this.running = false;
      if (this.raf) root.cancelAnimationFrame(this.raf);
    },

    tick: function (dt) {
      this.t += dt * 1000;
      var dx = 0, dy = 0;
      if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'] || this.pad.left) dx -= 1;
      if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'] || this.pad.right) dx += 1;
      if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'] || this.pad.up) dy -= 1;
      if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S'] || this.pad.down) dy += 1;

      // 点击地面走过去
      if (!dx && !dy && this.tapTarget) {
        var tx = this.tapTarget.x - this.player.x;
        var ty = this.tapTarget.y - this.player.y;
        var d = Math.sqrt(tx * tx + ty * ty);
        if (d < 6) this.tapTarget = null;
        else { dx = tx / d; dy = ty / d; }
      }

      var len = Math.sqrt(dx * dx + dy * dy);
      if (len > 1e-4) {
        dx /= len; dy /= len;
        var speed = 86 * dt;
        var rects = this.solidRects();
        var nx = this.player.x + dx * speed;
        if (!this.hit(nx, this.player.y, rects)) this.player.x = nx;
        var ny = this.player.y + dy * speed;
        if (!this.hit(this.player.x, ny, rects)) this.player.y = ny;
        this.player.x = clamp(this.player.x, 8, this.pixels.w - 8);
        this.player.y = clamp(this.player.y, 10, this.pixels.h - 4);
        this.player.moving = true;
        this.player.anim += dt;
        if (Math.abs(dx) > Math.abs(dy)) this.player.dir = dx > 0 ? 'right' : 'left';
        else this.player.dir = dy > 0 ? 'down' : 'up';
      } else {
        this.player.moving = false;
      }

      // 交互目标
      this.hover = this.nearest();
      this.updateCamera();

      // 特效
      if (this.particles.length) {
        var keep = [];
        for (var i = 0; i < this.particles.length; i++) {
          var p = this.particles[i];
          p.life -= dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 40 * dt;
          if (p.life > 0) keep.push(p);
        }
        this.particles = keep;
      }
      this.draw();
    },

    nearest: function () {
      var best = null, bestD = 1e9;
      var px = this.player.x, py = this.player.y;
      for (var i = 0; i < this.objects.length; i++) {
        var o = this.objects[i];
        if (o.ambient) continue;
        if (!o.puzzle && !o.to && !o.talk) continue;
        var w = (o.solid ? o.solid[2] : 1) * TILE;
        var h = (o.solid ? o.solid[3] : 1) * TILE;
        var cx = o.px + w / 2, cy = o.py + h / 2;
        var d = Math.sqrt((cx - px) * (cx - px) + (cy - py) * (cy - py));
        if (d < 46 && d < bestD) { bestD = d; best = o; }
      }
      return best;
    },

    interact: function () {
      var o = this.hover;
      if (!o) return null;
      if (this.hooks.onInteract) this.hooks.onInteract(o);
      return o;
    },

    burst: function (x, y, kind, count) {
      var self = this;
      count = count || 8;
      for (var i = 0; i < count; i++) {
        this.particles.push({
          kind: kind || 'spark',
          x: x + (Math.random() - 0.5) * 26,
          y: y + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 40,
          vy: -30 - Math.random() * 50,
          life: 0.7 + Math.random() * 0.7
        });
      }
    },
    burstAtObject: function (obj, kind, count) {
      if (!obj) return;
      this.burst(obj.px + TILE, obj.py + TILE * 0.6, kind, count);
    },

    // ---------- 绘制 ----------
    draw: function () {
      var ctx = this.ctx;
      if (!ctx) return;
      var camX = this.camera.x, camY = this.camera.y;
      var vw = VIEW_W * TILE, vh = VIEW_H * TILE;
      ctx.clearRect(0, 0, vw, vh);
      // 地图比视口小时，四周填上「地砖边」，看起来像室内
      ctx.fillStyle = '#6b5c66';
      ctx.fillRect(0, 0, vw, vh);

      var x0 = Math.max(0, Math.floor(camX / TILE));
      var y0 = Math.max(0, Math.floor(camY / TILE));
      var x1 = Math.min(this.area.size.w - 1, Math.ceil((camX + vw) / TILE));
      var y1 = Math.min(this.area.size.h - 1, Math.ceil((camY + vh) / TILE));
      var fixed = !!this.flags().bridgeFixed;
      var bloomed = !!this.flags().robotDone;
      var lit = !!this.flags().lighthouse;

      for (var y = y0; y <= y1; y++) {
        for (var x = x0; x <= x1; x++) {
          var id = this.tiles[y][x];
          if (id === 'bridge' && !fixed) id = 'bridge_broken';
          ART.drawTerrain(ctx, id, x * TILE - camX, y * TILE - camY, this.t, x, y);
        }
      }

      // 物件 + 小猫：按脚底 y 排序，谁在前面谁挡住谁
      var drawables = [];
      for (var i = 0; i < this.objects.length; i++) {
        var o = this.objects[i];
        drawables.push({ y: o.py + ((o.solid ? o.solid[1] + o.solid[3] : 1) * TILE), obj: o });
      }
      drawables.push({ y: this.player.y + 10, player: true });
      drawables.sort(function (a, b) { return a.y - b.y; });

      for (var d = 0; d < drawables.length; d++) {
        var item = drawables[d];
        if (item.player) this.drawPlayer(ctx, camX, camY);
        else this.drawObject(ctx, item.obj, camX, camY, fixed, bloomed, lit);
      }

      // 交互提示：跳动的感叹号
      if (this.hover) {
        var ox = this.hover.px + ((this.hover.solid ? this.hover.solid[2] : 1) * TILE) / 2;
        var oy = this.hover.py - 16 + Math.sin(this.t / 220) * 2;
        var bx = ox - camX, by = oy - camY;
        ctx.fillStyle = '#fffdfa';
        ctx.fillRect(bx - 9, by - 12, 18, 18);
        ctx.fillStyle = '#e58fb0';
        ctx.fillRect(bx - 6, by - 9, 12, 12);
        ctx.fillStyle = '#fffdfa';
        ctx.fillRect(bx - 1, by - 7, 3, 6);
        ctx.fillRect(bx - 1, by + 1, 3, 3);
      }

      // 特效
      for (var p = 0; p < this.particles.length; p++) {
        var pt = this.particles[p];
        var a = Math.max(0, Math.min(1, pt.life));
        ctx.globalAlpha = a;
        var sx = Math.round(pt.x - camX), sy = Math.round(pt.y - camY);
        if (pt.kind === 'heart') {
          ctx.fillStyle = '#e58fb0';
          ctx.fillRect(sx - 3, sy - 3, 6, 5);
          ctx.fillRect(sx - 1, sy + 1, 2, 3);
        } else if (pt.kind === 'water') {
          ctx.fillStyle = '#d6ecf6';
          ctx.fillRect(sx - 2, sy - 2, 4, 4);
        } else {
          ctx.fillStyle = '#ffd479';
          ctx.fillRect(sx - 1, sy - 4, 2, 8);
          ctx.fillRect(sx - 4, sy - 1, 8, 2);
        }
      }
      ctx.globalAlpha = 1;

      // 灯塔亮起来的时候，海面上一层暖暖的光
      if (lit) {
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = '#ffd479';
        ctx.fillRect(0, 0, vw, vh);
        ctx.globalAlpha = 1;
      }
    },

    drawObject: function (ctx, o, camX, camY, fixed, bloomed, lit) {
      var art = ART;
      var opt = {};
      for (var k in (o.opt || {})) opt[k] = o.opt[k];
      if (o.id === 'bridge') {
        // 桥面由地形自己画（修好前是断桥，修好后是木板桥）
        // 这里只补两端的桥头木桩，让桥看起来是接在岸上的
        if (fixed) {
          art.drawObject(ctx, 'pier', o.px - TILE - camX, o.py - camY, opt);
          art.drawObject(ctx, 'pier', o.px + TILE * 2 - camX, o.py - camY, opt);
        }
        return;
      }
      if (o.kind === 'gate') opt.open = !!this.flags().gateOpen;
      if (o.kind === 'cave') opt.done = !!this.flags().caveCleared;
      if (o.kind === 'lamp') opt.on = !!this.flags().lighthouse;
      if (o.flower) opt.bloomed = !!this.flags().robotDone;
      if (o.kind === 'sprinkler') opt.on = !!this.flags().robotDone;
      if (o.kind === 'robot') { opt.bob = Math.floor(this.t / 400 + o.seed) % 2 === 0; opt.spray = !!this.flags().robotDone; }
      if (o.kind === 'boat') opt.bob = Math.floor(this.t / 600) % 2 === 0;
      if (o.kind === 'gem') opt.bob = Math.floor(this.t / 300) % 2 === 0;
      if (o.kind === 'butterfly') {
        // 蝴蝶自己飘来飘去
        opt.flap = Math.floor(this.t / 160) % 2 === 0;
        var t = this.t / 1000 + o.seed * 2;
        o.px = (o.x + Math.sin(t * 0.6) * 1.6) * TILE;
        o.py = (o.y + Math.cos(t * 0.8) * 1.2) * TILE;
      }
      if (o.kind === 'jarShelf') {
        var pd = this.puzzles();
        opt.jars = pd.jars ? [1, 2, 1] : [0, 0, 0];
        opt.labels = pd.jars ? ['A', 'B', 'C'] : [null, null, null];
      }
      if (o.kind === 'drawers') {
        var pd2 = this.puzzles();
        opt.open = pd2.drawers === undefined ? -1 : (pd2.drawers ? 2 : -1);
      }
      if (o.kind === 'machine') {
        var pd3 = this.puzzles();
        opt.on = !!pd3.machine;
        opt.spin = Math.floor(this.t / 200) % 2 === 0 && !!pd3.machine;
      }
      if (o.kind === 'bookshelf') {
        // 书架旁边偶尔飘一颗小星星，提示这里有故事
        if (Math.floor(this.t / 900) % 3 === 0) opt.spin = true;
      }
      if (o.kind === 'bowl') opt.full = (this.state && this.state.hunger > 55);
      if (o.kind === 'chest') opt.open = !!(this.puzzles().bag);
      art.drawObject(ctx, o.kind, o.px - camX, o.py - camY, opt);
    },

    drawPlayer: function (ctx, camX, camY) {
      var p = this.player;
      var art = CC.PetArt;
      var frame = 'idle';
      if (p.dir === 'up') frame = 'back';
      else if (p.moving) frame = p.dir === 'down' ? 'walk' : 'walk';
      if (!p.moving) {
        var now = this.t;
        if (now > p.blinkAt) { p.blinkAt = now + 2200 + Math.random() * 3000; p.blinkUntil = now + 200; }
        frame = (p.blinkUntil && now < p.blinkUntil) ? 'blink' : (p.dir === 'up' ? 'back' : 'idle');
      }
      var bob = p.moving ? (Math.floor(this.t / 120) % 2 === 0 ? -1 : 0) : 0;
      var size = 32;
      var x = Math.round(p.x - camX - size / 2);
      var y = Math.round(p.y - camY - size + 8 + bob);

      // 影子
      ctx.fillStyle = 'rgba(91,68,83,.16)';
      ctx.fillRect(Math.round(p.x - camX - 7), Math.round(p.y - camY - 3), 14, 4);

      if (p.dir === 'left' || p.dir === 'right') {
        ctx.save();
        if (p.dir === 'right') {
          ctx.translate(x + size, y);
          ctx.scale(-1, 1);
          art.drawFrame(ctx, frame, 1, 0, 0);
        } else {
          art.drawFrame(ctx, frame, 1, x, y);
        }
        ctx.restore();
      } else {
        art.drawFrame(ctx, frame, 1, x, y);
      }
    },

    // 把屏幕坐标换成世界坐标（点击走路 / 点物件）
    toWorld: function (clientX, clientY) {
      var rect = this.canvas.getBoundingClientRect();
      var sx = (clientX - rect.left) / rect.width * this.canvas.width;
      var sy = (clientY - rect.top) / rect.height * this.canvas.height;
      return { x: sx + this.camera.x, y: sy + this.camera.y, sx: sx, sy: sy };
    },
    objectAt: function (worldX, worldY) {
      for (var i = this.objects.length - 1; i >= 0; i--) {
        var o = this.objects[i];
        if (o.ambient) continue;
        var w = (o.solid ? o.solid[2] : 1) * TILE + 8;
        var h = (o.solid ? o.solid[3] : 1) * TILE + 8;
        if (worldX >= o.px - 4 && worldX <= o.px + w && worldY >= o.py - 4 && worldY <= o.py + h) return o;
      }
      return null;
    }
  };

  CC.World = World;
  CC.World.VIEW_W = VIEW_W;
  CC.World.VIEW_H = VIEW_H;
})(typeof globalThis !== 'undefined' ? globalThis : this);
