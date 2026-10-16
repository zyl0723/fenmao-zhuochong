/*!
 * 粉猫捉虫 · 世界谜题（二）：门卫 / 绳子 / 珠子 / 灯塔 / 虫虫洞 + 背包书架
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var doc = root.document;
  var H = CC.Puzzles.helpers;
  var el = H.el, clear = H.clear, btn = H.btn, row = H.row, say = H.say;
  var register = CC.Puzzles.register;

  // =====================================================================
  // 谜题 6：岔路口的门卫（条件判断）
  // =====================================================================
  register({
    id: 'gate',
    title: '森林大门的门卫',
    place: '家门口 · 森林入口',
    cat: ['森林的门卫猫有个怪脾气：', '篮子里的苹果「多于 3 个」它才开门，否则就呼呼大睡。', '给它挑一张正确的规矩卡，再试几次给它看看！'],
    metaphor: '「多于 3 个」就是条件表达式：满足就做一件事，不满足就做另一件。',
    reward: { fish: 9, xp: 45 },
    onSolveFlag: 'gateOpen',
    code: [
      'int apple = 4;',
      'if (apple > 3) {',
      '    printf("开门！\\n");',
      '} else {',
      '    printf("门卫睡着了…\\n");',
      '}'
    ].join('\n'),
    build: function (host, api) {
      var apples = 2;
      var cards = [{ text: '苹果 > 3', ok: true }, { text: '苹果 < 3', ok: false }, { text: '苹果 == 3', ok: false }];
      var picked = null;
      var sawTrue = false, sawFalse = false;

      var wrap = el('div', 'pz-gate');
      var stage = el('canvas', 'pz-gate-stage');
      stage.width = 300; stage.height = 108;
      wrap.appendChild(stage);

      var counter = row('pz-counter');
      counter.appendChild(el('span', 'pz-small', '篮子里的苹果：'));
      counter.appendChild(btn('−', 'pz-round small', function () { if (apples > 0) { apples--; paint(); } }));
      var appleEl = el('span', 'pz-apples', '');
      counter.appendChild(appleEl);
      counter.appendChild(btn('+', 'pz-round small', function () { if (apples < 6) { apples++; paint(); } }));
      wrap.appendChild(counter);

      var cardsRow = row('pz-cards');
      cards.forEach(function (c) {
        var b = btn(c.text, 'pz-card', function () {
          picked = c;
          paint();
          say(api, '把规矩卡「' + c.text + '」插在门卫面前了，点「试一次」看看它开不开门。');
        });
        b.__card = c;
        cardsRow.appendChild(b);
      });
      wrap.appendChild(cardsRow);

      var result = el('div', 'pz-result', '');
      wrap.appendChild(result);
      host.appendChild(wrap);

      var testBtn = btn('🔔 试一次', 'primary', function () {
        if (!picked) { say(api, '先给门卫挑一张规矩卡吧。'); return; }
        var passes = picked.ok ? (apples > 3) : (picked.text === '苹果 < 3' ? apples < 3 : apples === 3);
        if (passes) {
          result.textContent = '门开了！门卫打了个哈欠，森林的小路露出来了。';
          say(api, '门开了——这张规矩卡这时候是「真」的。');
          if (picked.ok) sawTrue = true;
        } else {
          result.textContent = '门卫睡着了……（它说：还不满足我的规矩）';
          say(api, '门没开——这时候规矩卡是「假」的。');
          if (picked.ok) sawFalse = true;
        }
        paint(passes);
        if (picked.ok && sawTrue && sawFalse) api.solved();
        else if (!picked.ok && sawTrue) {
          say(api, '咦？门是开了，可是门卫的规矩是「多于 3 个」才对呀。');
        }
      });
      host.appendChild(testBtn);

      function paint(openState) {
        appleEl.textContent = new Array(apples + 1).join('🍎') || '（空的）';
        var ctx = stage.getContext('2d');
        ctx.clearRect(0, 0, stage.width, stage.height);
        for (var x = 0; x < 13; x++) {
          for (var y = 0; y < 5; y++) CC.WorldArt.drawTerrain(ctx, 'grass2', x * 24, y * 24, 0, x, y);
        }
        CC.WorldArt.drawObject(ctx, 'gate', 120, 6, { open: !!openState });
        // 门卫猫 + 帽子
        CC.PetArt.drawFrame(ctx, 'idle', 2, 20, 44);
        ctx.fillStyle = '#a9537b';
        ctx.fillRect(26, 40, 24, 5);
        ctx.fillRect(32, 30, 12, 10);
      }
      paint(false);
    }
  });

  // =====================================================================
  // 谜题 7：绳子与箱子（指针 = 一根绳子）
  // =====================================================================
  register({
    id: 'rope',
    title: '箱子、绳子和篮子',
    place: '工坊 · 绳桩',
    cat: ['A 箱子里是 5，B 箱子里是 9。', '这根绳子很特别：拴到哪个箱子，就「指着」那个箱子。', '帮我把两个箱子里的东西换过来，好不好？'],
    metaphor: '绳子 = 指针：拴上就是「指着它」(&)，通过绳子拿或放就是 *p。',
    reward: { fish: 10, xp: 55 },
    code: [
      'int a = 5, b = 9;',
      'int *p = &a;   // 绳子拴到 A',
      'int temp = *p; // 用篮子接住绳子上指着的东西',
      'p = &b;        // 绳子改拴到 B',
      'a = *p;        // A ← 绳子上指着的东西（9）',
      '*p = temp;     // 绳子指着的地方 ← 篮子里的 5',
      '// 结果：a = 9，b = 5，换过来了！'
    ].join('\n'),
    build: function (host, api) {
      var a = 5, b = 9, temp = null, tied = null;
      var log = [];

      var wrap = el('div', 'pz-rope');
      var boxes = row('pz-boxes');
      var boxA = el('div', 'pz-box', '');
      var boxB = el('div', 'pz-box', '');
      var basket = el('div', 'pz-basket', '');
      boxes.appendChild(boxA);
      boxes.appendChild(el('div', 'pz-rope-line', '~~~'));
      boxes.appendChild(boxB);
      boxes.appendChild(basket);
      wrap.appendChild(boxes);
      var tip = el('div', 'pz-small', '');
      wrap.appendChild(tip);

      var actions = [
        { label: '把绳子拴到 A', code: 'p = &a;', fn: function () { tied = 'a'; } },
        { label: '把绳子拴到 B', code: 'p = &b;', fn: function () { tied = 'b'; } },
        { label: '篮子 ← 绳子', code: 'temp = *p;', fn: function () { if (!tied) return false; temp = tied === 'a' ? a : b; } },
        { label: 'A ← 绳子', code: 'a = *p;', fn: function () { if (!tied) return false; a = (tied === 'a' ? a : b); } },
        { label: 'B ← 绳子', code: 'b = *p;', fn: function () { if (!tied) return false; b = (tied === 'a' ? a : b); } },
        { label: '绳子 ← 篮子', code: '*p = temp;', fn: function () { if (!tied || temp === null) return false; if (tied === 'a') a = temp; else b = temp; } }
      ];
      var pool = row('pz-actions');
      actions.forEach(function (act) {
        pool.appendChild(btn(act.label, 'pz-action', function () {
          if (act.fn() === false) {
            say(api, act.label.indexOf('篮子') === 0 ? '篮子空着呢，先从绳子上接点东西进来吧。' : '绳子还没拴到箱子上呢——先拴上，它才知道该指着谁。');
            return;
          }
          log.push(act.code);
          paint();
          say(api, '做了一次操作，对应的代码是：' + act.code);
        }));
      });
      wrap.appendChild(pool);
      var logBox = el('div', 'pz-codelog', '');
      wrap.appendChild(logBox);

      host.appendChild(wrap);

      var doneBtn = btn('收工，让捉虫检查 ✔', 'primary', function () {
        if (a === 9 && b === 5) {
          api.solved();
          say(api, '换过来啦！你把「绳子」玩明白了——它在 C 语言里叫指针。');
        } else {
          api.fail('现在 A 里是 ' + a + '，B 里是 ' + b + '。目标是 A = 9、B = 5，再试试～');
        }
      });
      host.appendChild(doneBtn);

      function paint() {
        boxA.textContent = 'A 箱子：' + a;
        boxB.textContent = 'B 箱子：' + b;
        basket.textContent = temp === null ? '🧺 篮子：（空）' : '🧺 篮子：' + temp;
        boxA.classList.toggle('tied', tied === 'a');
        boxB.classList.toggle('tied', tied === 'b');
        tip.textContent = tied ? ('绳子现在拴在 ' + tied.toUpperCase() + ' 上。') : '绳子还放在地上（没人知道它指着谁）。';
        logBox.textContent = log.length ? ('做过的操作 →\n' + log.join('\n')) : '做过的操作会变成一行行代码显示在这里。';
      }
      paint();
    }
  });

  // =====================================================================
  // 谜题 8：珠子项链（字符串 = 一排珠子，末尾要留一颗隐形的 \0）
  // =====================================================================
  register({
    id: 'beads',
    title: '珠子项链',
    place: '森林 · 小木台',
    cat: ['这条线上最多能挂 5 颗珠子，最后还要留一个位置给「隐形珠子」。', '隐形珠子（\\0）会告诉程序：字符串到这里就结束啦。', '给我串一条 粉 → 蓝 → 黄 → 粉 的项链吧！'],
    metaphor: '珠子 = 字符，线 = 字符数组，末尾的隐形珠子 \\0 = 字符串的结束标记。',
    reward: { fish: 9, xp: 45 },
    code: [
      'char line[6] = "pink";   // 4 颗珠子 + 一颗 invisible 的 \\0',
      'printf("%s", line);      // 读出：pink',
      '// 如果塞满 6 颗珠子，\\0 就没地方站了，程序会读过头！'
    ].join('\n'),
    build: function (host, api) {
      var want = ['pink', 'blue', 'yellow', 'pink'];
      var colors = { pink: '🌸 粉珠', blue: '💙 蓝珠', yellow: '⭐ 黄珠' };
      var line = [];
      var overflow = false;

      var wrap = el('div', 'pz-beads');
      var lineBox = el('div', 'pz-line');
      wrap.appendChild(lineBox);
      var shelf = row('pz-beads-shelf');
      ['pink', 'blue', 'yellow'].forEach(function (c) {
        shelf.appendChild(btn(colors[c], 'pz-bead pz-bead-' + c, function () {
          if (line.length >= 6) { overflow = true; paint(); return; }
          line.push(c);
          paint();
        }));
      });
      wrap.appendChild(shelf);
      var note = el('div', 'pz-small', '');
      wrap.appendChild(note);
      host.appendChild(wrap);

      var readBtn = btn('🔎 让机器读一读', 'primary', function () {
        if (overflow || line.length > 5) {
          api.fail('读不出来！线上塞了 ' + line.length + ' 颗珠子，末尾的隐形珠子 \\0 被挤掉了——机器不知道该在哪儿停下来。（数组要多留一个位置给 \\0）');
          return;
        }
        var ok = line.length === want.length && line.every(function (c, i) { return c === want[i]; });
        if (!ok) {
          api.fail('读出来是：' + (line.map(function (c) { return colors[c]; }).join(' ') || '（空的）') + '。捉虫想要的顺序是 粉 → 蓝 → 黄 → 粉。');
          return;
        }
        note.textContent = '机器一颗一颗读过去……读出来是「pink」！';
        api.solved();
      });
      host.appendChild(readBtn);

      function paint() {
        clear(lineBox);
        for (var i = 0; i < 6; i++) {
          var cell = el('button', 'pz-cell');
          cell.type = 'button';
          if (i < line.length) {
            cell.textContent = colors[line[i]];
            cell.classList.add('filled', 'pz-bead-' + line[i]);
            (function (idx) {
              cell.addEventListener('click', function () { line.splice(idx, 1); overflow = false; paint(); });
            })(i);
          } else if (i === line.length) {
            cell.textContent = '\\0';
            cell.classList.add('ghost');
          } else {
            cell.textContent = '—';
          }
          lineBox.appendChild(cell);
        }
        note.textContent = overflow ? '线上塞满了 6 颗珠子……隐形珠子被挤出去了！' :
          '线上有 ' + line.length + ' 颗珠子，后面那颗淡淡的 \\0 就是结尾标记。';
      }
      paint();
    }
  });

  // =====================================================================
  // 谜题 9：点亮灯塔（毕业总复习）
  // =====================================================================
  register({
    id: 'lighthouse',
    title: '点亮灯塔',
    place: '海边 · 灯塔',
    cat: ['灯塔好久没亮了，船都不敢靠岸。', '回答对三个小问题，灯就会亮起来——你已经学会很多东西啦。'],
    metaphor: '把学过的概念连起来：变量、循环、指针。',
    reward: { fish: 20, xp: 80 },
    onSolveFlag: 'lighthouse',
    code: [
      '// 你已经会的东西：',
      'int count = 0;              // 变量：有名字的盒子',
      'for (int i = 1; i <= 5; i++) { count += i; }   // 循环：重复做',
      'void change(int *p) { *p = 99; }               // 指针：让函数改到外面的盒子'
    ].join('\n'),
    build: function (host, api) {
      var quiz = [
        {
          q: '罐子上写着 age，里面装着 9。这个东西叫什么？',
          options: ['变量（有名字的盒子）', '循环（重复做事的机器）', '字符串（一串珠子）'],
          right: 0,
          why: '有名字、能装一样东西的盒子就是变量。'
        },
        {
          q: '要让机器人把 5 朵花都浇到，最省事的做法是？',
          options: ['把「前进+浇水」抄 5 遍', '写成「重复 5 次：前进、浇水」', '让机器人自己猜'],
          right: 1,
          why: '重复做同一件事就是循环，改次数只要改一个数字。'
        },
        {
          q: '想让函数真的改到外面箱子里的东西，该怎么办？',
          options: ['把箱子的地址告诉它（用 & 和 *）', '对着箱子多喊几遍', '把箱子复制一份给它'],
          right: 0,
          why: '参数是复制品，只有把地址（指针）传进去，函数才能改到原箱子。'
        }
      ];
      var step = 0, correct = 0;

      var wrap = el('div', 'pz-quiz');
      var stage = el('canvas', 'pz-light-stage');
      stage.width = 264; stage.height = 120;
      wrap.appendChild(stage);
      var qBox = el('div', 'pz-question', '');
      wrap.appendChild(qBox);
      var optBox = el('div', 'pz-options');
      wrap.appendChild(optBox);
      var feed = el('div', 'pz-small', '');
      wrap.appendChild(feed);
      host.appendChild(wrap);

      function paintStage(lit) {
        var ctx = stage.getContext('2d');
        ctx.clearRect(0, 0, stage.width, stage.height);
        for (var x = 0; x < 11; x++) {
          for (var y = 0; y < 5; y++) CC.WorldArt.drawTerrain(ctx, y >= 3 ? 'water' : 'sand', x * 24, y * 24, 0, x, y);
        }
        CC.WorldArt.drawObject(ctx, 'lamp', 120, 18, { on: !!lit });
        if (lit) {
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = '#ffd479';
          ctx.beginPath();
          ctx.moveTo(120, 36);
          ctx.lineTo(60, 120);
          ctx.lineTo(200, 120);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        CC.PetArt.drawFrame(ctx, lit ? 'happy' : 'idle', 2, 24, 60);
      }

      function render() {
        paintStage(correct >= quiz.length);
        if (step >= quiz.length) return;
        var q = quiz[step];
        qBox.textContent = '第 ' + (step + 1) + ' 问：' + q.q;
        clear(optBox);
        q.options.forEach(function (text, i) {
          optBox.appendChild(btn(text, 'pz-option', function () {
            if (i === q.right) {
              correct++;
              feed.textContent = '答对啦！' + q.why;
              say(api, '喵！' + q.why);
              step++;
              if (correct >= quiz.length) {
                paintStage(true);
                clear(qBox); clear(optBox);
                qBox.textContent = '✨ 灯塔亮了！暖黄的光照在海上，船可以回家了。';
                feed.textContent = '你已经会用变量、循环、数组、函数和指针——恭喜从小猫学堂毕业！';
                if (CC.App) {
                  CC.App.state.badges = CC.App.state.badges || {};
                  CC.App.state.badges.graduated = true;
                }
                setTimeout(function () { api.solved(); }, 700);
                return;
              }
              render();
            } else {
              feed.textContent = '再想想～捉虫提醒：' + q.why;
              say(api, '不对哦，不过没关系，再试一次。');
            }
          }));
        });
      }
      render();
    }
  });

  // =====================================================================
  // 虫虫洞：12 个找 bug 关卡（要写代码的那种）
  // =====================================================================
  register({
    id: 'cave',
    title: '虫虫洞',
    place: '森林 · 洞口',
    cat: ['洞里住着一群爱啃代码的小虫子。', '它们会把代码咬出毛病——分号咬掉、把 == 啃成 =……', '进去把虫子抓出来吧！'],
    metaphor: '会看报错、会改 bug，是写程序最值钱的本事。',
    reward: { fish: 0, xp: 0 },
    build: function (host, api) {
      var list = CC.BUGS || [];
      var wrap = el('div', 'pz-cave');
      var done = 0;
      list.forEach(function (b) {
        if (CC.App.isBugDone(b.id)) done++;
      });
      wrap.appendChild(el('div', 'pz-small', '洞里的虫子：' + done + ' / ' + list.length + ' 只已经被抓走啦。'));
      var grid = el('div', 'pz-cave-grid');
      list.forEach(function (b) {
        var card = el('button', 'pz-bug');
        card.type = 'button';
        card.appendChild(el('span', 'pz-bug-title', (CC.App.isBugDone(b.id) ? '🎀 ' : '🐛 ') + b.title));
        card.appendChild(el('span', 'pz-bug-star', new Array((b.difficulty || 1) + 1).join('★')));
        card.addEventListener('click', function () { api.openTask(b.id); });
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
      host.appendChild(wrap);
    }
  });

  // =====================================================================
  // 书架：十六课故事书
  // =====================================================================
  register({
    id: 'books',
    title: '魔法故事书',
    place: '小猫的家 · 书架',
    cat: ['书架上的书是一课一课的冒险。', '想按顺序学得更扎实，就一本一本读下去吧。'],
    metaphor: '故事书 = 课程：每一课都把一件事讲透。',
    reward: { fish: 0, xp: 0 },
    build: function (host, api) {
      var wrap = el('div', 'pz-books');
      var done = CC.App.doneCount();
      var total = CC.App.totalTasks();
      wrap.appendChild(el('div', 'pz-small', '任务进度：' + done + ' / ' + total + '（在大世界里解谜题也会算进度哦）'));
      var grid = el('div', 'pz-book-grid');
      (CC.App.lessons || []).forEach(function (l) {
        var p = CC.App.lessonProgress(l);
        var card = el('button', 'pz-book');
        card.type = 'button';
        card.appendChild(el('span', 'pz-book-title', l.title));
        card.appendChild(el('span', 'pz-book-sub', l.subtitle));
        card.appendChild(el('span', 'pz-book-prog', '试炼 ' + p.done + ' / ' + p.total + '　约 ' + l.minutes + ' 分钟'));
        card.addEventListener('click', function () { api.openLesson(l.id); });
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
      host.appendChild(wrap);
    }
  });

  // =====================================================================
  // 背包 / 图鉴
  // =====================================================================
  register({
    id: 'bag',
    title: '捉虫的小背包',
    place: '随身',
    cat: ['看看我们都攒了什么吧！'],
    metaphor: '背包里装着你的进度。',
    reward: { fish: 0, xp: 0 },
    build: function (host, api) {
      var st = CC.App.state;
      var wrap = el('div', 'pz-bag');
      var kv = row('pz-bag-stats');
      function chip(label, value) {
        var c = el('div', 'pz-chip');
        c.appendChild(el('span', 'pz-chip-label', label));
        c.appendChild(el('span', 'pz-chip-value', String(value)));
        return c;
      }
      kv.appendChild(chip('🐟 小鱼干', st.fish));
      kv.appendChild(chip('💎 宝石', st.gems || 0));
      kv.appendChild(chip('⭐ 经验', st.xp));
      kv.appendChild(chip('🧩 世界谜题', CC.Store.count(st.puzzlesDone || {}) + ' / ' + CC.Puzzles.ids().length));
      kv.appendChild(chip('🐛 捉到的虫', CC.Store.count(st.bugsFixed || {}) + ' / ' + (CC.App.bugs || []).length));
      kv.appendChild(chip('✅ 课程试炼', CC.App.doneCount() + ' / ' + CC.App.totalTasks()));
      wrap.appendChild(kv);
      wrap.appendChild(el('div', 'pz-small', '成就：'));
      var ach = el('div', 'pz-ach');
      CC.Store.ACHIEVEMENTS.forEach(function (a) {
        var got = !!(st.achievements && st.achievements[a.id]);
        var c = el('div', 'pz-ach-item' + (got ? ' got' : ''));
        c.appendChild(el('span', null, (got ? '🏅 ' : '🔒 ') + a.title));
        c.appendChild(el('span', 'pz-ach-desc', a.desc));
        ach.appendChild(c);
      });
      wrap.appendChild(ach);
      host.appendChild(wrap);
    }
  });

  // =====================================================================
  // 断桥：用宝石修好它
  // =====================================================================
  register({
    id: 'bridge',
    title: '断掉的木桥',
    place: '家门口 · 河边',
    cat: ['桥被大水冲断了，过不去对岸。', '听说集齐 3 颗宝石就能把它修好！'],
    metaphor: '先修好桥，才能去更远的地方。',
    reward: { fish: 0, xp: 0 },
    build: function (host, api) {
      var wrap = el('div', 'pz-bridge');
      var gems = CC.App.state.gems || 0;
      wrap.appendChild(el('div', 'pz-big-label', '💎 宝石：' + gems + ' / 3'));
      var bar = el('div', 'pz-progress');
      var fill = el('div', 'pz-progress-fill');
      fill.style.width = Math.min(100, gems / 3 * 100) + '%';
      bar.appendChild(fill);
      wrap.appendChild(bar);
      wrap.appendChild(el('div', 'pz-small', gems >= 3 ? '够了够了！把宝石交给桥匠猫吧。' : '解开世界里的谜题就能拿到宝石：罐子、抽屉、机器、机器人……'));
      host.appendChild(wrap);
      var fix = btn('🔨 修好木桥', 'primary', function () {
        if ((CC.App.state.gems || 0) < 3) {
          api.fail('宝石还不够呢（现在有 ' + (CC.App.state.gems || 0) + ' 颗）。先去世界的其他地方看看？');
          return;
        }
        CC.App.setFlag('bridgeFixed', true);
        api.solved();
        say(api, '叮叮当当……桥修好啦！对岸的海边可以过去了。');
      });
      host.appendChild(fix);
    }
  });

  // =====================================================================
  // 小船：快速旅行（回家 / 去工坊 / 去森林）
  // =====================================================================
  register({
    id: 'boat',
    title: '岸边的小船',
    place: '海边',
    cat: ['坐在船上吹吹风吧。想去哪里？'],
    metaphor: '旅行一下，就不用走回头路啦。',
    reward: { fish: 0, xp: 0 },
    build: function (host, api) {
      var wrap = el('div', 'pz-boat');
      wrap.appendChild(el('div', 'pz-small', '想去哪里？（走过去也可以，只是想省点脚力）'));
      var r = row('pz-travel');
      [['回家', 'home', 6.5, 8.4], ['去工坊', 'workshop', 8.5, 8.6], ['去森林', 'forest', 2.5, 15.5], ['回大门口', 'town', 13.5, 12.5]].forEach(function (t) {
        r.appendChild(btn(t[0], 'pz-travel-btn', function () {
          api.travel(t[1], { x: t[2], y: t[3] });
        }));
      });
      wrap.appendChild(r);
      host.appendChild(wrap);
    }
  });

  // =====================================================================
  // 饭碗：喂猫（复用养成的数值）
  // =====================================================================
  register({
    id: 'feed',
    title: '捉虫的饭碗',
    place: '小猫的家 · 饭碗',
    cat: ['小鱼干！小鱼干！喵！'],
    metaphor: '喂饱它，它才有力气陪你冒险。',
    reward: { fish: 0, xp: 0 },
    build: function (host, api) {
      var wrap = el('div', 'pz-feed');
      var fishNow = el('div', 'pz-big-label', '🐟 小鱼干：' + CC.App.state.fish);
      wrap.appendChild(fishNow);
      var grid = el('div', 'pz-feed-grid');
      CC.Store.ITEMS.forEach(function (item) {
        var b = btn(item.emoji + ' ' + item.name + '　🐟' + item.price, 'pz-feed-btn', function () {
          var res = CC.App.feed(item.id);
          if (!res.ok) { api.fail(res.message); return; }
          fishNow.textContent = '🐟 小鱼干：' + CC.App.state.fish;
          say(api, '嚼嚼嚼……' + item.name + '好吃！饱食 +' + (item.hunger || 0) + '　心情 +' + (item.mood || 0));
          if (api.burst) api.burst();
          paint();
          if (CC.App.state.fish < 1) api.say('小鱼干花光啦，去解谜题赚一点吧～');
        });
        b.__price = item.price;
        grid.appendChild(b);
      });
      wrap.appendChild(grid);
      host.appendChild(wrap);
      function paint() {
        var btns = grid.querySelectorAll('.pz-feed-btn');
        for (var i = 0; i < btns.length; i++) btns[i].disabled = CC.App.state.fish < btns[i].__price;
        fishNow.textContent = '🐟 小鱼干：' + CC.App.state.fish;
      }
      paint();
    }
  });

  // =====================================================================
  // 小床：睡一觉（回复心情）
  // =====================================================================
  register({
    id: 'sleep',
    title: '打个盹',
    place: '小猫的家 · 小床',
    cat: ['呼……睡一小会儿，心情就变好啦。'],
    metaphor: '休息一下再出发。',
    reward: { fish: 0, xp: 0 },
    build: function (host, api) {
      var wrap = el('div', 'pz-sleep');
      wrap.appendChild(el('div', 'pz-big-label', '😴 心情 ' + Math.round(CC.App.state.mood) + ' / 100'));
      host.appendChild(wrap);
      host.appendChild(btn('睡一小会儿（心情 +8）', 'primary', function () {
        CC.App.state.mood = Math.min(100, CC.App.state.mood + 8);
        CC.App.react('sleep');
        CC.App.save();
        wrap.querySelector('.pz-big-label').textContent = '😴 心情 ' + Math.round(CC.App.state.mood) + ' / 100';
        say(api, '呼噜……呼噜……睡醒啦，精神多了！');
      }));
    }
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
