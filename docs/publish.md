# 发布指南

本站是**纯静态网站**：没有后端、没有数据库、没有构建步骤，也不需要任何依赖。把文件夹丢到任何静态托管服务上就能跑。

下面按「最简单 → 最省事」的顺序列出几种做法。

---

## 方式一：先用起来（本地）

```bash
# 方式 A：直接双击打开（最简单）
#   用浏览器打开 index.html 即可

# 方式 B：起一个本地服务器（推荐，体验最完整）
node tools/dev-server.mjs        # 然后访问 http://localhost:5173
```

---

## 方式二：GitHub Pages（推荐，带自动发布）

### 1. 把代码推到一个新的 GitHub 仓库

```bash
git init
git add .
git commit -m "feat: 粉猫捉虫 · C 语言零基础互动学堂"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

> 如果这台机器连不上 GitHub（例如网络限制），可以先 `git bundle create fenmao.bundle --all`，把 bundle 文件拷到能上网的电脑上再推送；或者直接在 GitHub 网页上「Add file → Upload files」上传整个文件夹。

### 2. 打开 GitHub Pages

1. 进入仓库页面 → **Settings** → 左侧 **Pages**；
2. 在 **Build and deployment** 的 Source 里选择 **GitHub Actions**；
3. 推送到 `main` 分支后，仓库里自带的 `.github/workflows/deploy-pages.yml` 会自动运行：先跑 `node tests/run-all.mjs` 自检，再把整个站点发布出去；
4. 发布完成后，在 **Actions** 里能看到访问地址，形如 `https://<你的用户名>.github.io/<仓库名>/`。

### 3. 自定义域名（可选）

在仓库根目录新建 `CNAME` 文件，内容写你的域名（例如 `c.example.com`），然后到域名服务商处把 DNS 指向 GitHub Pages。

---

## 方式三：Gitee Pages（国内访问速度通常更快）

1. 在 [Gitee](https://gitee.com/) 新建仓库并推送代码（命令与 GitHub 类似，把 remote 换成 Gitee 地址）；
2. 仓库页面 → **服务** → **Gitee Pages**；
3. 选择分支（`main` 或 `master`）、部署目录留空（根目录），勾选强制 HTTPS，点击「启动」。

> 注意：Gitee Pages 的免费版有时需要实名认证，并且更新内容后要手动点一次「更新」重新部署。

---

## 方式四：其他静态托管

| 平台 | 做法 |
| --- | --- |
| Vercel | 导入仓库，Framework Preset 选 **Other**，Build Command 留空，Output Directory 填 `.` |
| Netlify | 拖拽整个文件夹到 Netlify Drop，或连接仓库后 Build Command 留空、Publish directory 填 `.` |
| Cloudflare Pages | 连接仓库，构建命令留空，输出目录 `.` |
| 对象存储（OSS / COS / S3） | 直接把整个文件夹上传，开启静态网站托管 |

---

## 部署前检查清单

- [ ] `npm test` 全部通过（解释器 + 课程内容自检）；
- [ ] 用手机或浏览器开发者工具切到窄屏，确认手机布局正常；
- [ ] 打开首页 → 随便做一道题 → 提交，确认能通过并拿到小鱼干；
- [ ] 确认 `LICENSE` 与 `CREDITS.md` 里的署名是你想要的样子；
- [ ] 如果加了第三方素材，已经在 `CREDITS.md` 里补上署名。

## 常见问题

**问：为什么打开后小猫不动、按钮没反应？**

答：请确认 JavaScript 已启用。另外在你自己的电脑上双击 `index.html`（`file://` 协议）也能跑，但个别浏览器会限制本地文件的存储权限，这时代码不会被保存——用 `node tools/dev-server.mjs` 起个本地服务器就没有这个问题。

**问：能不能改颜色？**

答：所有颜色都集中在 `assets/css/style.css` 开头的 `:root { --pink: …; --bg: … }` 里，改那几个变量就能换整站配色。

**问：能不能加自己的课程？**

答：可以。照着 `assets/js/content-lessons-1.js` 的格式在 `CC.LESSONS` 里追加一课即可；记得在 `tests/content.test.mjs` 的校验里跑一遍（它会验证你的参考答案能不能通过判题）。
