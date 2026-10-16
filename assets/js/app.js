/*!
 * 粉猫捉虫 · 应用状态（存档、奖励、成就、猫猫反应）
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});

  var App = {
    state: null,
    lessons: [],
    bugs: [],
    listeners: [],
    pets: [],
    lastReward: null,

    init: function () {
      this.lessons = CC.LESSONS || [];
      this.bugs = CC.BUGS || [];
      this.state = CC.Store.load();
      this.state.meta.totalTasks = this.totalTasks();
      this.state.meta.totalBugs = this.bugs.length;
      var h = new Date().getHours();
      if (h >= 0 && h < 5) this.state.flags.nightOwl = true;
      this.bootAchievements = this.checkAchievements();
      this.save();
      return this;
    },

    // ---------- 查询 ----------
    totalTasks: function () {
      var n = 0;
      for (var i = 0; i < this.lessons.length; i++) n += this.lessons[i].tasks.length;
      return n;
    },
    doneCount: function () {
      return CC.Store.count(this.state.completedTasks);
    },
    isTaskDone: function (id) {
      return !!this.state.completedTasks[id];
    },
    isBugDone: function (id) {
      return !!this.state.bugsFixed[id];
    },
    lessonProgress: function (lesson) {
      var done = 0;
      for (var i = 0; i < lesson.tasks.length; i++) {
        if (this.isTaskDone(lesson.tasks[i].id)) done++;
      }
      return { done: done, total: lesson.tasks.length };
    },
    isLessonDone: function (lesson) {
      var p = this.lessonProgress(lesson);
      return p.total > 0 && p.done === p.total;
    },
    findLesson: function (id) {
      for (var i = 0; i < this.lessons.length; i++) if (this.lessons[i].id === id) return this.lessons[i];
      return null;
    },
    findBug: function (id) {
      for (var i = 0; i < this.bugs.length; i++) if (this.bugs[i].id === id) return this.bugs[i];
      return null;
    },
    level: function () {
      return CC.Store.levelInfo(this.state.xp);
    },

    // ---------- 订阅 ----------
    onChange: function (fn) { this.listeners.push(fn); },
    emit: function () {
      for (var i = 0; i < this.listeners.length; i++) {
        try { this.listeners[i](this.state); } catch (e) { }
      }
    },
    save: function () {
      CC.Store.save(this.state);
      this.emit();
    },

    // ---------- 数值 ----------
    addFish: function (n) {
      if (!n) return;
      this.state.fish = Math.max(0, this.state.fish + n);
    },
    addXp: function (n) {
      if (!n) return 0;
      var before = this.level().level;
      this.state.xp += n;
      var after = this.level().level;
      return after - before;
    },
    addIntimacy: function (n) {
      if (!n) return;
      this.state.intimacy = Math.max(0, this.state.intimacy + n);
    },

    react: function (kind) {
      for (var i = 0; i < this.pets.length; i++) {
        if (this.pets[i] && this.pets[i].react) this.pets[i].react(kind);
      }
    },
    registerPet: function (pet) {
      this.pets.push(pet);
      pet.setCondition && pet.setCondition(this.state);
      pet.equipped = { bow: !!this.state.equipped.bow, star: !!this.state.equipped.star };
      return pet;
    },

    // ---------- 完成任务 ----------
    completeTask: function (task) {
      var first = !this.isTaskDone(task.id);
      var reward = task.reward || {};
      var out = { first: first, fish: 0, xp: 0, levels: 0, achievements: [] };
      if (!first) return out;
      this.state.completedTasks[task.id] = true;
      out.fish = reward.fish == null ? 3 : reward.fish;
      out.xp = reward.xp == null ? 20 : reward.xp;
      this.addFish(out.fish);
      out.levels = this.addXp(out.xp);
      this.addIntimacy(1);
      if (out.levels > 0) {
        this.addFish(5);
        this.react('levelup');
      } else {
        this.react('happy');
      }
      out.achievements = this.checkAchievements();
      this.save();
      return out;
    },

    fixBug: function (bug) {
      var first = !this.isBugDone(bug.id);
      var out = { first: first, fish: 0, xp: 0, levels: 0, achievements: [] };
      if (!first) return out;
      this.state.bugsFixed[bug.id] = true;
      out.fish = 4 + (bug.difficulty || 1);
      out.xp = 20 + (bug.difficulty || 1) * 10;
      this.addFish(out.fish);
      out.levels = this.addXp(out.xp);
      this.addIntimacy(2);
      if (out.levels > 0) { this.addFish(5); this.react('levelup'); }
      else this.react('love');
      out.achievements = this.checkAchievements();
      this.save();
      return out;
    },

    // ---------- 猫猫 ----------
    feed: function (itemId) {
      var item = null;
      for (var i = 0; i < CC.Store.ITEMS.length; i++) {
        if (CC.Store.ITEMS[i].id === itemId) item = CC.Store.ITEMS[i];
      }
      if (!item) return { ok: false, message: '没有这个食物' };
      if (this.state.fish < item.price) {
        return { ok: false, message: '小鱼干不够啦，先去完成一个任务吧！' };
      }
      this.addFish(-item.price);
      this.state.hunger = Math.min(100, this.state.hunger + (item.hunger || 0));
      this.state.mood = Math.min(100, this.state.mood + (item.mood || 0));
      this.addIntimacy(item.intimacy || 1);
      var lv = this.addXp(2);
      this.state.stats.feedCount++;
      if (lv > 0) this.addFish(5);
      this.react('eat');
      var ach = this.checkAchievements();
      this.save();
      return { ok: true, item: item, levels: lv, achievements: ach };
    },

    play: function () {
      this.state.mood = Math.min(100, this.state.mood + 5);
      this.addIntimacy(1);
      this.react('love');
      this.save();
      return { ok: true };
    },

    pet: function () {
      this.state.mood = Math.min(100, this.state.mood + 2);
      this.react('happy');
      this.save();
    },

    unlockCosmetic: function (id) {
      var item = null;
      for (var i = 0; i < CC.Store.COSMETICS.length; i++) {
        if (CC.Store.COSMETICS[i].id === id) item = CC.Store.COSMETICS[i];
      }
      if (!item) return { ok: false, message: '没有这个装扮' };
      if (this.state.owned[id]) {
        this.state.equipped[id] = !this.state.equipped[id];
        this.applyEquipped();
        this.save();
        return { ok: true, toggled: true, equipped: this.state.equipped[id] };
      }
      if (this.state.fish < item.price) return { ok: false, message: '小鱼干还不够（需要 ' + item.price + ' 条）' };
      this.addFish(-item.price);
      this.state.owned[id] = true;
      this.state.equipped[id] = true;
      this.applyEquipped();
      this.react('love');
      this.checkAchievements();
      this.save();
      return { ok: true, bought: true };
    },

    applyEquipped: function () {
      for (var i = 0; i < this.pets.length; i++) {
        if (this.pets[i]) {
          this.pets[i].equipped = { bow: !!this.state.equipped.bow, star: !!this.state.equipped.star };
          this.pets[i].draw && this.pets[i].draw();
        }
      }
    },

    // ---------- 成就 ----------
    checkAchievements: function () {
      var got = [];
      for (var i = 0; i < CC.Store.ACHIEVEMENTS.length; i++) {
        var a = CC.Store.ACHIEVEMENTS[i];
        if (this.state.achievements[a.id]) continue;
        var ok = false;
        try { ok = !!a.check(this.state); } catch (e) { ok = false; }
        if (ok) {
          this.state.achievements[a.id] = true;
          this.addFish(a.fish || 5);
          got.push(a);
        }
      }
      return got;
    },

    reset: function () {
      this.state = CC.Store.reset();
      this.state.meta.totalTasks = this.totalTasks();
      this.state.meta.totalBugs = this.bugs.length;
      this.save();
      return this.state;
    }
  };

  // ---------- 每道题的代码草稿 ----------
  var CodeStore = {
    key: function (id) { return 'fenmao-code-' + id; },
    get: function (id, fallback) {
      try {
        var v = root.localStorage && root.localStorage.getItem(this.key(id));
        return v === null || v === undefined ? fallback : v;
      } catch (e) { return fallback; }
    },
    set: function (id, code) {
      try { root.localStorage && root.localStorage.setItem(this.key(id), code); } catch (e) { }
    },
    clear: function (id) {
      try { root.localStorage && root.localStorage.removeItem(this.key(id)); } catch (e) { }
    }
  };

  CC.App = App;
  CC.CodeStore = CodeStore;
})(typeof globalThis !== 'undefined' ? globalThis : this);