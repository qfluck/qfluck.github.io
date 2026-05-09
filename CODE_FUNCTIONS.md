# 项目代码功能文档

更新时间：2026-05-10

## 项目概览

本项目是部署在 GitHub Pages 上的个人静态站点，根目录页面承担工具导航、文本加解密、收藏管理、书籍阅读入口和 JSON 实体类生成等功能；`books/` 目录保存可直接访问的 PDF 文件；`*_worker.js` 文件用于 Cloudflare Worker 场景。

## 页面功能

### `index.html`

个人门户首页，负责集中展示站点入口。

- 根据当前时间显示问候语和实时日期时间。
- 渲染工具、资源、阅读、文本等入口卡片。
- 支持按标题、描述和关键词搜索入口。
- 入口包括 `encrypt.html`、`VO.html`、`book-market.html`、`book.html` 和 `jiachao.txt`。
- 页面采用响应式卡片布局，移动端自动收缩为单列。

核心脚本：

- `renderCards()`：根据搜索词过滤并渲染入口卡片。
- `updateTime()`：更新时间、年份和问候语。

### `encrypt.html`

浏览器本地对称加密工具，依赖 CDN 上的 CryptoJS。

- 支持 AES、TripleDES、DES、Rabbit、RC4。
- 明文与密文双栏输入，支持加密、解密、互换、清空。
- 支持复制明文或密文。
- 支持密钥显示/隐藏和密钥强度提示。
- 支持 `Ctrl + Enter` 快捷处理：焦点在密文区时解密，否则加密。
- 处理过程在浏览器本地完成，页面不主动上传明文、密文或密钥。

核心脚本：

- `processText(mode)`：执行加密或解密。
- `requireReady(target)`：校验依赖、密钥和待处理文本。
- `copyText(id)`：复制指定文本框内容。
- `updateStats()`：更新字符计数和密钥强度提示。

### `VO.html`

JSON 实体类生成器，依赖 highlight.js 做代码高亮。

- 支持 TypeScript、Java、Python、C#。
- 支持自定义根类型名称。
- 支持插入示例 JSON、格式化 JSON、生成代码、复制代码。
- 支持对象嵌套和对象数组，自动拆分子实体。
- 支持字段命名转换：camelCase、PascalCase、snake_case。
- 对保留字和数字开头字段做基础避让。
- 支持 `Ctrl + Enter` 快捷生成。

核心脚本：

- `generateClasses(jsonObj, rootClassName, lang)`：生成目标语言实体代码。
- `inferType(value, key)`：推断字段类型。
- `renderClass(className, fields)`：按语言渲染类型定义。
- `parseJsonInput()`：解析并校验输入 JSON。
- `highlight(lang)`：刷新代码高亮。

### `book.html`

本地 PDF 书籍阅读入口。

- 展示 `books/` 目录下的书籍清单。
- 支持按书名、作者、主题搜索。
- 显示当前筛选数量和总数量。
- 每本书提供阅读和下载操作。
- 移动端按钮和列表自动换行，避免标题溢出。

核心脚本：

- `renderBooks()`：过滤并渲染书籍列表。

### `book-market.html`

个人收藏管理页，依赖远端接口 `https://api.4416123.xyz/api/bookmark`。

- 通过 `x-api-key` 请求头验证管理密钥。
- 支持加载、刷新、新增、编辑、删除收藏。
- 支持按标题、简介和 URL 搜索。
- 支持浅色/深色主题切换，并保存到 `localStorage`。
- 可保存密钥到当前浏览器，支持清除密钥退出。
- URL 自动补全 `https://` 并做合法性校验。
- 同步失败时会回滚本地变更，减少误删或误改的风险。
- 卡片展示网站 favicon、标题、简介和域名。

核心脚本：

- `initApp(key)`：验证密钥并初始化收藏列表。
- `fetchBookmarks()`：从远端 API 拉取收藏。
- `render()`：根据搜索词渲染收藏卡片。
- `sync(message)`：将当前收藏数组同步回远端 API。
- `openModal(mode, bookmark)` / `closeModal()`：控制新增/编辑弹窗。
- `deleteBookmark(id)`：确认删除、同步并在失败时恢复。
- `normalizeUrl(value)`：规范化收藏 URL。

## 资源与数据文件

### `books/`

保存站点可访问的 PDF 书籍文件，目前包含：

- `中国历代政治得失.pdf`
- `国富论 ([英]亚当.斯密著，王亚南译) (Z-Library).pdf`
- `巴菲特传：一个美国资本家的成长 (Roger Lowenstein) (Z-Library).pdf`
- `段永平投资问答录(商业逻辑篇).pdf`
- `段永平投资问答录(投资逻辑篇).pdf`
- `段永平-Stop Doing List.pdf`

### `jiachao.txt`、`clash.txt`

文本资源文件，当前由页面或 README 链接直接访问。

## Worker 脚本

### `trojan_worker.js`

Cloudflare Worker 源码风格脚本，包含 `export default { fetch(...) }` 入口，并使用 `cloudflare:sockets`。从函数命名和配置生成函数看，主要职责包括：

- 处理 WebSocket 请求。
- 解析 Trojan over WebSocket 连接头。
- 建立 TCP 出站连接并在远端 socket 与 WebSocket 之间转发数据。
- 生成不同客户端格式的订阅配置。

主要函数：

- `fetch(request, env, ctx)`：Worker 请求入口。
- `ygkkkOverWSHandler(request)`：处理 WebSocket 代理链路。
- `parseygkkkHeader(buffer)`：解析协议头。
- `handleTCPOutBound(...)`：建立远端 TCP 连接。
- `remoteSocketToWS(...)`：远端 socket 到 WebSocket 的数据转发。
- `getygkkkConfig()`、`gettyConfig()`、`getclConfig()`、`getsbConfig()` 等：生成配置文本。

### `_worker.js`

压缩/混淆后的 Cloudflare Worker 脚本，也包含 `export default { fetch(...) }` 入口并使用 `cloudflare:sockets`。由于变量与函数名被混淆，维护时建议以 `trojan_worker.js` 作为可读源文件，避免直接修改 `_worker.js`。

### `obfuscate_work.js`

混淆后的 Worker 相关脚本，体积较大且命名不可读。建议只作为生成产物或发布产物保存；如果需要维护业务逻辑，应追溯未混淆源码。

### `test.js`

当前为空文件，无功能代码。

## 本次优化记录

- 修复所有 HTML 页面中的中文可读性、标题和交互文案。
- 统一页面视觉风格，减少大圆角和漂浮装饰，提升扫描效率。
- 首页新增入口搜索和更完整的工具导航。
- 书籍页新增搜索、计数、阅读与下载操作。
- 加密页新增密钥显示、强度提示、互换、清空、字符统计和快捷键。
- JSON 工具页新增根类型命名、示例、格式化、快捷生成和更稳健的类型推断。
- 收藏页新增刷新、清除密钥、空状态、加载状态、深浅主题、URL 规范化和同步失败回滚。

## 维护建议

- `book.html` 的书籍清单目前是静态数组；新增 PDF 后需要同步更新数组。
- `book-market.html` 的 API 地址写在页面脚本中，若服务迁移只需修改 `API_URL`。
- `encrypt.html` 与 `VO.html` 使用外部 CDN，离线环境会影响 CryptoJS 或 highlight.js 加载。
- `_worker.js` 和 `obfuscate_work.js` 不建议手工编辑；应保留可读源码并通过构建/混淆流程生成。
