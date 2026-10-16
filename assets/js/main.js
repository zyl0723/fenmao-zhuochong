/*!
 * 粉猫捉虫 · 启动脚本
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var doc = root.document;

  function boot() {
    CC.App.init();
    CC.UI.init();

    // 顶栏的小猫脸（静态像素图）
    var brand = doc.getElementById('brand-cat');
    if (brand && CC.PetArt) {
      var bctx = brand.getContext('2d');
      bctx.clearRect(0, 0, brand.width, brand.height);
      CC.PetArt.drawSprite(bctx, 'face', 3, 0, 0);
    }

    // 学习地图上的大猫
    var mapCat = doc.getElementById('map-cat');
    if (mapCat) {
      CC.UI.pets.hero = CC.App.registerPet(new CC.Pet(mapCat, { scale: 4 }));
      CC.UI.pets.hero.start();
    }

    // 猫窝里的猫
    var roomCat = doc.getElementById('room-cat');
    if (roomCat) {
      CC.UI.pets.room = CC.App.registerPet(new CC.Pet(roomCat, { scale: 7 }));
      CC.UI.pets.room.start();
      roomCat.addEventListener('click', function () {
        CC.App.pet();
        CC.UI.toast('喵～', '捉虫被你摸了一下，心情 +2');
      });
    }

    // 回到上次停下的地方：如果已经学过一点，就提示一下
    var st = CC.App.state;
    var decay = st.__decay || { minutes: 0, hungerDrop: 0 };
    if (decay.hungerDrop > 8) {
      CC.UI.toast('捉虫一直在等你', '它有点饿了（饱食度 -' + Math.round(decay.hungerDrop) + '），去猫窝喂它点东西吧～');
      CC.App.react('sad');
    }
    var bootAch = CC.App.bootAchievements || [];
    for (var i = 0; i < bootAch.length; i++) {
      CC.UI.toast('🏅 解锁成就：' + bootAch[i].title, bootAch[i].desc + '（小鱼干 +' + (bootAch[i].fish || 5) + '）');
    }
    if (st.__newDay) {
      CC.UI.toast('欢迎回来！', '已经连续学习 ' + st.streak.days + ' 天啦，继续保持～');
    }

    // 键盘：Esc 关闭捉虫详情
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var detail = doc.getElementById('bug-detail');
        if (detail && !detail.classList.contains('hidden')) {
          detail.classList.add('hidden');
          CC.UI.clear(detail);
        }
      }
    });

    // 支持直接用链接打开某个视图：index.html#room、#bugs、#lesson-L5、#bug-B3
    function applyHash() {
      var h = String(root.location.hash || '').replace(/^#/, '');
      if (!h) return;
      if (h.indexOf('lesson-') === 0) { CC.UI.openLesson(h.slice(7)); return; }
      if (h.indexOf('bug-') === 0) { CC.UI.showView('bugs'); CC.UI.openBug(h.slice(4)); return; }
      if (['map', 'lesson', 'bugs', 'playground', 'room', 'about'].indexOf(h) >= 0) { CC.UI.showView(h); return; }
    }
    applyHash();
    root.addEventListener('hashchange', applyHash);

    // 页面隐藏时保存
    root.addEventListener('beforeunload', function () { CC.App.save(); });
    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) CC.App.save();
    });
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})(typeof globalThis !== 'undefined' ? globalThis : this);