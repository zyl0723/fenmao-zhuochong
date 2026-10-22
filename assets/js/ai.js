/*!
 * 粉猫捉虫 · AI 增强（用户自己填写 API）
 * 说明：API Key 只保存在「你自己的浏览器」里，直接调用你配置的服务；
 *      本站没有后端，不会把 Key 传到任何第三方。
 * 支持任何兼容 OpenAI Chat Completions 接口的服务（OpenAI / DeepSeek / 智谱 / Moonshot / 通义 / Ollama…）。
 * 许可：MIT（见仓库根目录 LICENSE）
 */
(function (root) {
  'use strict';
  var CC = root.CC || (root.CC = {});
  var KEY = 'fenmao-ai-config-v1';

  var PRESETS = [
    { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', keyHint: 'sk-…', doc: 'https://platform.openai.com/api-keys' },
    { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat', keyHint: 'sk-…', doc: 'https://platform.deepseek.com/' },
    { id: 'zhipu', name: '智谱 GLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash', keyHint: '…', doc: 'https://open.bigmodel.cn/' },
    { id: 'moonshot', name: 'Moonshot', baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k', keyHint: 'sk-…', doc: 'https://platform.moonshot.cn/' },
    { id: 'qwen', name: '通义千问', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-turbo', keyHint: 'sk-…', doc: 'https://dashscope.console.aliyun.com/' },
    { id: 'ollama', name: 'Ollama（本地）', baseUrl: 'http://localhost:11434/v1', model: 'llama3.2', keyHint: '本地模型通常不用 Key', doc: 'https://ollama.com/' },
    { id: 'custom', name: '自定义', baseUrl: '', model: '', keyHint: '填你服务商给的 Key', doc: '' }
  ];

  function defaults() {
    return { preset: 'openai', baseUrl: PRESETS[0].baseUrl, model: PRESETS[0].model, apiKey: '', temperature: 0.4 };
  }

  var AI = {
    PRESETS: PRESETS,
    KEY: KEY,
    load: function () {
      var cfg = defaults();
      try {
        var raw = root.localStorage && root.localStorage.getItem(KEY);
        if (raw) {
          var d = JSON.parse(raw);
          if (d && typeof d === 'object') {
            if (d.preset) cfg.preset = d.preset;
            if (typeof d.baseUrl === 'string') cfg.baseUrl = d.baseUrl;
            if (typeof d.model === 'string') cfg.model = d.model;
            if (typeof d.apiKey === 'string') cfg.apiKey = d.apiKey;
            if (typeof d.temperature === 'number') cfg.temperature = d.temperature;
          }
        }
      } catch (e) { }
      return cfg;
    },
    save: function (cfg) {
      try {
        root.localStorage && root.localStorage.setItem(KEY, JSON.stringify({
          preset: cfg.preset || 'custom',
          baseUrl: String(cfg.baseUrl || '').trim(),
          model: String(cfg.model || '').trim(),
          apiKey: String(cfg.apiKey || '').trim(),
          temperature: typeof cfg.temperature === 'number' ? cfg.temperature : 0.4
        }));
        return true;
      } catch (e) { return false; }
    },
    clear: function () {
      try { root.localStorage && root.localStorage.removeItem(KEY); } catch (e) { }
    },
    preset: function (id) {
      for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return PRESETS[i];
      return PRESETS[0];
    },
    configured: function () {
      var c = this.load();
      return !!(c.baseUrl && c.model && (c.apiKey || c.preset === 'ollama'));
    },
    chat: function (messages, opts) {
      var cfg = this.load();
      opts = opts || {};
      if (!cfg.baseUrl || !cfg.model) {
        return Promise.reject(new Error('还没有配置 API：请到「API 设置」里填写接口地址和模型。'));
      }
      if (!cfg.apiKey && cfg.preset !== 'ollama') {
        return Promise.reject(new Error('还没有填写 API Key：请到「API 设置」里填写。'));
      }
      var base = cfg.baseUrl.replace(/\/+$/, '');
      var url = base + '/chat/completions';
      var body = {
        model: cfg.model,
        messages: messages,
        temperature: typeof opts.temperature === 'number' ? opts.temperature : cfg.temperature,
        max_tokens: opts.maxTokens || 700
      };
      var headers = { 'Content-Type': 'application/json' };
      if (cfg.apiKey) headers['Authorization'] = 'Bearer ' + cfg.apiKey;
      var controller = null;
      var timer = null;
      try {
        controller = new AbortController();
        timer = setTimeout(function () { controller.abort(); }, opts.timeoutMs || 45000);
      } catch (e) { }
      var req = fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body), signal: controller ? controller.signal : undefined })
        .then(function (res) {
          return res.text().then(function (text) {
            var data = null;
            try { data = text ? JSON.parse(text) : null; } catch (e) { }
            if (!res.ok) {
              var msg = '';
              if (data && data.error) msg = data.error.message || data.error.code || JSON.stringify(data.error);
              else msg = String(text || '').slice(0, 300);
              var err = new Error('接口返回 ' + res.status + (msg ? '：' + msg : ''));
              err.status = res.status;
              throw err;
            }
            if (!data) throw new Error('接口返回的内容不是 JSON（可能地址不对）');
            var content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
            if (!content) {
              if (data.choices && data.choices[0] && data.choices[0].text) content = data.choices[0].text;
              else throw new Error('接口返回里没有找到回答内容（请确认这是 OpenAI 兼容的 /chat/completions 接口）');
            }
            return String(content).trim();
          });
        })
        .catch(function (err) {
          if (err && err.name === 'AbortError') throw new Error('请求超时了：网络慢或者服务没有响应，稍后再试。');
          if (err && (err.message || '').indexOf('Failed to fetch') >= 0) {
            throw new Error('连接失败：可能是网络不通、地址写错，或者服务不允许浏览器直接调用（CORS）。可以换一个支持 CORS 的服务，或用本地模型（Ollama）。');
          }
          throw err;
        })
        .then(function (v) {
          if (timer) clearTimeout(timer);
          return v;
        }, function (e) {
          if (timer) clearTimeout(timer);
          throw e;
        });
      return req;
    },
    test: function () {
      return this.chat([
        { role: 'system', content: '你是一个连接测试助手。' },
        { role: 'user', content: '请只回复：连接成功' }
      ], { maxTokens: 20, temperature: 0 });
    }
  };

  CC.AI = AI;
})(typeof globalThis !== 'undefined' ? globalThis : this);