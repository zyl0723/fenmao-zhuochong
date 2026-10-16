/*!
 * 粉猫捉虫 · 世界谜题（一）：罐子 / 抽屉 / 抽屉迷宫 / 蛋糕机 / 浇水机器人
 * 每个谜题都是「用手玩」的：点一点、拖一拖，玩明白了再看它对应的 C 代码。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var doc = root.document;

  function el(tag, cls, text) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }
  function btn(label, cls, fn) {
    var b = el('button', 'pz-btn ' + (cls || ''), label);
    b.type = 'button';
    if (fn) b.addEventListener('click', fn);
    return b;
  }
  function row(cls) { return el('div', 'pz-row ' + (cls || '')); }
  function say(api, text) { if (api && api.say) api.say(text); }

  var defs = {};

  function register(def) { defs[def.id] = def; return def; }

  // =====================================================================
  // 谜题 1：贴标签的罐子（变量 = 有名字的容器）
  // =====================================================================
  register({
    id: 'jars',
    title: '贴标签的罐子',
    place: '小猫的家 · 储物架',
    cat: ['喵…柜子上的三个罐子标签都掉了。', '标签和东西都在下面，帮我放回去吧？', '（先点一样东西，再点一个罐子）'],
    metaphor: '罐子 = 变量：每个罐子有自己的名字，里面只能装一样东西。',
    reward: { fish: 6, xp: 30, gem: true },
    code: [
      'int apple = 3;              // 一个叫 apple 的罐子，装着 3',
      'char name[20] = "捉虫";      // 一个叫 name 的罐子，装着名字',
      'int height = 30;            // 一个叫 height 的罐子，装着 30'
    ].join('\n'),
    build: function (host, api) {
      var labels = [
        { key: 'apple', text: '苹果数', kind: 'label' },
        { key: 'name', text: '猫的名字', kind: 'label' },
        { key: 'height', text: '身高（厘米）', kind: 'label' }
      ];
      var things = [
        { key: 'apple', text: '🍎 3 个苹果', kind: 'thing' },
        { key: 'name', text: '🐱 「捉虫」名牌', kind: 'thing' },
        { key: 'height', text: '📏 30 厘米', kind: 'thing' }
      ];
      var jars = [{ label: null, thing: null }, { label: null, thing: null }, { label: null, thing: null }];
      var picked = { label: null, thing: null };
      var jarNodes = [];

      var wrap = el('div', 'pz-jars');
      var jarsRow = row('pz-jars-row');
      for (var i = 0; i < 3; i++) {
        (function (idx) {
          var j = el('div', 'pz-jar');
          var glass = el('div', 'pz-jar-glass');
          j.appendChild(glass);
          j.appendChild(el('div', 'pz-jar-label', '？'));
          j.appendChild(el('div', 'pz-jar-content', ''));
          j.addEventListener('click', function () { placeTo(idx); });
          jarNodes.push(j);
          jarsRow.appendChild(j);
        })(i);
      }
      wrap.appendChild(el('div', 'pz-small', '↑ 三个空罐子'));
      wrap.appendChild(jarsRow);
      wrap.appendChild(el('div', 'pz-small', '↓ 地上的标签和东西（点一下拿起来）'));
      var pool = row('pz-pool');
      labels.concat(things).forEach(function (item) {
        var c = el('button', 'pz-item ' + (item.kind === 'label' ? 'pz-item-label' : 'pz-item-thing'), item.text);
        c.type = 'button';
        c.__item = item;
        c.addEventListener('click', function () {
          picked[item.kind] = item;
          api.refresh();
          say(api, item.kind === 'label' ? '拿起了标签「' + item.text + '」，现在点一个罐子给它贴上。' : '拿起了' + item.text + '，现在点一个罐子放进去。');
        });
        pool.appendChild(c);
      });
      wrap.appendChild(pool);
      host.appendChild(wrap);

      function placeTo(idx) {
        if (!picked.label && !picked.thing) { say(api, '先在下面点一样东西拿起来，再点罐子～'); return; }
        var j = jars[idx];
        if (picked.label) {
          if (j.label) { picked.label = j.label; }
          j.label = picked.label;
          picked.label = null;
        } else if (picked.thing) {
          if (j.thing) { picked.thing = j.thing; }
          j.thing = picked.thing;
          picked.thing = null;
        }
        api.refresh();
      }

      var checkBtn = btn('让捉虫看看 ✔', 'primary', function () {
        var bad = -1;
        for (var i = 0; i < 3; i++) {
          if (!jars[i].label || !jars[i].thing) { bad = -2; break; }
          if (jars[i].label.key !== jars[i].thing.key) { bad = i; break; }
        }
        if (bad === -2) {
          api.fail('还有罐子是空的呢——每个罐子都要有名字，也要装着东西。');
          return;
        }
        if (bad >= 0) {
          var j2 = jars[bad];
          api.fail('咦？第 ' + (bad + 1) + ' 个罐子上写着「' + j2.label.text + '」，可里面装的是「' + j2.thing.text + '」……名字和东西要配对才行哦。');
          return;
        }
        api.solved();
      });
      host.appendChild(checkBtn);

      api.refresh = function () {
        for (var i = 0; i < 3; i++) {
          jarNodes[i].querySelector('.pz-jar-label').textContent = jars[i].label ? jars[i].label.text : '？';
          jarNodes[i].querySelector('.pz-jar-content').textContent = jars[i].thing ? jars[i].thing.text : '';
          jarNodes[i].classList.toggle('full', !!(jars[i].label && jars[i].thing));
        }
        var items = pool.querySelectorAll('.pz-item');
        for (var k = 0; k < items.length; k++) {
          var it = items[k].__item;
          var used = false;
          for (var j = 0; j < 3; j++) {
            if (jars[j].label === it || jars[j].thing === it) used = true;
          }
          items[k].classList.toggle('hidden', used);
          items[k].classList.toggle('picked', picked[it.kind] === it);
        }
      };
      api.refresh();
    }
  });

  // =====================================================================
  // 谜题 2：五个抽屉（数组 = 一排连着的抽屉，下标从 0 开始）
  // =====================================================================
  register({
    id: 'drawers',
    title: '五个抽屉',
    place: '工坊 · 抽屉柜',
    cat: ['这个柜子有五个抽屉，我给它们编了号：0、1、2、3、4。', '我把小鱼干藏起来了，会告诉你它在第几个抽屉里，你能找到吗？'],
    metaphor: '一排连着的抽屉 = 数组；抽屉的编号 = 下标，从 0 开始数。',
    reward: { fish: 8, xp: 40, gem: true },
    code: [
      'int snack[5];        // 五个抽屉，编号 0 ~ 4',
      'snack[3] = 1;        // 把小鱼干放进 3 号抽屉',
      'printf("%d", snack[3]);  // 读出 3 号抽屉里的东西'
    ].join('\n'),
    build: function (host, api) {
      var contents = ['🧦 一只袜子', '🔩 一颗螺丝', '🪶 一片羽毛', '🐟 小鱼干', '📎 回形针'];
      var answers = [2, 4, 0];
      var round = 0;
      var tried = 0;

      var wrap = el('div', 'pz-drawers');
      var cab = el('div', 'pz-cabinet');
      var slots = [];
      for (var i = 0; i < 5; i++) {
        (function (idx) {
          var d = el('button', 'pz-drawer');
          d.type = 'button';
          d.appendChild(el('span', 'pz-drawer-no', 'x[' + idx + ']'));
          d.appendChild(el('span', 'pz-drawer-face', ''));
          d.addEventListener('click', function () { open(idx); });
          slots.push(d);
          cab.appendChild(d);
        })(i);
      }
      wrap.appendChild(cab);
      var ask = el('div', 'pz-ask', '');
      wrap.appendChild(ask);
      host.appendChild(wrap);

      function newRound() {
        if (round >= answers.length) return;
        ask.textContent = '捉虫说：小鱼干在 x[' + answers[round] + '] 里！点开那个抽屉吧。';
      }
      function open(idx) {
        if (round >= answers.length) return;
        var want = answers[round];
        slots[idx].classList.add('opened');
        slots[idx].querySelector('.pz-drawer-face').textContent = contents[idx];
        tried++;
        if (idx === want) {
          say(api, '对啦！x[' + idx + '] 就是「从 0 数起的第 ' + (idx + 1) + ' 个抽屉」。');
          round++;
          if (round >= answers.length) {
            api.solved();
            return;
          }
          setTimeout(function () {
            slots.forEach(function (s, k) { if (k !== answers[round - 1]) { s.classList.remove('opened'); s.querySelector('.pz-drawer-face').textContent = ''; } });
            newRound();
          }, 900);
        } else {
          say(api, '咦，x[' + idx + '] 里是「' + contents[idx] + '」，不是小鱼干。小猫提醒：下标从 0 开始数哦。');
          setTimeout(function () {
            slots[idx].classList.remove('opened');
            slots[idx].querySelector('.pz-drawer-face').textContent = '';
          }, 1100);
        }
      }
      newRound();
    }
  });

  // =====================================================================
  // 谜题 3：抽屉里的抽屉（一层套一层，就像文件夹）
  // =====================================================================
  register({
    id: 'desk',
    title: '抽屉里的抽屉',
    place: '工坊 · 旧书桌',
    cat: ['这把旧书桌的抽屉里，还有一层一层的格子。', '我的钥匙就藏在里面，可是我不记得怎么走了……', '纸条上写着：先开 B 抽屉，再开最下面那个格子。'],
    metaphor: '抽屉里还能有抽屉 = 文件夹里还能有文件夹；一层层打开就是「路径」。',
    reward: { fish: 7, xp: 35 },
    code: [
      '// 一层层打开，就像这样写：',
      'desk.B.slots[2]      // 书桌 → B 抽屉 → 第 3 个格子',
      '// 每一层都要写清楚名字或编号，这就是「路径」'
    ].join('\n'),
    build: function (host, api) {
      var tree = {
        name: '书桌',
        slots: [
          { name: 'A 抽屉', slots: [{ name: '格子 1', item: '🧦 一只旧袜子' }, { name: '格子 2', item: '🪙 硬币 1 分' }, { name: '格子 3', item: '🍬 过期的糖' }] },
          { name: 'B 抽屉', slots: [{ name: '格子 1', item: '🧷 别针' }, { name: '格子 2', item: '📜 一张纸条：你终于找到这儿了' }, { name: '格子 3', item: '🔑 钥匙！' }] },
          { name: 'C 抽屉', slots: [{ name: '格子 1', item: '🕸️ 蜘蛛网' }, { name: '格子 2', item: '🐭 小老鼠的家（空的）' }, { name: '格子 3', item: '🎈 气球' }] }
        ]
      };
      var path = [];
      var wrap = el('div', 'pz-desk');
      var crumb = el('div', 'pz-crumb', '书桌');
      wrap.appendChild(crumb);
      var board = el('div', 'pz-desk-board');
      wrap.appendChild(board);
      host.appendChild(wrap);

      function currentLevel() {
        var node = tree;
        for (var i = 0; i < path.length; i++) node = node.slots[path[i]];
        return node;
      }
      function render() {
        clear(board);
        var node = currentLevel();
        crumb.textContent = ['书桌'].concat(path.map(function (p, i) {
          var n = tree;
          for (var j = 0; j <= i; j++) n = n.slots[path[j]];
          return n.name;
        })).join('  /  ');
        (node.slots || []).forEach(function (child, idx) {
          var b = el('button', 'pz-slot');
          b.type = 'button';
          b.appendChild(el('span', 'pz-slot-name', child.name));
          b.appendChild(el('span', 'pz-slot-face', child.item ? child.item : '拉开来看看 →'));
          b.addEventListener('click', function () {
            if (child.slots) {
              path.push(idx);
              say(api, '拉开了「' + child.name + '」，里面还有格子…');
              render();
            } else {
              say(api, child.item.indexOf('钥匙') >= 0 ? '叮！找到了钥匙，还有一小撮猫毛。' : '里面是「' + child.item + '」。不是钥匙，再找找～');
              if (child.item.indexOf('钥匙') >= 0) api.solved();
            }
          });
          board.appendChild(b);
        });
        var back = btn('← 关上一层', 'ghost small', function () {
          if (path.length) { path.pop(); render(); }
        });
        board.appendChild(back);
      }
      render();
    }
  });

  // =====================================================================
  // 谜题 4：蛋糕机（函数 = 放进原料，出来成品）
  // =====================================================================
  register({
    id: 'machine',
    title: '叮叮当当蛋糕机',
    place: '工坊 · 蛋糕机',
    cat: ['这台机器有两个「进货口」，一个「出货口」。', '把两样原料放进去，按下开关，它就会给你做东西！', '订单：蛋糕、奶茶、三明治。'],
    metaphor: '机器 = 函数：进货口是「参数」，出货口是「返回值」，同一台机器换个输入就出不同的东西。',
    reward: { fish: 9, xp: 45 },
    code: [
      'char* make(char* a, char* b) {   // 两个进货口',
      '    if (面粉 && 鸡蛋) return "蛋糕";',
      '    if (牛奶 && 茶包) return "奶茶";',
      '    return "奇怪的东西";',
      '}',
      'printf("%s", make("面粉", "鸡蛋"));   // 出货：蛋糕'
    ].join('\n'),
    build: function (host, api) {
      var recipes = [
        { order: '🍰 蛋糕', need: ['面粉', '鸡蛋'], out: '🍰 香喷喷的蛋糕' },
        { order: '🧋 奶茶', need: ['牛奶', '茶包'], out: '🧋 热乎乎的奶茶' },
        { order: '🥪 三明治', need: ['面包', '火腿'], out: '🥪 切开的三明治' }
      ];
      var ingredients = ['面粉', '鸡蛋', '牛奶', '茶包', '面包', '火腿'];
      var slotA = null, slotB = null, step = 0, spinning = false;

      var wrap = el('div', 'pz-machine');
      var orderBox = el('div', 'pz-order', '');
      wrap.appendChild(orderBox);
      var mRow = row('pz-machine-row');
      var inA = el('button', 'pz-inlet', '进货口 1');
      var inB = el('button', 'pz-inlet', '进货口 2');
      inA.type = 'button'; inB.type = 'button';
      var machinePic = el('div', 'pz-machine-body', '⚙️');
      var outBox = el('div', 'pz-outlet', '出货口');
      mRow.appendChild(inA); mRow.appendChild(machinePic); mRow.appendChild(inB); mRow.appendChild(outBox);
      wrap.appendChild(mRow);
      var shelf = row('pz-shelf');
      ingredients.forEach(function (name) {
        var b = btn(name, 'pz-food', function () {
          if (spinning) return;
          if (!slotA) { slotA = name; }
          else if (!slotB) { slotB = name; }
          else { say(api, '两个进货口都满了，先把里面的东西按一下拿出来。'); }
          paint();
        });
        shelf.appendChild(b);
      });
      wrap.appendChild(shelf);
      host.appendChild(wrap);

      inA.addEventListener('click', function () { if (!spinning) { slotA = null; paint(); } });
      inB.addEventListener('click', function () { if (!spinning) { slotB = null; paint(); } });

      function paint(msg) {
        inA.textContent = slotA || '进货口 1（空）';
        inB.textContent = slotB || '进货口 2（空）';
        inA.classList.toggle('filled', !!slotA);
        inB.classList.toggle('filled', !!slotB);
        if (step >= recipes.length) orderBox.textContent = '三个订单全部完成！机器满意地哼了一声。';
        else orderBox.textContent = '订单 ' + (step + 1) + ' / 3：' + recipes[step].order + '　（两个进货口都要放对原料）';
        if (msg) outBox.textContent = msg;
        var foods = shelf.querySelectorAll('.pz-food');
        for (var i = 0; i < foods.length; i++) {
          foods[i].classList.toggle('picked', foods[i].textContent === slotA || foods[i].textContent === slotB);
        }
      }

      var startBtn = btn('⚙️ 按下开关', 'primary', function () {
        if (spinning) return;
        if (!slotA || !slotB) { say(api, '两个进货口都要放东西，机器才会动哦。'); return; }
        var r = recipes[step];
        spinning = true;
        machinePic.classList.add('spin');
        outBox.textContent = '咔哒…咔哒…';
        setTimeout(function () {
          spinning = false;
          machinePic.classList.remove('spin');
          var ok = (slotA === r.need[0] && slotB === r.need[1]) || (slotA === r.need[1] && slotB === r.need[0]);
          if (ok) {
            outBox.textContent = '叮！' + r.out;
            say(api, '成功啦！同样的两个进货口，换个原料就出别的东西——这就是函数的厉害之处。');
            step++;
            slotA = slotB = null;
            if (step >= recipes.length) { paint('全部订单完成！'); api.solved(); return; }
            paint('叮！' + r.out);
          } else {
            outBox.textContent = '咦…出来一个奇怪的东西？';
            say(api, '「' + slotA + ' + ' + slotB + '」做不出' + r.order + '，出来的是会跳的果冻。再想想原料～');
            paint('咦…出来一个奇怪的东西？');
          }
        }, 900);
      });
      host.appendChild(startBtn);
      paint();
    }
  });

  // =====================================================================
  // 谜题 5：浇水机器人（循环 = 重复做同样的事）
  // =====================================================================
  register({
    id: 'robot',
    title: '浇水机器人的小仓库',
    place: '家门口 · 小花园',
    cat: ['这五朵花都蔫了……我够不到水龙头。', '帮机器人排一排命令吧：它只会照着做，一步都不多想。', '（提示：重复 5 次「先往前走，再浇水」）'],
    metaphor: '让机器人重复做同一件事 = 循环；重复几次 = 循环的次数。',
    reward: { fish: 10, xp: 50 },
    onSolveFlag: 'robotDone',
    code: [
      'for (int i = 1; i <= 5; i++) {   // 重复 5 次',
      '    往前走();                    // 每一轮：往前走一格',
      '    浇水();                      // 每一轮：给脚下的花浇水',
      '}'
    ].join('\n'),
    build: function (host, api) {
      var body = [];
      var times = 3;
      var pos = 0, watered = [false, false, false, false, false], running = false;

      var wrap = el('div', 'pz-robot');
      var stage = el('canvas', 'pz-robot-stage');
      stage.width = 360; stage.height = 96;
      wrap.appendChild(stage);

      var loopRow = row('pz-looprow');
      loopRow.appendChild(el('span', 'pz-loop-label', '重复'));
      var minus = btn('−', 'pz-round small', function () { if (times > 1) { times--; paint(); } });
      var timesEl = el('span', 'pz-times', String(times));
      var plus = btn('+', 'pz-round small', function () { if (times < 8) { times++; paint(); } });
      loopRow.appendChild(minus);
      loopRow.appendChild(timesEl);
      loopRow.appendChild(plus);
      loopRow.appendChild(el('span', 'pz-loop-label', '次：'));
      wrap.appendChild(loopRow);

      var slots = el('div', 'pz-slots');
      wrap.appendChild(slots);

      var palette = row('pz-palette');
      ['往前走', '浇水'].forEach(function (name) {
        palette.appendChild(btn(name, 'pz-cmd', function () {
          if (body.length >= 3) { say(api, '一轮里最多放 3 个命令，这样机器人不会绕晕。'); return; }
          body.push(name === '往前走' ? 'forward' : 'water');
          paint();
        }));
      });
      palette.appendChild(btn('清空', 'ghost small', function () { body = []; paint(); }));
      wrap.appendChild(palette);
      var tip = el('div', 'pz-small', '');
      wrap.appendChild(tip);
      host.appendChild(wrap);

      var runBtn = btn('▶ 让机器人跑一遍', 'primary', function () {
        if (running) return;
        running = true;
        pos = 0; watered = [false, false, false, false, false];
        var steps = [];
        for (var i = 0; i < times; i++) {
          for (var j = 0; j < body.length; j++) steps.push({ i: i, cmd: body[j] });
        }
        var idx = 0;
        var timer = setInterval(function () {
          if (idx >= steps.length) {
            clearInterval(timer);
            running = false;
            var all = watered.every(function (w) { return w; });
            draw(true);
            if (all) {
              say(api, '哗——五朵花全喝到水啦！它们一下子精神起来了。');
              api.solved();
            } else {
              var miss = [];
              watered.forEach(function (w, k) { if (!w) miss.push('第 ' + (k + 1) + ' 朵'); });
              say(api, miss.join('、') + '花还没喝到水。想想：机器人先走还是先浇水？');
            }
            return;
          }
          var st = steps[idx++];
          if (st.cmd === 'forward') pos = Math.min(5, pos + 1);
          else if (st.cmd === 'water') {
            if (pos >= 1 && pos <= 5) { watered[pos - 1] = true; api.burst && api.burst(); }
          }
          draw(false);
        }, 260);
      });
      host.appendChild(runBtn);

      function paint() {
        timesEl.textContent = times;
        clear(slots);
        for (var i = 0; i < 3; i++) {
          (function (i) {
            var s = el('button', 'pz-slot-cmd', body[i] === 'forward' ? '往前走' : (body[i] === 'water' ? '浇水' : '（空）'));
            s.type = 'button';
            s.classList.toggle('empty', !body[i]);
            s.addEventListener('click', function () {
              if (body[i]) { body.splice(i, 1); paint(); }
            });
            slots.appendChild(s);
          })(i);
        }
        tip.textContent = '机器人会照着这样做：重复 ' + times + ' 次上面的命令。';
        draw(false);
      }

      function draw(finished) {
        var ctx = stage.getContext('2d');
        ctx.clearRect(0, 0, stage.width, stage.height);
        for (var x = 0; x < 15; x++) {
          for (var y = 0; y < 4; y++) CC.WorldArt.drawTerrain(ctx, 'grass2', x * 24, y * 24, 0, x, y);
        }
        var self = CC;
        for (var f = 0; f < 5; f++) {
          var fx = 24 * (f + 1) + 6;
          self.WorldArt.drawObject(ctx, f % 2 ? 'flowerBlue' : 'flowerPink', fx, 28, { bloomed: watered[f] });
        }
        var robotX = 6 + pos * 24;
        self.WorldArt.drawObject(ctx, 'robot', robotX, 60, { bob: !finished && running, spray: watered.some(function (w) { return w; }) });
      }
      paint();
    }
  });

  // 每个谜题解开后想「自己写一遍」时，对应的课程试炼
  var TASK_LINKS = {
    jars: 'L3-T1',
    drawers: 'L11-T3',
    desk: 'L12-T2',
    machine: 'L14-T1',
    robot: 'L10-T2',
    gate: 'L7-T3',
    rope: 'L15-T1',
    beads: 'L13-T1',
    lighthouse: 'L16-T1',
    cave: null
  };

  CC.Puzzles = {
    defs: defs,
    TASK_LINKS: TASK_LINKS,
    get: function (id) { return defs[id]; },
    ids: function () { return Object.keys(defs); },
    register: register,
    helpers: { el: el, clear: clear, btn: btn, row: row, say: say }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
