/*!
 * 粉猫捉虫 · 界面渲染（宠物面板 / 自由练习 / 猫窝 / 关于署名）
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var doc = root.document;
  var UI = CC.UI;
  var el = UI.el, clear = UI.clear, $ = UI.$;

  function pct(v) { return Math.max(0, Math.min(100, Math.round(v))) + '%'; }

  function bar(cls, label, value) {
    var row = el('div', 'stat-row');
    row.appendChild(el('span', 'lbl', label));
    var b = el('div', 'bar ' + cls);
    var i = el('i');
    i.style.width = pct(value);
    b.appendChild(i);
    row.appendChild(b);
    row.appendChild(el('span', 'num', Math.round(value)));
    row.__bar = i;
    return row;
  }

  // ---------- 侧边宠物面板 ----------

  UI.buildPetPanel = function () {
    if (this._panelBuilt) return;
    var host = $('pet-side');
    if (!host) return;
    var self = this;

    var card = el('div', 'side-card pet-panel');
    card.appendChild(el('div', 'side-title', '我的猫猫'));

    var stage = el('div', 'pet-stage');
    var canvas = el('canvas');
    canvas.id = 'pet-side-canvas';
    stage.appendChild(canvas);
    card.appendChild(stage);

    card.appendChild(el('div', 'pet-name', '捉虫'));
    var titleEl = el('div', 'pet-title', 'Lv.1 小奶猫');
    card.appendChild(titleEl);

    var bars = {};
    bars.hunger = bar('bar-hunger', '饱食', 70);
    bars.mood = bar('bar-mood', '心情', 70);
    bars.love = bar('bar-love', '亲密', 0);
    card.appendChild(bars.hunger);
    card.appendChild(bars.mood);
    card.appendChild(bars.love);

    var lvRow = el('div', 'pet-level');
    lvRow.appendChild(el('span', null, '经验'));
    var lvBar = el('div', 'bar');
    var lvFill = el('i');
    lvBar.appendChild(lvFill);
    lvRow.appendChild(lvBar);
    card.appendChild(lvRow);

    var feeds = el('div', 'feed-grid');
    card.appendChild(feeds);

    var play = el('button', 'btn small wide', '🧶 陪它玩一会儿（免费）');
    play.type = 'button';
    play.style.marginTop = '8px';
    play.addEventListener('click', function () {
      CC.App.play();
      self.toast('捉虫开心地打起了呼噜～', '心情 +5，亲密度 +1');
      self.refresh();
    });
    card.appendChild(play);

    card.appendChild(el('div', 'tiny muted', '在大世界里解谜题、抓虫子都能赚小鱼干，然后回来喂它。'));

    host.appendChild(card);
    this._panelBuilt = true;
    this._panel = { title: titleEl, bars: bars, lvFill: lvFill, feeds: feeds, feedBtns: [] };

    // 喂食按钮
    var items = CC.Store.ITEMS;
    for (var i = 0; i < items.length; i++) {
      (function (item) {
        var b = el('button', 'feed-btn');
        b.type = 'button';
        b.appendChild(el('span', 'emoji', item.emoji));
        b.appendChild(el('span', null, item.name));
        b.appendChild(el('span', 'price', '🐟' + item.price));
        b.title = item.desc;
        b.addEventListener('click', function () {
          var res = CC.App.feed(item.id);
          if (!res.ok) { self.toast('还不能喂', res.message, 'urgent'); return; }
          self.toast('捉虫吃掉了' + item.name + '！', '饱食 +' + (item.hunger || 0) + '　心情 +' + (item.mood || 0) + '　亲密 +' + (item.intimacy || 1));
          self.rewardToasts({ first: false, levels: res.levels || 0, achievements: res.achievements || [], fish: 0, xp: 0 });
          self.refresh();
        });
        self._panel.feedBtns.push({ item: item, node: b });
        feeds.appendChild(b);
      })(items[i]);
    }

    // 启动动画
    this.pets.panel = CC.App.registerPet(new CC.Pet(canvas, { scale: 5 }));
    this.pets.panel.start();
  };

  UI.renderPetPanel = function () {
    this.buildPetPanel();
    var st = CC.App.state;
    var p = this._panel;
    if (!p) return;
    var lv = CC.App.level();
    p.title.textContent = 'Lv.' + lv.level + ' ' + lv.title;
    p.bars.hunger.__bar.style.width = pct(st.hunger);
    p.bars.mood.__bar.style.width = pct(st.mood);
    p.bars.love.__bar.style.width = pct(Math.min(100, st.intimacy));
    p.lvFill.style.width = pct(lv.progress * 100);
    for (var i = 0; i < p.feedBtns.length; i++) {
      var fb = p.feedBtns[i];
      fb.node.disabled = st.fish < fb.item.price;
    }
    if (this.pets.panel) {
      this.pets.panel.setCondition(st);
      this.pets.panel.equipped = { bow: !!st.equipped.bow, star: !!st.equipped.star };
    }
  };

  // ---------- 自由练习 ----------

  var EXAMPLES = [
    {
      name: '你好，世界',
      desc: '最小的 C 程序',
      code: '#include <stdio.h>\n\nint main() {\n    printf("你好，世界！\\n");\n    return 0;\n}\n'
    },
    {
      name: '九九乘法表（5 行）',
      desc: '两层 for 循环',
      code: '#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 5; i++) {\n        for (int j = 1; j <= i; j++) {\n            printf("%d*%d=%d ", i, j, i * j);\n        }\n        printf("\\n");\n    }\n    return 0;\n}\n'
    },
    {
      name: '数组求平均分',
      desc: '读入 5 个成绩',
      code: '#include <stdio.h>\n\nint main() {\n    int a[5];\n    int sum = 0;\n\n    for (int i = 0; i < 5; i++) {\n        scanf("%d", &a[i]);\n        sum += a[i];\n    }\n\n    printf("平均分 %.2f\\n", sum / 5.0);\n    return 0;\n}\n'
    },
    {
      name: '猜数字（固定种子）',
      desc: 'rand() 随机数',
      code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    srand(1);\n    int secret = rand() % 100 + 1;\n\n    printf("我想好了一个 1~100 的数字：%d\\n", secret);\n    return 0;\n}\n'
    },
    {
      name: '用指针交换两个数',
      desc: '指针 + 函数',
      code: '#include <stdio.h>\n\nvoid swap(int *x, int *y) {\n    int t = *x;\n    *x = *y;\n    *y = t;\n}\n\nint main() {\n    int a = 3, b = 8;\n    swap(&a, &b);\n    printf("a=%d b=%d\\n", a, b);\n    return 0;\n}\n'
    },
    {
      name: '递归求斐波那契',
      desc: '函数自己调用自己',
      code: '#include <stdio.h>\n\nint fib(int n) {\n    if (n <= 2) return 1;\n    return fib(n - 1) + fib(n - 2);\n}\n\nint main() {\n    for (int i = 1; i <= 10; i++) {\n        printf("%d ", fib(i));\n    }\n    printf("\\n");\n    return 0;\n}\n'
    },
    {
      name: '字符串反转',
      desc: 'char 数组 + 循环',
      code: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[] = "pinkcat";\n    int len = (int)strlen(s);\n\n    for (int i = len - 1; i >= 0; i--) {\n        printf("%c", s[i]);\n    }\n    printf("\\n");\n    return 0;\n}\n'
    },
    {
      name: '判断素数',
      desc: '函数返回 1 / 0',
      code: '#include <stdio.h>\n\nint isPrime(int n) {\n    if (n < 2) return 0;\n    for (int i = 2; i * i <= n; i++) {\n        if (n % i == 0) return 0;\n    }\n    return 1;\n}\n\nint main() {\n    for (int i = 1; i <= 20; i++) {\n        if (isPrime(i)) printf("%d ", i);\n    }\n    printf("\\n");\n    return 0;\n}\n'
    }
  ];

  UI.initPlayground = function () {
    var self = this;
    var host = $('pg-editor');
    if (!host) return;
    var editor = new CC.CodeEditor(host, {
      value: CC.CodeStore.get('playground', EXAMPLES[0].code),
      fileName: 'mycode.c',
      minHeight: 300,
      onRun: function () { self.runPlayground(); },
      onChange: function (code) { CC.CodeStore.set('playground', code); }
    });
    this.pgEditor = editor;

    var btnRow = $('pg-buttons');
    clear(btnRow);
    var run = el('button', 'btn primary', '▶ 运行');
    run.type = 'button';
    run.addEventListener('click', function () { self.runPlayground(); });
    var clearBtn = el('button', 'btn small ghost', '清空');
    clearBtn.type = 'button';
    clearBtn.addEventListener('click', function () {
      self.pgEditor.setValue('');
      CC.CodeStore.set('playground', '');
    });
    btnRow.appendChild(run);
    btnRow.appendChild(clearBtn);

    var exHost = $('pg-examples');
    clear(exHost);
    for (var i = 0; i < EXAMPLES.length; i++) {
      (function (ex) {
        var b = el('button');
        b.type = 'button';
        b.appendChild(el('span', null, ex.name));
        b.appendChild(el('small', null, ex.desc));
        b.addEventListener('click', function () {
          self.pgEditor.setValue(ex.code);
          CC.CodeStore.set('playground', ex.code);
          self.toast('已载入示例：' + ex.name, '改一改、跑一跑，看结果有什么变化。');
        });
        exHost.appendChild(b);
      })(EXAMPLES[i]);
    }
  };

  UI.runPlayground = function () {
    if (!this.pgEditor) return;
    var stdin = $('pg-stdin') ? $('pg-stdin').value : '';
    var run = CC.Grade.runCode(this.pgEditor.getValue(), stdin);
    var out = $('pg-output');
    clear(out);
    out.classList.toggle('ok', !!run.ok && !!run.output);
    out.classList.toggle('bad', !run.ok);
    if (run.output) out.textContent = run.output;
    else if (run.ok) out.appendChild(el('span', 'ph', '（程序没有打印任何内容）'));
    else out.textContent = run.error.message + (run.error.hint ? '\n\n' + run.error.hint : '');
    var warn = $('pg-warnings');
    clear(warn);
    var ws = run.warnings || [];
    if (ws.length) {
      warn.classList.remove('hidden');
      var ul = el('ul', 'warn-list');
      for (var i = 0; i < ws.length; i++) ul.appendChild(el('li', null, ws[i].message + (ws[i].hint ? '　→ ' + ws[i].hint : '')));
      warn.appendChild(ul);
    } else {
      warn.classList.add('hidden');
    }
    CC.App.state.stats.runs++;
    if (run.ok) CC.App.state.stats.successRuns++;
    CC.App.checkAchievements();
    CC.App.save();
    CC.App.react(run.ok ? 'happy' : 'sad');
    this.refresh();
  };

  // ---------- 猫窝 ----------

  UI.renderRoom = function () {
    var self = this;
    var st = CC.App.state;
    var host = $('room-body');
    if (!host) return;
    clear(host);

    // 状态卡
    var statCard = el('div', 'card');
    statCard.appendChild(el('h3', null, '捉虫的状态'));
    statCard.appendChild(bar('bar-hunger', '饱食', st.hunger));
    statCard.appendChild(bar('bar-mood', '心情', st.mood));
    statCard.appendChild(bar('bar-love', '亲密', Math.min(100, st.intimacy)));
    var p = el('p', 'tiny muted');
    var lv = CC.App.level();
    p.textContent = 'Lv.' + lv.level + '「' + lv.title + '」　经验 ' + st.xp
      + (lv.nextXp ? '　距下一级还差 ' + (lv.nextXp - st.xp) : '　已经是满级猫猫啦')
      + '　小鱼干 ' + st.fish;
    statCard.appendChild(p);

    var feedCard = el('div', 'card');
    feedCard.appendChild(el('h3', null, '给它买点好吃的'));
    var grid = el('div', 'feed-grid');
    for (var i = 0; i < CC.Store.ITEMS.length; i++) {
      (function (item) {
        var b = el('button', 'feed-btn');
        b.type = 'button';
        b.appendChild(el('span', 'emoji', item.emoji));
        b.appendChild(el('span', null, item.name));
        b.appendChild(el('span', 'price', '🐟' + item.price));
        b.title = item.desc;
        b.disabled = st.fish < item.price;
        b.addEventListener('click', function () {
          var res = CC.App.feed(item.id);
          if (!res.ok) { self.toast('还不能喂', res.message, 'urgent'); return; }
          self.toast('捉虫吃掉了' + item.name + '！', '饱食 +' + (item.hunger || 0) + '　心情 +' + (item.mood || 0) + '　亲密 +' + (item.intimacy || 1));
          self.rewardToasts({ first: false, levels: res.levels || 0, achievements: res.achievements || [], fish: 0, xp: 0 });
        });
        grid.appendChild(b);
      })(CC.Store.ITEMS[i]);
    }
    feedCard.appendChild(grid);
    feedCard.appendChild(el('p', 'tiny muted', '小猫会随着真实时间慢慢变饿、心情下降。它不会生病，只是会更想你一点。'));

    var shopCard = el('div', 'card');
    shopCard.appendChild(el('h3', null, '装扮小铺'));
    var shop = el('div', 'shop-grid');
    for (var c = 0; c < CC.Store.COSMETICS.length; c++) {
      (function (cos) {
        var owned = !!st.owned[cos.id];
        var card = el('div', 'shop-card' + (owned ? ' owned' : ''));
        card.appendChild(el('h4', null, cos.emoji + ' ' + cos.name));
        card.appendChild(el('div', 'desc', cos.desc));
        var b = el('button', 'btn small' + (owned && st.equipped[cos.id] ? ' primary' : ''), owned ? (st.equipped[cos.id] ? '已穿戴（点击脱下）' : '点击戴上') : ('解锁 🐟' + cos.price));
        b.type = 'button';
        b.disabled = !owned && st.fish < cos.price;
        b.addEventListener('click', function () {
          var res = CC.App.unlockCosmetic(cos.id);
          if (!res.ok) { self.toast('还不能解锁', res.message, 'urgent'); return; }
          if (res.bought) self.toast('解锁了新装扮：' + cos.name, '捉虫开心地转了三个圈～');
          self.renderRoom();
          self.refresh();
        });
        card.appendChild(b);
        shop.appendChild(card);
      })(CC.Store.COSMETICS[c]);
    }
    shopCard.appendChild(shop);

    var achCard = el('div', 'card');
    achCard.appendChild(el('h3', null, '成就'));
    var ag = el('div', 'ach-grid');
    for (var a = 0; a < CC.Store.ACHIEVEMENTS.length; a++) {
      var ach = CC.Store.ACHIEVEMENTS[a];
      var got = !!st.achievements[ach.id];
      var ac = el('div', 'ach-card' + (got ? ' got' : ''));
      ac.appendChild(el('h4', null, (got ? '🏅 ' : '🔒 ') + ach.title));
      ac.appendChild(el('div', 'desc', ach.desc));
      ag.appendChild(ac);
    }
    achCard.appendChild(ag);

    var statCard2 = el('div', 'card');
    statCard2.appendChild(el('h3', null, '学习统计'));
    var kv = [
      ['完成课程任务', CC.App.doneCount() + ' / ' + CC.App.totalTasks()],
      ['捉到的虫子', CC.Store.count(st.bugsFixed) + ' / ' + CC.App.bugs.length],
      ['运行代码次数', st.stats.runs],
      ['成功运行次数', st.stats.successRuns],
      ['喂猫次数', st.stats.feedCount],
      ['连续学习天数', st.streak.days + ' 天']
    ];
    for (var k = 0; k < kv.length; k++) {
      var row = el('div', 'kv');
      row.appendChild(el('span', null, kv[k][0]));
      row.appendChild(el('b', null, String(kv[k][1])));
      statCard2.appendChild(row);
    }
    var reset = el('button', 'btn small ghost', '清空存档（重新开始）');
    reset.type = 'button';
    reset.style.marginTop = '12px';
    reset.addEventListener('click', function () {
      if (root.confirm('确定要清空所有进度和小猫的成长记录吗？此操作无法撤销。')) {
        CC.App.reset();
        CC.App.applyEquipped();
        self.toast('已经重新开始', '捉虫是一只全新的小奶猫啦～');
        self.refresh();
      }
    });
    statCard2.appendChild(reset);

    host.appendChild(statCard);
    host.appendChild(feedCard);
    host.appendChild(shopCard);
    host.appendChild(achCard);
    host.appendChild(statCard2);
  };

  // ---------- 关于 / 署名 ----------
  UI.renderAbout = function () {
    var host = $('about-body');
    if (!host) return;
    clear(host);

    var c1 = el('div', 'card');
    c1.appendChild(el('h3', null, '🐱 这是一个游戏，不是课本'));
    c1.appendChild(el('p', null, '你是粉色像素小猫「捉虫」。在一张可以走动的像素大世界里，你带着它到处探索：打开抽屉、给机器人排命令、把绳子拴到箱子上、让蛋糕机出蛋糕、点亮海边的灯塔……每解开一个谜题，世界的某个地方就会真的发生变化（花开了、门开了、桥修好了），捉虫也能吃到小鱼干。'));
    c1.appendChild(el('p', null, '所有谜题都用一个「生活里能摸到的东西」来解释编程：罐子 = 变量，一排抽屉 = 数组，抽屉里的抽屉 = 文件夹，重复 5 次命令 = 循环，绳子 = 指针，珠子串 + 隐形结尾珠 = 字符串。'));
    c1.appendChild(el('p', null, '玩明白之后，每个谜题都会给你看「它变成代码是什么样」，还可以点「我想自己写一遍」，用真正的 C 代码再做一次同样的挑战——那时候的你，已经是在写代码了。'));
    c1.appendChild(el('p', null, '每次过关，屏幕都会被夸夸弹窗铺满；连错 5 次，小猫会主动来抱你，说 5 句不重复的安慰话。写代码本来就不该只有报错，还应该有掌声。'));
    host.appendChild(c1);

    var c2 = el('div', 'card');
    c2.appendChild(el('h3', null, '怎么玩'));
    var ol = el('ol');
    ol.appendChild(el('li', null, '在「🗺️ 世界冒险」里用方向键 / WASD 走路，点一下地面也能走过去。'));
    ol.appendChild(el('li', null, '靠近东西会出现提示，按 空格（手机上按 A 键）和它互动；也可以直接点那个东西。'));
    ol.appendChild(el('li', null, '小猫的家：储物罐（变量）、小床、饭碗、书架（十六个故事）。'));
    ol.appendChild(el('li', null, '工坊：五个抽屉（数组）、抽屉迷宫（嵌套）、蛋糕机（函数）、绳子和箱子（指针）。'));
    ol.appendChild(el('li', null, '家门口：给机器人排命令浇花（循环）、断桥（集齐 3 颗宝石）、森林大门（条件判断）。'));
    ol.appendChild(el('li', null, '森林：珠子项链（字符串）、虫虫洞（12 只等着你抓的代码虫子）。'));
    ol.appendChild(el('li', null, '海边：回答三个小问题点亮灯塔，就从小猫学堂毕业啦。'));
    ol.appendChild(el('li', null, '进度会自动存在浏览器里，关掉网页下次回来还在原地。'));
    c2.appendChild(ol);
    host.appendChild(c2);

    var c2b = el('div', 'card');
    c2b.appendChild(el('h3', null, '🧭 思维训练：每道题都先画流程图，再写代码'));
    c2b.appendChild(el('p', null, '流程图不是单独的画板，而是每道题的第一步。这里有 8 道思维训练题：成绩等级、1~100 求和、三个数最大值、判断素数、打印直角三角形、倒序输出、判断回文、成绩统计。'));
    c2b.appendChild(el('p', null, '每道题都配着题面、输入输出例子和一块画布。你从「开始」画起，用矩形表示处理、菱形表示判断（标上是 / 否）、平行四边形表示输入输出；画完点「检查我的思路」，它会逐条告诉你哪里断了、哪里缺了判断、哪里该有循环，最后再点「去写代码」把这张图翻译成 C。'));
    c2b.appendChild(el('p', null, '还可以对照参考流程图、生成思路提纲和 C 代码骨架；每道题的流程图都会单独保存，思路通过和代码通过都会记录在左边的进度里。'));
    host.appendChild(c2b);

    var c2c = el('div', 'card');
    c2c.appendChild(el('h3', null, '📚 C 函数手册：遇到不会用的函数就来查'));
    c2c.appendChild(el('p', null, '手册收录了 15 个头文件、108 个函数与常量：stdio.h、stdlib.h、string.h、math.h、ctype.h、time.h、limits.h、stdbool.h、stdint.h、stddef.h、assert.h、float.h、errno.h、conio.h……每个函数都写清楚原型、作用、参数、返回值、常见坑和一段可以运行的示例。'));
    c2c.appendChild(el('p', null, '标着「✅ 本站可直接运行」的示例，点一下就能打开到练习场真的跑起来；标着「⚠️ 需要真编译器」的（文件、内存、结构体等）会告诉你为什么需要真正的 gcc。手册里还有 printf / scanf 的格式符速查表、角度弧度换算表和整数范围表。'));
    host.appendChild(c2c);

    var c3 = el('div', 'card');
    c3.appendChild(el('h3', null, '技术说明（它会诚实地告诉你局限）'));
    c3.appendChild(el('p', null, '本站的代码运行器是一个用 JavaScript 从零写出来的「迷你 C 解释器」，专门为零基础教学服务，它的错误提示全部是中文，还会标出行号和原因。它支持：'));
    var ul = el('ul');
    var supports = ['变量、int / long / double / float / char 等基础类型', '算术、关系、逻辑、位运算，以及 if / switch / while / do-while / for',
      '一维与二维数组、char 字符串（含 strlen / strcpy / strcat / strcmp）', '函数、递归、指针（& 与 *、指针遍历数组、指针作为函数参数）',
      'printf / scanf / rand / srand / sqrt / pow 等常用标准库函数'];
    for (var i = 0; i < supports.length; i++) ul.appendChild(el('li', null, supports[i]));
    c3.appendChild(ul);
    c3.appendChild(el('p', null, '它不支持：结构体（struct）、联合体、枚举、goto、文件读写、动态内存 malloc，以及多文件项目。想写这些内容时，请换用真正的编译器，例如 gcc、Dev-C++ 或 VS Code + MinGW。学习完本站的课程后，你会很自然地过渡过去。'));
    c3.appendChild(el('p', null, '判题是按「行」严格比较的：多打一个空行也会判错，并且会把「题目要的输出」和「你的输出」逐行列出来，标出哪一行多了空行、哪一行开始不一样。只有每行行尾多余的空格会被忽略（因为它看不见）。这样你在本站养成的输出习惯，到了真正的判题网站上也一样能过。'));
    host.appendChild(c3);

    var c4 = el('div', 'card');
    c4.appendChild(el('h3', null, '署名与开源许可'));
    c4.appendChild(el('p', null, '本项目开源，采用 MIT 许可：你可以自由学习、修改、再发布，只要保留原作者署名。'));
    var credits = [
      ['本项目代码与课程内容', '「粉猫捉虫」项目 —— 全部为本仓库原创（MIT 许可：见 LICENSE）'],
      ['迷你 C 解释器', '本仓库自研（assets/js/interpreter.js），零外部依赖'],
      ['像素小猫「捉虫」', '本仓库用代码手绘的像素图（assets/js/pet-art.js），不是素材图片'],
      ['字体', '只使用访问者本机的系统字体（中文用系统黑体族，代码用等宽字体族），没有内嵌任何第三方字体文件'],
      ['像素画参考', '配色与像素造型的审美参考了像素游戏常见的做法；如后续加入任何第三方素材，请同步补进 CREDITS.md']
    ];
    for (var c = 0; c < credits.length; c++) {
      var row = el('div', 'credit');
      var box = el('div');
      box.appendChild(el('div', 'name', credits[c][0]));
      box.appendChild(el('div', 'what', credits[c][1]));
      row.appendChild(box);
      c4.appendChild(row);
    }
    c4.appendChild(el('p', 'tiny muted', '本站在教学过程中参考了公开的 C 语言教程与开源社区的经验（例如 JSCPP 这类用 JavaScript 实现 C 解释器的开源项目、Runoob 菜鸟教程等中文入门资料），但未复制其代码或文字内容。在此向所有无私分享知识的作者致谢。'));
    host.appendChild(c4);

    var c5 = el('div', 'card');
    c5.appendChild(el('h3', null, '想把它放到网上？'));
    var steps = el('ol');
    steps.appendChild(el('li', null, '把整个文件夹上传到一个静态网站托管服务（GitHub Pages、Gitee Pages、Vercel、Netlify 都行）。'));
    steps.appendChild(el('li', null, '本站是纯静态站点，没有后端、没有依赖，直接上传即可访问 index.html。'));
    steps.appendChild(el('li', null, '本地预览：在文件夹里执行 node tools/dev-server.mjs，然后打开 http://localhost:5173 。'));
    steps.appendChild(el('li', null, '仓库里带有 .github/workflows/deploy-pages.yml，推送到 GitHub 后会自动发布到 GitHub Pages。'));
    c5.appendChild(steps);
    host.appendChild(c5);

    var c6 = el('div', 'card');
    c6.appendChild(el('h3', null, '给学习者的一句话'));
    c6.appendChild(el('p', null, '学编程最容易放弃的时刻，就是「报错了、看不懂」。请记住：报错不是失败，而是编译器在帮你指出下一步该看哪一行。把报错读完、从第一处改起、改完立刻运行——这套动作重复一百次，你就已经会写程序了。'));
    host.appendChild(c6);
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
