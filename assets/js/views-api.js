/*!
 * 粉猫捉虫 · API 设置页 + AI 助手弹窗
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var doc = root.document;
  var UI = CC.UI;
  var AI = CC.AI;

  var ApiView = {
    built: false,
    cfg: null,
    ui: {},
    lastTest: '',

    build: function () {
      if (this.built) return;
      var host = doc.getElementById('api-root');
      if (!host) return;
      UI.clear(host);
      this.cfg = AI.load();
      var self = this;
      var layout = UI.el('div', 'api-layout');

      var main = UI.el('div', 'api-main');
      var card = UI.el('div', 'card');
      card.appendChild(UI.el('h3', null, '🔌 连接你自己的 AI 模型'));
      card.appendChild(UI.el('p', null, '填好 API 之后，网站会多出「AI 助教」：做题卡住时，它可以看着你的代码和报错，给你一段提示；也可以点评你的流程图思路、把函数手册里的条目讲得更细。'));
      var presets = UI.el('div', 'api-presets');
      AI.PRESETS.forEach(function (p) {
        var b = UI.el('button', 'api-preset' + (self.cfg.preset === p.id ? ' on' : ''), p.name);
        b.type = 'button';
        b.addEventListener('click', function () {
          self.cfg.preset = p.id;
          if (p.baseUrl) self.cfg.baseUrl = p.baseUrl;
          if (p.model) self.cfg.model = p.model;
          self.renderForm();
        });
        presets.appendChild(b);
      });
      card.appendChild(presets);

      var form = UI.el('div', 'api-form');
      function field(label, input, hint) {
        var row = UI.el('label', 'api-field');
        row.appendChild(UI.el('span', 'api-label', label));
        row.appendChild(input);
        if (hint) row.appendChild(UI.el('small', 'api-hint', hint));
        form.appendChild(row);
        return row;
      }
      self.baseInput = UI.el('input', 'api-input');
      self.baseInput.type = 'url';
      self.baseInput.placeholder = 'https://api.openai.com/v1';
      field('接口地址（Base URL）', self.baseInput, '要填到 /v1 这一层，程序会自己拼 /chat/completions。');
      var keyWrap = UI.el('div', 'api-key-wrap');
      self.keyInput = UI.el('input', 'api-input');
      self.keyInput.type = 'password';
      self.keyInput.placeholder = 'sk-…（只保存在你自己的浏览器里）';
      self.keyInput.autocomplete = 'off';
      keyWrap.appendChild(self.keyInput);
      self.showKeyBtn = UI.el('button', 'btn small', '👁 显示');
      self.showKeyBtn.type = 'button';
      self.showKeyBtn.addEventListener('click', function () {
        var shown = self.keyInput.type === 'text';
        self.keyInput.type = shown ? 'password' : 'text';
        self.showKeyBtn.textContent = shown ? '👁 显示' : '🙈 隐藏';
      });
      keyWrap.appendChild(self.showKeyBtn);
      field('API Key', keyWrap, '本站没有后端，Key 不会发给我们；它只随请求发给你填的这个地址。');
      self.modelInput = UI.el('input', 'api-input');
      self.modelInput.placeholder = 'gpt-4o-mini / deepseek-chat / glm-4-flash …';
      field('模型名', self.modelInput, '必须是这个服务商真实存在的模型名。');
      var tempWrap = UI.el('div', 'api-temp');
      self.tempInput = UI.el('input', 'api-range');
      self.tempInput.type = 'range';
      self.tempInput.min = '0';
      self.tempInput.max = '1.5';
      self.tempInput.step = '0.1';
      self.tempLabel = UI.el('span', 'api-temp-label', '0.4');
      self.tempInput.addEventListener('input', function () { self.tempLabel.textContent = self.tempInput.value; });
      tempWrap.appendChild(self.tempInput);
      tempWrap.appendChild(self.tempLabel);
      field('回答风格（温度）', tempWrap, '0 更严谨，1 更发散。学习场景建议 0.2 ~ 0.6。');
      card.appendChild(form);

      var actions = UI.el('div', 'api-actions');
      var save = UI.el('button', 'btn primary', '💾 保存配置');
      save.type = 'button';
      save.addEventListener('click', function () { self.save(); });
      actions.appendChild(save);
      var test = UI.el('button', 'btn', '🧪 测试连接');
      test.type = 'button';
      test.addEventListener('click', function () { self.test(); });
      actions.appendChild(test);
      self.clearBtn = UI.el('button', 'btn small ghost', '🗑 清除 Key');
      self.clearBtn.type = 'button';
      self.clearBtn.addEventListener('click', function () {
        if (!root.confirm('确定清除 API 配置吗？')) return;
        AI.clear();
        self.cfg = AI.load();
        self.renderForm();
        self.setStatus('已清除。', 'info');
      });
      actions.appendChild(self.clearBtn);
      card.appendChild(actions);
      self.statusEl = UI.el('div', 'api-status', '');
      card.appendChild(self.statusEl);
      main.appendChild(card);

      var uses = UI.el('div', 'card');
      uses.appendChild(UI.el('h3', null, '配置好之后，可以在这些地方用它'));
      var grid = UI.el('div', 'api-uses');
      [['🤖 AI 助教', '做题卡住时，在任务卡里点「问 AI 助教」：它会结合题目、你的代码和报错，给你 5 行以内的提示（不给完整答案）。'],
        ['🧭 AI 点评思路', '思维训练里画完流程图，点「AI 点评我的流程图」：它只看你的思路和连线，提 2~3 条改进建议。'],
        ['📚 深入解释函数', '函数手册的每条详情里，可以点「让 AI 讲得再细一点」，结合原型和常见坑给你补充例子。']].forEach(function (u) {
        var box = UI.el('div', 'api-use');
        box.appendChild(UI.el('b', null, u[0]));
        box.appendChild(UI.el('span', null, u[1]));
        grid.appendChild(box);
      });
      uses.appendChild(grid);
      var demo = UI.el('button', 'btn small', '💬 试问一个 C 问题');
      demo.type = 'button';
      demo.addEventListener('click', function () {
        if (!self.ensure()) return;
        ApiView.ask({
          title: 'AI 小测试',
          system: '你是 C 语言助教，用简体中文回答，最多 4 行。',
          prompt: '用两句话说明：printf 打印 double 应该用什么格式符？为什么？'
        });
      });
      uses.appendChild(demo);
      main.appendChild(uses);
      layout.appendChild(main);

      var side = UI.el('aside', 'api-side');
      var safety = UI.el('div', 'side-card');
      safety.appendChild(UI.el('div', 'side-title', '🔐 安全须知'));
      var ul = UI.el('ul', 'api-safety');
      ['API Key 只存在你浏览器的 localStorage 里，不会上传到本站（本站没有服务器）。',
        '但 localStorage 里的内容能被同一台电脑上的其他人或浏览器插件看到，公共电脑上用完请点「清除 Key」。',
        '不要把 Key 写进代码仓库、截图或聊天记录里。',
        '浏览器直接调用第三方 API 可能被对方的 CORS 策略拦住；遇到「连接失败」可以换服务，或用本地 Ollama。',
        'Key 可能会产生费用——请在你自己的服务商后台设置额度上限。'].forEach(function (t) {
        ul.appendChild(UI.el('li', null, t));
      });
      safety.appendChild(ul);
      side.appendChild(safety);
      var help = UI.el('div', 'side-card');
      help.appendChild(UI.el('div', 'side-title', '怎么拿到 Key'));
      var p = UI.el('p', 'tiny muted');
      p.textContent = '去你选择的服务商控制台创建 API Key（通常叫 API Keys / 访问密钥），复制后粘贴到左边。模型名也要填对，否则会返回 404 或「模型不存在」。';
      help.appendChild(p);
      side.appendChild(help);
      layout.appendChild(side);
      host.appendChild(layout);
      this.ui = { base: self.baseInput, key: self.keyInput, model: self.modelInput, temp: self.tempInput, tempLabel: self.tempLabel, status: self.statusEl, presets: presets };
      this.built = true;
      this.renderForm();
    },

    renderForm: function () {
      if (!this.ui.base) return;
      this.ui.base.value = this.cfg.baseUrl || '';
      this.ui.key.value = this.cfg.apiKey || '';
      this.ui.model.value = this.cfg.model || '';
      this.ui.temp.value = String(typeof this.cfg.temperature === 'number' ? this.cfg.temperature : 0.4);
      this.ui.tempLabel.textContent = this.ui.temp.value;
      var presets = this.ui.presets.querySelectorAll('.api-preset');
      for (var i = 0; i < presets.length; i++) {
        presets[i].classList.toggle('on', presets[i].textContent === AI.preset(this.cfg.preset).name);
      }
      this.setStatus(AI.configured() ? '✅ 已配置：' + (this.cfg.model || '（未填模型）') : '还没有配置（填好并保存后，AI 按钮才能用）。', AI.configured() ? 'ok' : 'info');
    },

    readForm: function () {
      return {
        preset: this.cfg.preset,
        baseUrl: this.ui.base.value.trim(),
        apiKey: this.ui.key.value.trim(),
        model: this.ui.model.value.trim(),
        temperature: parseFloat(this.ui.temp.value)
      };
    },
    save: function () {
      this.cfg = this.readForm();
      if (!this.cfg.baseUrl || !this.cfg.model) {
        this.setStatus('接口地址和模型名都要填。', 'bad');
        return false;
      }
      var ok = AI.save(this.cfg);
      this.setStatus(ok ? '✅ 已保存（只保存在这个浏览器里）。' : '保存失败：浏览器可能禁用了 localStorage。', ok ? 'ok' : 'bad');
      return ok;
    },
    test: function () {
      var self = this;
      if (!this.save()) return;
      this.setStatus('⏳ 正在连接…', 'info');
      AI.test().then(function (reply) {
        self.setStatus('✅ 连接成功！模型回复：' + reply.slice(0, 80), 'ok');
      }).catch(function (err) {
        self.setStatus('❌ ' + (err && err.message ? err.message : String(err)), 'bad');
      });
    },
    setStatus: function (text, kind) {
      if (!this.ui.status) return;
      this.ui.status.textContent = text;
      this.ui.status.className = 'api-status ' + (kind || 'info');
    },
    ensure: function () {
      if (AI.configured()) return true;
      UI.toast('先配置 API', '去「API 设置」填一个 Key，就能使用 AI 助教啦。', 'urgent');
      UI.showView('api');
      return false;
    },
    enter: function () {
      this.build();
      this.cfg = AI.load();
      this.renderForm();
    },

    ask: function (opts) {
      opts = opts || {};
      var self = this;
      var back = UI.el('div', 'fx-comfort-back');
      var card = UI.el('div', 'fx-comfort-card api-ask-card');
      card.appendChild(UI.el('h3', 'fx-comfort-title', opts.title || 'AI 助手'));
      var state = UI.el('div', 'api-ask-status', '⏳ 正在思考…（第一次可能会慢一点）');
      card.appendChild(state);
      var answer = UI.el('div', 'api-answer');
      card.appendChild(answer);
      var actions = UI.el('div', 'think-actions');
      var copy = UI.el('button', 'btn small', '📋 复制回答');
      copy.type = 'button';
      copy.addEventListener('click', function () {
        try {
          if (root.navigator && root.navigator.clipboard) {
            root.navigator.clipboard.writeText(answer.textContent);
            copy.textContent = '已复制 ✓';
            setTimeout(function () { copy.textContent = '📋 复制回答'; }, 1200);
          }
        } catch (e) { }
      });
      copy.disabled = true;
      actions.appendChild(copy);
      var retry = UI.el('button', 'btn small', '↻ 重试');
      retry.type = 'button';
      actions.appendChild(retry);
      var close = UI.el('button', 'btn small ghost', '关闭');
      close.type = 'button';
      close.addEventListener('click', function () { if (back.parentNode) back.parentNode.removeChild(back); });
      actions.appendChild(close);
      card.appendChild(actions);
      back.appendChild(card);
      doc.body.appendChild(back);

      function run() {
        state.textContent = '⏳ 正在思考…（第一次可能会慢一点）';
        state.className = 'api-ask-status';
        answer.textContent = '';
        copy.disabled = true;
        retry.disabled = true;
        var messages = [];
        if (opts.system) messages.push({ role: 'system', content: opts.system });
        messages.push({ role: 'user', content: opts.prompt || '' });
        AI.chat(messages, { maxTokens: opts.maxTokens || 700, temperature: opts.temperature }).then(function (text) {
          state.textContent = '✅ 回答：';
          state.className = 'api-ask-status ok';
          answer.textContent = text;
          copy.disabled = false;
          retry.disabled = false;
        }).catch(function (err) {
          var msg = err && err.message ? err.message : String(err);
          if (err && err.status === 401) msg += '\n\n提示：401 通常是 Key 不对、过期或没有权限。';
          else if (err && err.status === 404) msg += '\n\n提示：404 通常是接口地址或模型名不对。';
          state.textContent = '❌ 出错了';
          state.className = 'api-ask-status bad';
          answer.textContent = msg + '\n\n可以去「API 设置」里检查配置，或者换一个模型试试。';
          retry.disabled = false;
        });
      }
      retry.addEventListener('click', run);
      run();
      return back;
    }
  };

  CC.ApiView = ApiView;
})(typeof globalThis !== 'undefined' ? globalThis : this);