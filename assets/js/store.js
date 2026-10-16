/*!
 * 粉猫捉虫 · 存档与养成数值（localStorage）
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});

  var KEY = 'fenmao-zhuochong-save-v1';

  // ---------- 等级 ----------
  var LEVELS = [
    { level: 1, xp: 0, title: '小奶猫' },
    { level: 2, xp: 60, title: '好奇猫' },
    { level: 3, xp: 160, title: '学徒猫' },
    { level: 4, xp: 320, title: '代码猫' },
    { level: 5, xp: 560, title: '指针猫' },
    { level: 6, xp: 900, title: '算法猫' },
    { level: 7, xp: 1400, title: '函数猫' },
    { level: 8, xp: 2100, title: '捉虫达人' },
    { level: 9, xp: 3000, title: 'C 语言猫' },
    { level: 10, xp: 4200, title: '代码大师猫' }
  ];

  function levelInfo(xp) {
    var cur = LEVELS[0];
    var next = null;
    for (var i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].xp) { cur = LEVELS[i]; next = LEVELS[i + 1] || null; }
    }
    return {
      level: cur.level,
      title: cur.title,
      xp: xp,
      currentFloor: cur.xp,
      nextXp: next ? next.xp : null,
      progress: next ? Math.max(0, Math.min(1, (xp - cur.xp) / (next.xp - cur.xp))) : 1
    };
  }

  // ---------- 可以喂的东西（用小鱼干购买） ----------
  var ITEMS = [
    { id: 'dryfish', name: '小鱼干', emoji: '🐟', price: 1, hunger: 12, mood: 3, intimacy: 1, desc: '最简单的零食，一条就能哄好。' },
    { id: 'can', name: '猫罐头', emoji: '🥫', price: 3, hunger: 30, mood: 6, intimacy: 3, desc: '香喷喷的大餐，饱食度加得最多。' },
    { id: 'catnip', name: '猫薄荷', emoji: '🌿', price: 4, hunger: 0, mood: 22, intimacy: 2, desc: '让猫猫兴奋地打滚，心情大涨。' },
    { id: 'yarn', name: '毛线球', emoji: '🧶', price: 4, hunger: 0, mood: 18, intimacy: 2, desc: '陪它玩一会儿，亲密度 +2。' },
    { id: 'cake', name: '小鱼蛋糕', emoji: '🍰', price: 8, hunger: 45, mood: 15, intimacy: 5, desc: '豪华点心，喂一次能撑很久。' }
  ];

  // ---------- 可以用小鱼干解锁的装扮 ----------
  var COSMETICS = [
    { id: 'bow', name: '粉色蝴蝶结', emoji: '🎀', price: 12, desc: '戴在耳朵旁边，一上线就能看到。' },
    { id: 'star', name: '星星项圈', emoji: '⭐', price: 20, desc: '项圈上多挂一颗会亮的小星星。' }
  ];

  // ---------- 成就 ----------
  var ACHIEVEMENTS = [
    { id: 'first_run', title: '第一次运行', desc: '成功运行第一段代码', fish: 3, check: function (s) { return s.stats.successRuns >= 1; } },
    { id: 'first_task', title: '开张大吉', desc: '完成第一个练习任务', fish: 5, check: function (s) { return count(s.completedTasks) >= 1; } },
    { id: 'ten_tasks', title: '笔耕不辍', desc: '完成 10 个练习任务', fish: 10, check: function (s) { return count(s.completedTasks) >= 10; } },
    { id: 'all_lessons', title: '课程全通', desc: '完成全部课程任务', fish: 30, check: function (s) { return count(s.completedTasks) >= (s.meta.totalTasks || 999); } },
    { id: 'first_bug', title: '捉虫新手', desc: '在捉虫模式里修好第一个 bug', fish: 5, check: function (s) { return count(s.bugsFixed) >= 1; } },
    { id: 'five_bugs', title: '捉虫小能手', desc: '修好 5 个 bug', fish: 12, check: function (s) { return count(s.bugsFixed) >= 5; } },
    { id: 'all_bugs', title: '虫虫克星', desc: '修好全部 bug', fish: 25, check: function (s) { return count(s.bugsFixed) >= (s.meta.totalBugs || 999); } },
    { id: 'feed_ten', title: '称职铲屎官', desc: '喂猫 10 次', fish: 8, check: function (s) { return s.stats.feedCount >= 10; } },
    { id: 'level_3', title: '慢慢长大', desc: '猫猫升到 3 级', fish: 6, check: function (s) { return levelInfo(s.xp).level >= 3; } },
    { id: 'level_5', title: '资深猫奴', desc: '猫猫升到 5 级', fish: 12, check: function (s) { return levelInfo(s.xp).level >= 5; } },
    { id: 'streak_3', title: '三天打鱼', desc: '连续 3 天来学习', fish: 10, check: function (s) { return s.streak.days >= 3; } },
    { id: 'streak_7', title: '一周坚持', desc: '连续 7 天来学习', fish: 25, check: function (s) { return s.streak.days >= 7; } },
    { id: 'night_owl', title: '深夜代码猫', desc: '在 0:00 ~ 5:00 之间写代码', fish: 8, check: function (s) { return !!s.flags.nightOwl; } },
    { id: 'run_50', title: '反复试验', desc: '累计运行代码 50 次', fish: 12, check: function (s) { return s.stats.runs >= 50; } },
    { id: 'first_puzzle', title: '会动脑的小猫', desc: '在大世界里解开第一个谜题', fish: 5, check: function (s) { return count(s.puzzlesDone || {}) >= 1; } },
    { id: 'five_puzzles', title: '世界旅行者', desc: '解开 5 个世界谜题', fish: 15, check: function (s) { return count(s.puzzlesDone || {}) >= 5; } },
    { id: 'all_puzzles', title: '把世界都点亮', desc: '解开全部世界谜题', fish: 30, check: function (s) { return count(s.puzzlesDone || {}) >= 9; } },
    { id: 'garden_bloom', title: '花开满园', desc: '让机器人把花园的花全部浇开', fish: 8, check: function (s) { return !!(s.worldFlags && s.worldFlags.robotDone); } },
    { id: 'bridge_fixed', title: '修桥小能手', desc: '集齐 3 颗宝石修好木桥', fish: 10, check: function (s) { return !!(s.worldFlags && s.worldFlags.bridgeFixed); } },
    { id: 'graduated', title: '毕业啦', desc: '点亮灯塔，从小猫学堂毕业', fish: 50, check: function (s) { return !!(s.badges && s.badges.graduated); } }
  ];

  function count(obj) {
    var n = 0;
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k]) n++;
    return n;
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function daysBetween(dayA, dayB) {
    if (!dayA || !dayB) return 999;
    function parse(s) {
      var p = String(s).split('-');
      return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])).getTime();
    }
    return Math.round((parse(dayB) - parse(dayA)) / 86400000);
  }

  function defaultState() {
    return {
      version: 1,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      fish: 3,
      xp: 0,
      hunger: 70,
      mood: 70,
      intimacy: 0,
      owned: {},
      equipped: { bow: false, star: false },
      completedTasks: {},
      bugsFixed: {},
      puzzlesDone: {},          // 大世界里的谜题
      gems: 0,                  // 宝石（修桥用）
      worldFlags: {},           // 桥修好了 / 花园开花了 / 大门开了…
      badges: {},               // 毕业徽章等
      world: { area: 'home', x: 6.5, y: 8.4, dir: 'down' },
      achievements: {},
      streak: { days: 1, lastDay: today() },
      flags: {},
      stats: { runs: 0, successRuns: 0, failRuns: 0, feedCount: 0, totalTyped: 0 },
      meta: { totalTasks: 0, totalBugs: 0 },
      log: []
    };
  }

  function mergeDefaults(target, defaults) {
    for (var k in defaults) {
      if (!Object.prototype.hasOwnProperty.call(defaults, k)) continue;
      if (target[k] === undefined || target[k] === null) target[k] = defaults[k];
      else if (typeof defaults[k] === 'object' && !Array.isArray(defaults[k]) && typeof target[k] === 'object') {
        mergeDefaults(target[k], defaults[k]);
      }
    }
    return target;
  }

  // 按真实时间流逝，让猫猫慢慢变饿 / 心情慢慢下降（不会低于 0，也不会“死掉”）
  function applyDecay(state, now) {
    var last = state.lastSeenAt || now;
    var minutes = Math.max(0, (now - last) / 60000);
    if (minutes < 0.5) return { minutes: 0, hungerDrop: 0, moodDrop: 0 };
    var hungerDrop = Math.min(state.hunger, minutes * 0.16);
    var moodFactor = state.hunger < 30 ? 0.14 : 0.08;
    var moodDrop = Math.min(state.mood, minutes * moodFactor);
    state.hunger = Math.max(0, state.hunger - hungerDrop);
    state.mood = Math.max(0, state.mood - moodDrop);
    state.lastSeenAt = now;
    return { minutes: minutes, hungerDrop: hungerDrop, moodDrop: moodDrop };
  }

  function ensureStreak(state) {
    var t = today();
    if (state.streak.lastDay === t) return false;
    var gap = daysBetween(state.streak.lastDay, t);
    state.streak.days = gap === 1 ? (state.streak.days || 0) + 1 : 1;
    state.streak.lastDay = t;
    return true;
  }

  var Store = {
    KEY: KEY,
    LEVELS: LEVELS,
    ITEMS: ITEMS,
    COSMETICS: COSMETICS,
    ACHIEVEMENTS: ACHIEVEMENTS,
    levelInfo: levelInfo,
    today: today,

    load: function () {
      var state = defaultState();
      try {
        var raw = root.localStorage && root.localStorage.getItem(KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            state = mergeDefaults(parsed, defaultState());
          }
        }
      } catch (e) {
        // localStorage 不可用（例如隐私模式）时，退回到内存存档
        state = defaultState();
      }
      var now = Date.now();
      var decay = applyDecay(state, now);
      var newDay = ensureStreak(state);
      state.__decay = decay;
      state.__newDay = newDay;
      return state;
    },

    save: function (state) {
      try {
        var copy = JSON.parse(JSON.stringify(state, function (k, v) { return k.charAt(0) === '_' && k.charAt(1) === '_' ? undefined : v; }));
        copy.lastSeenAt = Date.now();
        root.localStorage && root.localStorage.setItem(KEY, JSON.stringify(copy));
      } catch (e) { /* 忽略：没有 localStorage 也能玩 */ }
    },

    reset: function () {
      try { root.localStorage && root.localStorage.removeItem(KEY); } catch (e) { }
      return defaultState();
    },

    count: count,
    daysBetween: daysBetween
  };

  CC.Store = Store;
})(typeof globalThis !== 'undefined' ? globalThis : this);