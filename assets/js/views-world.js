/*!
 * 粉猫捉虫 · 大世界界面
 * 一块画布 + HUD + 小猫对话条 + 谜题面板 + 手机方向键。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var doc = root.document;
  var UI = CC.UI;
  var el = UI.el, clear = UI.clear, $ = UI.$;

  // 每个谜题解开后，可以「自己写一遍」的对应课程试炼（定义在 puzzles.js 里，方便自检）

  var WorldView = {
    built: false,
    entered: false,
    panelOpen: null,
    sayTimer: null,
    pendingTarget: null,
    ui: {},

    // ---------- 搭建 DOM ----------
    build: function () {
      if (this.built) return;
      var host = $('world-root');
      if (!host) return;
      clear(host);

      var wrap = el('div', 'world-wrap');

      var stage = el('div', 'world-stage');
      var canvas = el('canvas', 'world-canvas');
      canvas.id = 'world-canvas';
      canvas.width = CC.World.VIEW_W * CC.WorldData.TILE;
      canvas.height = CC.World.VIEW_H * CC.WorldData.TILE;
      stage.appendChild(canvas);

      var hud = el('div', 'world-hud');
      var area = el('span', 'hud-chip hud-area', '');
      area.id = 'hud-area';
      hud.appendChild(area);
      var right = el('div', 'hud-right');
      [['fish', '🐟'], ['gem', '💎'], ['mood', '❤️']].forEach(function (pair) {
        var chip = el('span', 'hud-chip');
        chip.appendChild(el('span', null, pair[1]));
        var b = el('b', null, '0');
        b.id = 'hud-' + pair[0];
        chip.appendChild(b);
        right.appendChild(chip);
      });
      hud.appendChild(right);
      stage.appendChild(hud);

      var prompt = el('div', 'world-prompt hidden', '');
      prompt.id = 'world-prompt';
      stage.appendChild(prompt);

      var pad = el('div', 'world-pad');
      [['up', '▲'], ['left', '◀'], ['down', '▼'], ['right', '▶']].forEach(function (p) {
        var b = el('button', 'pad-btn', p[1]);
        b.type = 'button';
        b.setAttribute('data-dir', p[0]);
        pad.appendChild(b);
      });
      var act = el('button', 'pad-btn pad-act', 'A');
      act.type = 'button';
      act.setAttribute('data-dir', 'act');
      pad.appendChild(act);
      stage.appendChild(pad);

      wrap.appendChild(stage);

      var sayBox = el('div', 'world-say hidden');
      sayBox.id = 'world-say';
      var face = el('div', 'say-face');
      var faceCanvas = el('canvas');
      faceCanvas.id = 'say-cat';
      faceCanvas.width = 64;
      faceCanvas.height = 64;
      face.appendChild(faceCanvas);
      sayBox.appendChild(face);
      var body = el('div', 'say-body');
      var text = el('div', 'say-text', '');
      text.id = 'say-text';
      body.appendChild(text);
      var actions = el('div', 'say-actions');
      actions.id = 'say-actions';
      body.appendChild(actions);
      sayBox.appendChild(body);
      wrap.appendChild(sayBox);

      var dim = el('div', 'world-dim hidden');
      dim.id = 'world-dim';
      wrap.appendChild(dim);

      var panel = el('div', 'world-panel hidden');
      panel.id = 'world-panel';
      var head = el('div', 'panel-head');
      var title = el('h3', null, '');
      title.id = 'panel-title';
      head.appendChild(title);
      var close = el('button', 'panel-close', '✕');
      close.type = 'button';
      close.id = 'panel-close';
      head.appendChild(close);
      panel.appendChild(head);
      var pbody = el('div', 'panel-body');
      pbody.id = 'panel-body';
      panel.appendChild(pbody);
      var pfoot = el('div', 'panel-foot hidden');
      pfoot.id = 'panel-foot';
      panel.appendChild(pfoot);
      wrap.appendChild(panel);

      var hint = el('div', 'world-help', '方向键 / WASD 走路　·　空格 或 A 键 互动　·　点一下地面也可以走过去');
      wrap.appendChild(hint);

      host.appendChild(wrap);
      this.ui = { canvas: canvas, prompt: prompt, say: sayBox, sayText: text, sayActions: actions, panel: panel, panelTitle: title, panelBody: pbody, panelFoot: pfoot, area: area, face: faceCanvas, hint: hint };

      UI.pets.worldFace = CC.App.registerPet(new CC.Pet(faceCanvas, { scale: 2 }));
      UI.pets.worldFace.start();

      this.bindEvents();
      this.built = true;
    },

    bindEvents: function () {
      var self = this;
      var u = this.ui;

      CC.World.init(u.canvas, {
        state: CC.App.state,
        onArea: function (area) {
          u.area.textContent = area.name;
          self.savePosition();
        },
        onInteract: function (obj) { self.handleObject(obj); }
      });

      // 键盘
      doc.addEventListener('keydown', function (e) {
        if (!self.entered) return;
        if (e.key === 'Escape') {
          if (self.panelOpen) { self.closePanel(); e.preventDefault(); return; }
          self.hideSay();
          return;
        }
        var tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          self.act();
          return;
        }
        CC.World.setKey(e.key, true);
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) >= 0) e.preventDefault();
      });
      doc.addEventListener('keyup', function (e) {
        CC.World.setKey(e.key, false);
      });

      // 点画布：点物件就过去交互，点地面就走路
      u.canvas.addEventListener('click', function (e) {
        if (!self.entered) return;
        var w = CC.World.toWorld(e.clientX, e.clientY);
        var obj = CC.World.objectAt(w.x, w.y);
        if (obj) {
          self.pendingTarget = obj;
          CC.World.moveTo(obj.px + 12, obj.py + 26);
          self.say(['走过去看看……'], { auto: true, silentFace: true });
          return;
        }
        self.pendingTarget = null;
        CC.World.moveTo(w.x, w.y);
      });

      // 手机方向键
      var pad = u.canvas.parentNode.querySelector('.world-pad');
      if (pad) {
        pad.addEventListener('pointerdown', function (e) {
          var b = e.target.closest ? e.target.closest('[data-dir]') : null;
          if (!b) return;
          e.preventDefault();
          var dir = b.getAttribute('data-dir');
          if (dir === 'act') { self.act(); return; }
          CC.World.setPad(dir, true);
        });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
          pad.addEventListener(ev, function (e) {
            var b = e.target.closest ? e.target.closest('[data-dir]') : null;
            if (!b) return;
            var dir = b.getAttribute('data-dir');
            if (dir !== 'act') CC.World.setPad(dir, false);
          });
        });
      }

      var closeBtn = $('panel-close');
      if (closeBtn) closeBtn.addEventListener('click', function () { self.closePanel(); });
      var dim = $('world-dim');
      if (dim) dim.addEventListener('click', function () { self.closePanel(); });
    },

    // ---------- 进出视图 ----------
    enter: function () {
      this.build();
      this.entered = true;
      var saved = (CC.App.state.world || {});
      var areaId = CC.WorldData.Area.has(saved.area) ? saved.area : 'home';
      CC.World.load(areaId, saved.x !== undefined ? { x: saved.x, y: saved.y } : null);
      CC.World.start();
      this.refresh();
      if (!CC.App.state.flags.firstWorldSeen) {
        CC.App.state.flags.firstWorldSeen = true;
        CC.App.save();
        this.say([
          '喵！你终于来啦，我是捉虫。',
          '用方向键带着我到处走吧——抽屉、机器、花儿都可以点一点看看。'
        ]);
      }
      var self = this;
      this._tick = setInterval(function () {
        if (self.pendingTarget && CC.World.hover === self.pendingTarget) {
          self.pendingTarget = null;
          CC.World.stopMoving();
          self.act();
          return;
        }
        self.updatePrompt();
      }, 160);
    },
    leave: function () {
      this.entered = false;
      CC.World.stop();
      if (this._tick) clearInterval(this._tick);
      this.savePosition();
    },
    savePosition: function () {
      CC.World.savePosition();
      CC.App.save();
    },

    updatePrompt: function () {
      var u = this.ui;
      var o = CC.World.hover;
      if (!o) { u.prompt.classList.add('hidden'); return; }
      var label = o.puzzle ? (CC.Puzzles.get(o.puzzle) ? '看看' + CC.Puzzles.get(o.puzzle).title : '看看') : (o.to ? '进去' : '说话');
      u.prompt.textContent = '空格 / A：' + label;
      u.prompt.classList.remove('hidden');
    },

    act: function () {
      if (this.panelOpen) return;
      if (this.ui.say && !this.ui.say.classList.contains('hidden') && this.ui.sayActions.querySelector('button')) return;
      var o = CC.World.interact();
      if (!o) CC.App.react('blink');
    },

    handleObject: function (o) {
      var self = this;
      if (o.to) {
        CC.World.load(o.to, o.spawn);
        if (o.talk) this.say(o.talk);
        return;
      }
      if (o.puzzle) {
        this.openPanel(o.puzzle, o);
        return;
      }
      if (o.flower && !CC.App.flag('robotDone')) {
        this.say(['这朵花有点蔫……', '要是机器人能来浇水就好了。']);
        return;
      }
      if (o.talk) this.say(o.talk);
      else this.say(['喵？这里好像没什么特别的。']);
    },

    // ---------- 小猫说话 ----------
    say: function (lines, opts) {
      opts = opts || {};
      var self = this;
      var u = this.ui;
      if (!lines || !lines.length) return;
      u.say.classList.remove('hidden');
      if (u.sayActions) clear(u.sayActions);
      var i = 0;
      function nextLine() {
        if (i >= lines.length) {
          if (opts.actions) {
            opts.actions.forEach(function (a) {
              var b = el('button', 'say-btn', a.label);
              b.type = 'button';
              b.addEventListener('click', function () { a.fn(); });
              u.sayActions.appendChild(b);
            });
          }
          return;
        }
        var text = lines[i++];
        var shown = 0;
        if (self.sayTimer) clearInterval(self.sayTimer);
        u.sayText.textContent = '';
        self.sayTimer = setInterval(function () {
          shown++;
          u.sayText.textContent = text.slice(0, shown);
          if (shown >= text.length) {
            clearInterval(self.sayTimer);
            self.sayTimer = null;
            setTimeout(function () { if (self.entered && !self.panelOpen) nextLine(); }, 900);
          }
        }, 34);
      }
      nextLine();
    },
    hideSay: function () {
      if (this.sayTimer) { clearInterval(this.sayTimer); this.sayTimer = null; }
      this.ui.say.classList.add('hidden');
    },

    // ---------- 谜题 / 工具箱面板 ----------
    openPanel: function (id, obj, taskId) {
      var self = this;
      var def = CC.Puzzles.get(id);
      var u = this.ui;
      if (!def) return;
      this.hideSay();
      CC.World.stopMoving();
      u.panel.classList.remove('hidden');
      var dimEl = $('world-dim');
      if (dimEl) dimEl.classList.remove('hidden');
      u.panelTitle.textContent = def.title + (taskId ? ' · 编程挑战' : '');
      clear(u.panelBody);
      clear(u.panelFoot);
      u.panelFoot.classList.add('hidden');
      this.panelOpen = id;

      // ---- 编程挑战模式（复用原来的代码编辑器与判题） ----
      if (taskId) {
        var task = null;
        if (CC.App.findBug) task = CC.App.findBug(taskId);
        if (!task && CC.App.lessons) {
          CC.App.lessons.forEach(function (l) {
            l.tasks.forEach(function (t) { if (t.id === taskId) task = t; });
          });
        }
        if (task) {
          var back = el('button', 'pz-btn ghost small', '← 回到刚才的谜题');
          back.type = 'button';
          back.addEventListener('click', function () { self.openPanel(id, obj); });
          u.panelBody.appendChild(back);
          var isBug = !!(CC.App.findBug && CC.App.findBug(taskId));
          u.panelBody.appendChild(UI.taskRunner(task, { kind: isBug ? 'bug' : 'lesson' }));
          return;
        }
      }

      // ---- 猫的一句话 + 隐喻说明 ----
      var head = el('div', 'pz-head');
      head.appendChild(el('div', 'pz-place', def.place || ''));
      head.appendChild(el('div', 'pz-metaphor', '💡 ' + def.metaphor));
      u.panelBody.appendChild(head);

      var sayLine = function (text) {
        var box = u.panelBody.querySelector('.pz-cat-say');
        if (!box) {
          box = el('div', 'pz-cat-say');
          u.panelBody.insertBefore(box, head.nextSibling);
        }
        box.textContent = '🐱 ' + text;
      };
      if (def.cat) sayLine(def.cat[0]);

      var area = el('div', 'pz-area');
      u.panelBody.appendChild(area);

      var api = {
        say: function (text) { sayLine(text); },
        fail: function (text) {
          sayLine(text);
          CC.App.react('sad');
        },
        solved: function () { self.onSolved(def, obj); },
        refresh: function () { },
        burst: function () { CC.World.burstAtObject(obj, 'water', 6); },
        openTask: function (tid) { self.openPanel(id, obj, tid); },
        openLesson: function (lid) {
          self.closePanel();
          UI.showView('lesson');
          UI.openLesson(lid);
        },
        travel: function (areaId, spawn) {
          self.closePanel();
          CC.World.load(areaId, spawn);
          self.savePosition();
          self.say(['到啦！'], { auto: true });
        }
      };
      var defWithReward = def;
      try {
        def.build(area, api);
      } catch (e) {
        area.appendChild(el('div', 'pz-small', '这个小游戏出了点问题：' + (e && e.message)));
      }
      if (def.cat && def.cat.length > 1) sayLine(def.cat[1]);
    },

    onSolved: function (def, obj) {
      var self = this;
      var u = this.ui;
      var out = CC.App.completePuzzle(def);
      CC.World.burstAtObject(obj, 'heart', 12);
      CC.App.react('love');
      u.panelFoot.classList.remove('hidden');
      clear(u.panelFoot);

      var strip = el('div', 'pz-reward');
      strip.appendChild(el('div', 'pz-reward-title', out.first ? '🎉 解开啦！' : '🎀 这个谜题你以前解过啦'));
      if (out.first) {
        strip.appendChild(el('div', 'pz-reward-body', '🐟 小鱼干 +' + out.fish + '　⭐ 经验 +' + out.xp
          + (out.gem ? '　💎 宝石 +1（现在 ' + out.gem + ' / 3）' : '')));
      }
      u.panelFoot.appendChild(strip);

      if (def.code) {
        var codeBox = el('details', 'pz-code');
        var sum = el('summary', null, '🔍 看看它变成代码是什么样');
        codeBox.appendChild(sum);
        var pre = el('pre', null, def.code);
        codeBox.appendChild(pre);
        u.panelFoot.appendChild(codeBox);
      }
      var taskId = CC.Puzzles.TASK_LINKS[def.id];
      if (taskId) {
        var b = el('button', 'pz-btn primary', '✍️ 我想自己写一遍');
        b.type = 'button';
        b.addEventListener('click', function () { self.openPanel(def.id, obj, taskId); });
        u.panelFoot.appendChild(b);
      } else if (def.id === 'cave') {
        var b2 = el('button', 'pz-btn primary', '🐛 挑一只虫子来抓');
        b2.type = 'button';
        b2.addEventListener('click', function () { self.openPanel(def.id, obj); });
        u.panelFoot.appendChild(b2);
      }
      var close = el('button', 'pz-btn ghost', '继续冒险 →');
      close.type = 'button';
      close.addEventListener('click', function () { self.closePanel(); });
      u.panelFoot.appendChild(close);

      this.refresh();
      UI.rewardToasts(out, 'puzzle');
    },

    closePanel: function () {
      this.panelOpen = null;
      this.ui.panel.classList.add('hidden');
      var dimEl = $('world-dim');
      if (dimEl) dimEl.classList.add('hidden');
      clear(this.ui.panelBody);
      clear(this.ui.panelFoot);
      this.ui.panelFoot.classList.add('hidden');
      this.refresh();
      CC.World.draw();
    },

    refresh: function () {
      var st = CC.App.state;
      var set = function (id, v) { var n = $(id); if (n) n.textContent = String(v); };
      set('hud-fish', st.fish);
      set('hud-gem', st.gems || 0);
      set('hud-mood', Math.round(st.mood));
      if (this.ui.area) this.ui.area.textContent = (CC.World.area && CC.World.area.name) || '';
      this.updatePrompt();
    }
  };

  CC.WorldView = WorldView;
})(typeof globalThis !== 'undefined' ? globalThis : this);
