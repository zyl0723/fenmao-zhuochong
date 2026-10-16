/*!
 * 粉猫捉虫 · 情绪价值系统
 * 通关：撒花 + 夸夸弹窗铺满屏幕（带退出按钮）
 * 连错 5 次：小猫安慰弹窗（每次 5 句不重复的安慰）
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var doc = root.document;
  var BT = String.fromCharCode(96);

  // ---------- 夸夸池（每次通关随机抽，尽量不重复） ----------
  var PRAISE = [
    '喵呜！写对啦！(๑>ᴗ<๑)',
    '这也太顺了吧～',
    '厉害！爪爪都鼓掌了 👏',
    '一次就过，天赋型选手！',
    '代码在你手里好像会发光 ✨',
    '喵喵喵！我开心得打滚了 (๑˃̵ᴗ˂̵)',
    '这个思路很干净，我喜欢！',
    '你比昨天的自己更强了 💪',
    '完美通关，小鱼干拿来！🐟',
    '脑袋里住着一位工程师吧？(｡•ᴗ•｡)',
    '看得我尾巴都竖起来了 ↑',
    '稳稳的，一点都不慌～',
    '这就是传说中的手感吗！',
    '写得好，我请你吃三条小鱼干（先欠着）🐟🐟🐟',
    '喵！我要把这个记在小本本上 📖',
    '你的报错越来越少啦，进步看得见！',
    '干净利落，像刚梳过毛的小猫 (´｡• ᵕ •｡' + BT + ')',
    '这题被你拿捏了 👊',
    '哇哦——运行成功的声音最好听了！',
    '你好像在悄悄变厉害？(・o・)',
    '满分！连虫子都不敢来了 🐛💨',
    '谢谢你把这段代码写得这么漂亮～',
    '我决定今天最喜欢你 (๑¯∀¯๑)',
    '噗通噗通，我的心跳都变快了！',
    '这条代码，可以贴在冰箱上 🧊',
    '喵嗷！抓到了！٩(๑>◡<๑)۶',
    '你的手指是不是偷偷练过？',
    '这就是「会写代码的人」的样子吧',
    '好耶！世界又亮了一点 🌟',
    '我拿爪爪给你按个赞 👍',
    '舒服！像晒到太阳一样 ☀️',
    '你的代码有股小鱼干味（好闻）🐟',
    '冷静、准确，像老手一样呢',
    '我要给这段代码颁发「最佳代码奖」🏆',
    '喵～刚才那一下好帅！',
    '你把难题当成毛线球玩了 🧶',
    '这段逻辑清晰得像刚洗过的玻璃窗',
    '我又可以多吃一条小鱼干啦，谢谢！',
    '你是不是偷偷变聪明了？(๑•̀ㅂ•́)و✧',
    '成功了！我们击个掌 🐾',
    '喵呜，我有点想蹭你了～',
    '这就是坚持的味道吧，好香！',
    '你写代码的时候眼睛会发光哦 ✨',
    '太棒了，再来一题我还想夸你！'
  ];

  // ---------- 安慰池（连错 5 次时，每次抽 5 句，互相不重复） ----------
  var COMFORT = [
    '喵…没关系的，错五次也还是我最喜欢的铲屎官 (´｡• ᵕ •｡' + BT + ')',
    '报错不是失败，是电脑在告诉你「这儿有线索」🔍',
    '我小时候追尾巴也追了 87 次才成功，别急喵～',
    '要不先站起来伸个懒腰、喝口水？(๑￫ܫ￩)',
    '你看，你已经知道自己错在哪了，这就很厉害 ✨',
    '慢慢来，我陪着你，一条小鱼干都不着急吃 🐟',
    '写代码的大人也会改十几次，真的 (｡•́︿•̀｡)',
    '我们把大问题拆小一点？一次只解决一行喵～',
    '错得越多，记得越牢，这是秘密哦 🤫',
    '我把爪子放你手上，我们一起看报错 →',
    '要不点一下「猫猫提示」？我不会笑你的 (๑>ᴗ<๑)',
    '你现在离答案只差一两个小符号的距离',
    '喵！深呼吸——吸——呼——好一点了吗？',
    '我打了个滚卖个萌，希望你能笑一下 (´｡• ω •｡' + BT + ')',
    '不着急，我们有一下午的阳光 ☀️',
    '再试一次就好，我就喜欢你这股不服输 🐾',
    '要不要把题目读出声来？有时候读一遍就通了～',
    '喵呜…我把脑袋靠过来给你靠一下 (๑¯ω¯๑)',
    '你已经比刚才多会了一点点，这就是进步 📈',
    '如果累了就休息，小猫负责看着这段代码 👀',
    '相信我，第 6 次往往就是成功的那次喵！',
    '这段代码现在有点调皮，我们一起抓住它 🐛',
    '你愿意一直尝试，这本身就超棒的 (✿◕‿◕)',
    '我会一直在这儿，尾巴摇给你看 🐈'
  ];

  var usedPraise = [];
  var usedComfort = [];

  function pickUnique(pool, usedRef, count) {
    var avail = pool.filter(function (x) { return usedRef.indexOf(x) < 0; });
    if (avail.length < count) {
      usedRef.length = 0;
      avail = pool.slice();
    }
    var out = [];
    for (var i = 0; i < count; i++) {
      var idx = Math.floor(Math.random() * avail.length);
      out.push(avail[idx]);
      avail.splice(idx, 1);
    }
    for (var j = 0; j < out.length; j++) usedRef.push(out[j]);
    return out;
  }

  // ---------- 音效（WebAudio 现场合成，不需要音频文件） ----------
  var AC = null;
  function audio() {
    if (AC === null) {
      try {
        var Ctx = root.AudioContext || root.webkitAudioContext;
        AC = Ctx ? new Ctx() : false;
      } catch (e) { AC = false; }
    }
    return AC || null;
  }
  function tone(freq, dur, when, type, vol) {
    var ac = audio();
    if (!ac) return;
    try {
      var t0 = ac.currentTime + (when || 0);
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol || 0.05, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) { }
  }

  var FX = {
    layer: null,
    PRAISE: PRAISE,
    COMFORT: COMFORT,
    failCounts: {},
    celebrating: false,
    comfortOpen: false,

    muted: function () {
      return !!(CC.App && CC.App.state && CC.App.state.muted);
    },
    sound: function (name) {
      if (this.muted()) return;
      if (name === 'pop') tone(760 + Math.random() * 420, 0.08, 0, 'sine', 0.03);
      else if (name === 'win') { tone(660, 0.12, 0); tone(880, 0.14, 0.09); tone(1180, 0.22, 0.19); }
      else if (name === 'levelup') { tone(700, 0.1, 0); tone(1050, 0.12, 0.08); tone(1400, 0.24, 0.17); }
      else if (name === 'sad') { tone(420, 0.18, 0, 'triangle', 0.04); tone(300, 0.28, 0.16, 'triangle', 0.04); }
      else if (name === 'click') tone(520, 0.05, 0, 'square', 0.02);
      else if (name === 'hug') tone(500, 0.18, 0, 'sine', 0.035);
    },

    ensureLayer: function () {
      if (this.layer && this.layer.parentNode) return this.layer;
      var old = doc.getElementById('fx-layer');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var layer = doc.createElement('div');
      layer.id = 'fx-layer';
      layer.className = 'fx-layer';
      doc.body.appendChild(layer);
      this.layer = layer;
      return layer;
    },

    confetti: function (count) {
      var layer = this.ensureLayer();
      var colors = ['#e58fb0', '#f7a8c6', '#ffd479', '#a3c8e8', '#b8e0a8', '#c9a7d6', '#fff2a8'];
      var n = count || 70;
      for (var i = 0; i < n; i++) {
        var c = doc.createElement('i');
        c.className = 'fx-confetti';
        c.style.left = (Math.random() * 100) + '%';
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.animationDelay = (Math.random() * 1.2) + 's';
        c.style.animationDuration = (1.9 + Math.random() * 1.8) + 's';
        c.style.width = (4 + Math.random() * 5) + 'px';
        c.style.height = (7 + Math.random() * 7) + 'px';
        c.style.setProperty('--spin', (Math.random() * 720 - 360) + 'deg');
        c.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
        layer.appendChild(c);
        (function (node) {
          setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 4200);
        })(c);
      }
    },

    celebrate: function (opts) {
      opts = opts || {};
      var self = this;
      if (this.celebrating) return;
      this.celebrating = true;
      var layer = this.ensureLayer();
      layer.classList.add('on');

      var colors = ['#fff5fa', '#fff8e6', '#f2fbf5', '#f3f8ff', '#fdf0f8', '#fffdf0'];
      var lines = pickUnique(PRAISE, usedPraise, opts.count || 44);
      var words = ['🐟', '⭐', '🎀', '🐾', '✨', '💎', '🍬', '🧶'];

      var exit = doc.createElement('button');
      exit.className = 'fx-exit';
      exit.type = 'button';
      exit.textContent = (opts.exitLabel || '收下夸夸，继续冒险') + ' ✨';

      var banner = doc.createElement('div');
      banner.className = 'fx-banner';
      banner.appendChild(doc.createTextNode(opts.title || '🎉 过啦！'));
      if (opts.subtitle) {
        var sub = doc.createElement('span');
        sub.className = 'fx-banner-sub';
        sub.textContent = opts.subtitle;
        banner.appendChild(sub);
      }
      layer.appendChild(banner);

      this.confetti(74);
      this.sound(opts.levelUp ? 'levelup' : 'win');

      // 先撒一批纯表情的贴纸，让屏幕更快被铺满
      var stickers = ['🐟', '✨', '🎀', '🐾', '💎', '🍬', '🧶', '⭐', '🌸', '🍰'];
      for (var si = 0; si < 12; si++) {
        (function (i) {
          setTimeout(function () {
            if (!self.celebrating) return;
            var el2 = doc.createElement('div');
            el2.className = 'fx-bubble fx-sticker';
            el2.style.left = (2 + Math.random() * 86) + '%';
            el2.style.top = (6 + Math.random() * 84) + '%';
            el2.style.background = colors[Math.floor(Math.random() * colors.length)];
            el2.style.setProperty('--rot', (Math.random() * 24 - 12).toFixed(1) + 'deg');
            el2.textContent = stickers[Math.floor(Math.random() * stickers.length)];
            layer.appendChild(el2);
          }, 60 * i);
        })(si);
      }

      var spawned = 0;
      var timer = setInterval(function () {
        if (spawned >= lines.length) { clearInterval(timer); return; }
        var text = lines[spawned++];
        var b = doc.createElement('div');
        b.className = 'fx-bubble';
        var left = 2 + Math.random() * 82;
        var top = 4 + Math.random() * 86;
        if (left > 28 && left < 62 && top > 30 && top < 62) top = top > 46 ? 66 + Math.random() * 22 : 4 + Math.random() * 18;
        b.style.left = left + '%';
        b.style.top = top + '%';
        b.style.background = colors[Math.floor(Math.random() * colors.length)];
        b.style.setProperty('--rot', (Math.random() * 10 - 5).toFixed(1) + 'deg');
        b.textContent = text + ' ' + words[Math.floor(Math.random() * words.length)];
        layer.appendChild(b);
        self.sound('pop');
      }, 70);

      layer.appendChild(exit);

      var bumps = [
        function (el) { el.style.transform = 'translateY(-70px) scale(.6)'; },
        function (el) { el.style.transform = 'translateX(-90px) scale(.6)'; },
        function (el) { el.style.transform = 'translateX(90px) scale(.6)'; },
        function (el) { el.style.transform = 'translateY(70px) scale(.6)'; }
      ];
      var closed = false;
      var finish = function () {
        if (closed) return;
        closed = true;
        clearInterval(timer);
        self.celebrating = false;
        var bubbles = layer.querySelectorAll('.fx-bubble');
        for (var i = 0; i < bubbles.length; i++) {
          bubbles[i].style.transition = 'transform .5s ease, opacity .5s ease';
          bumps[i % bumps.length](bubbles[i]);
          bubbles[i].style.opacity = '0';
        }
        var ban = layer.querySelector('.fx-banner');
        if (ban) { ban.style.transition = 'opacity .4s ease'; ban.style.opacity = '0'; }
        if (exit.parentNode) exit.parentNode.removeChild(exit);
        setTimeout(function () {
          if (layer.parentNode) layer.parentNode.removeChild(layer);
          self.layer = null;
        }, 600);
      };
      exit.addEventListener('click', finish);
      setTimeout(function () { if (self.celebrating) finish(); }, opts.autoHideMs || 12000);
    },

    failTask: function (taskId, opts) {
      if (!taskId) return 0;
      this.failCounts[taskId] = (this.failCounts[taskId] || 0) + 1;
      var n = this.failCounts[taskId];
      if (n >= 5) {
        this.failCounts[taskId] = 0;
        this.comfort(opts);
      }
      return n;
    },
    passTask: function (taskId) {
      if (taskId) this.failCounts[taskId] = 0;
    },

    comfort: function (opts) {
      opts = opts || {};
      var self = this;
      if (this.comfortOpen) return;
      this.comfortOpen = true;
      var lines = pickUnique(COMFORT, usedComfort, opts.count || 5);

      var back = doc.createElement('div');
      back.className = 'fx-comfort-back';
      var card = doc.createElement('div');
      card.className = 'fx-comfort-card';

      var face = doc.createElement('canvas');
      face.width = 96;
      face.height = 96;
      face.className = 'fx-comfort-face';
      var ctx = face.getContext('2d');
      var art = CC.PetArt;
      if (art) art.drawFrame(ctx, 'sad', 3, 0, 0);
      card.appendChild(face);

      var h = doc.createElement('h3');
      h.className = 'fx-comfort-title';
      h.textContent = '喵…先抱一下 (´｡• ᵕ •｡' + BT + ')';
      card.appendChild(h);

      var p = doc.createElement('p');
      p.className = 'fx-comfort-sub';
      p.textContent = '已经试了 5 次啦，说明你在认真想。让我说几句给你听：';
      card.appendChild(p);

      var ul = doc.createElement('div');
      ul.className = 'fx-comfort-lines';
      card.appendChild(ul);

      lines.forEach(function (text, i) {
        setTimeout(function () {
          var item = doc.createElement('div');
          item.className = 'fx-comfort-line';
          item.textContent = text;
          ul.appendChild(item);
          if (art) {
            ctx.clearRect(0, 0, 96, 96);
            art.drawFrame(ctx, i >= lines.length - 1 ? 'love' : (i % 2 ? 'sad' : 'chew'), 3, 0, 0);
          }
          self.sound('hug');
        }, 380 * i);
      });

      var actions = doc.createElement('div');
      actions.className = 'fx-comfort-actions';
      var again = doc.createElement('button');
      again.className = 'pz-btn primary';
      again.type = 'button';
      again.textContent = '我再试一次 🐾';
      again.addEventListener('click', close);
      actions.appendChild(again);
      if (opts.onHint) {
        var hint = doc.createElement('button');
        hint.className = 'pz-btn';
        hint.type = 'button';
        hint.textContent = '💡 给我一点猫猫提示';
        hint.addEventListener('click', function () { close(); opts.onHint(); });
        actions.appendChild(hint);
      }
      var rest = doc.createElement('button');
      rest.className = 'pz-btn ghost';
      rest.type = 'button';
      rest.textContent = '先去别处逛逛 🐟';
      rest.addEventListener('click', close);
      actions.appendChild(rest);
      card.appendChild(actions);

      back.appendChild(card);
      doc.body.appendChild(back);
      this.sound('sad');
      if (art) {
        setTimeout(function () {
          ctx.clearRect(0, 0, 96, 96);
          art.drawFrame(ctx, 'love', 3, 0, 0);
        }, 380 * lines.length);
      }

      function close() {
        self.comfortOpen = false;
        if (back.parentNode) back.parentNode.removeChild(back);
      }
      back.addEventListener('click', function (e) { if (e.target === back) close(); });
      return back;
    },

    _pickUnique: pickUnique
  };

  CC.FX = FX;
})(typeof globalThis !== 'undefined' ? globalThis : this);
