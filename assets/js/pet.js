/*!
 * 粉猫捉虫 · 猫猫动画（canvas 像素动画 + 小情绪）
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});

  var SEQUENCES = {
    happy: [{ frame: 'happy', ms: 900 }],
    eat: [{ frame: 'eat', ms: 350 }, { frame: 'chew', ms: 250 }, { frame: 'eat', ms: 300 }, { frame: 'chew', ms: 250 }, { frame: 'happy', ms: 600 }],
    love: [{ frame: 'love', ms: 1200 }, { frame: 'happy', ms: 500 }],
    levelup: [{ frame: 'dizzy', ms: 500 }, { frame: 'love', ms: 900 }, { frame: 'happy', ms: 700 }],
    dizzy: [{ frame: 'dizzy', ms: 1200 }],
    sad: [{ frame: 'sad', ms: 1200 }],
    sleep: [{ frame: 'sleep', ms: 1600 }],
    surprised: [{ frame: 'dizzy', ms: 400 }, { frame: 'blink', ms: 200 }, { frame: 'idle', ms: 400 }]
  };

  var PARTICLES = {
    love: ['heart'],
    levelup: ['star', 'sparkle', 'heart'],
    eat: ['heart'],
    dizzy: ['sparkle'],
    happy: ['heart']
  };

  function Pet(canvas, options) {
    options = options || {};
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.art = CC.PetArt;
    this.scale = options.scale || 5;
    this.size = (this.art ? this.art.WIDTH : 32) * this.scale;
    if (canvas) {
      canvas.width = this.size;
      canvas.height = this.size;
      if (canvas.style) canvas.style.imageRendering = 'pixelated';
    }
    this.base = 'idle';
    this.frame = 'idle';
    this.sequence = null;
    this.seqIndex = 0;
    this.seqUntil = 0;
    this.particles = [];
    this.blinkAt = 0;
    this.blinkUntil = 0;
    this.condition = 'ok';       // ok / hungry / lonely / happy
    this.equipped = { bow: false, star: false };
    this.timer = null;
    this.onTick = options.onTick || null;
    this.idleFrame = 'idle';
    this.lastDraw = 0;
  }

  Pet.prototype.destroy = function () {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  };

  Pet.prototype.start = function () {
    var self = this;
    if (this.timer) return;
    this.timer = setInterval(function () { self.tick(); }, 120);
    this.tick();
  };

  // 根据数值决定平时的心情（不打断正在播放的反应动画）
  Pet.prototype.setCondition = function (state) {
    if (!state) return;
    if (state.hunger < 25) this.condition = 'hungry';
    else if (state.mood < 30) this.condition = 'lonely';
    else if (state.mood >= 80 && state.hunger >= 50) this.condition = 'happy';
    else this.condition = 'ok';
  };

  Pet.prototype.react = function (kind) {
    var seq = SEQUENCES[kind];
    if (!seq) return;
    this.sequence = seq;
    this.seqIndex = 0;
    this.seqUntil = Date.now() + seq[0].ms;
    this.frame = seq[0].frame;
    var sprites = PARTICLES[kind] || [];
    for (var i = 0; i < sprites.length; i++) {
      this.particles.push({
        sprite: sprites[i],
        x: 0.15 + Math.random() * 0.7,
        y: 0.25 + Math.random() * 0.2,
        vy: -0.35 - Math.random() * 0.3,
        life: 1400,
        born: Date.now() + i * 120
      });
    }
    this.draw();
  };

  Pet.prototype.tick = function () {
    var now = Date.now();

    // 反应动画播放
    if (this.sequence) {
      if (now >= this.seqUntil) {
        this.seqIndex++;
        if (this.seqIndex >= this.sequence.length) {
          this.sequence = null;
          this.frame = this.idleFrame;
        } else {
          this.frame = this.sequence[this.seqIndex].frame;
          this.seqUntil = now + this.sequence[this.seqIndex].ms;
        }
      }
    } else {
      // 平时：偶尔眨眼 + 按状态微调
      if (now >= this.blinkAt) {
        this.blinkAt = now + 2200 + Math.random() * 3600;
        this.blinkUntil = now + 220;
        this.frame = 'blink';
      } else if (this.blinkUntil && now >= this.blinkUntil) {
        this.blinkUntil = 0;
        this.frame = this.idleFrame;
      }
      if (!this.blinkUntil) {
        if (this.condition === 'hungry') this.idleFrame = Math.random() < 0.35 ? 'sad' : 'idle';
        else if (this.condition === 'lonely') this.idleFrame = Math.random() < 0.35 ? 'sad' : 'idle';
        else if (this.condition === 'happy') this.idleFrame = Math.random() < 0.2 ? 'happy' : 'idle';
        else this.idleFrame = 'idle';
        this.frame = this.idleFrame;
      }
    }

    // 飘浮的小图标
    if (this.particles.length) {
      var keep = [];
      for (var i = 0; i < this.particles.length; i++) {
        var p = this.particles[i];
        if (now < p.born) { keep.push(p); continue; }
        var age = (now - p.born) / p.life;
        if (age >= 1) continue;
        p.y += p.vy * 0.12;
        keep.push(p);
      }
      this.particles = keep;
    }

    this.draw();
    if (this.onTick) this.onTick();
  };

  Pet.prototype.draw = function () {
    var ctx = this.ctx;
    if (!ctx) return;
    var art = this.art;
    ctx.clearRect(0, 0, this.size, this.size);
    var bob = (Math.floor(Date.now() / 640) % 2) ? -1 : 0;
    var scale = this.scale;
    var oy = bob * scale;
    var frame = art.FRAMES[this.frame] ? this.frame : 'idle';
    art.drawFrame(ctx, frame, scale, 0, oy);
    if (this.equipped && this.equipped.bow) {
      art.drawSprite(ctx, 'bow', scale, 21 * scale, (5 + bob) * scale);
    }
    if (this.equipped && this.equipped.star) {
      art.drawSprite(ctx, 'charm', scale, 15 * scale, (24 + bob) * scale);
    }
    var now = Date.now();
    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      if (now < p.born) continue;
      var age = (now - p.born) / p.life;
      ctx.globalAlpha = Math.max(0, 1 - age);
      art.drawSprite(ctx, p.sprite, Math.max(2, Math.round(scale * 0.75)), Math.round(p.x * this.size), Math.round((p.y + oy / this.size) * this.size));
      ctx.globalAlpha = 1;
    }
  };

  CC.Pet = Pet;
  CC.PetSequences = SEQUENCES;
})(typeof globalThis !== 'undefined' ? globalThis : this);