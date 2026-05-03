# CODER.md

## 适用对象
- 本文档写给 AI agent，不写给终端用户。
- 优先保证执行路径确定、歧义低。

## 任务
- 在 `web/` 内安全实现本地 Next.js 网站项目。
- 默认初始化目标是 Next.js + React + TypeScript + PixiJS v8。
- 工作流要足够简单，适合非技术学生：由 AI 完成文件创建、依赖安装、构建检查和本地预览。

## 强制读取顺序
写代码前，先读取：

1. `agent-tools/TOOLS.md`
2. `agent-documents/PROJECT.md`
3. `agent-documents/WEBSITE_INIT.md`
4. `agent-documents/LOCAL_DEPLOY.md`
5. `agent-documents/LOCAL_TROUBLESHOOT.md`

如果任务涉及 PixiJS，使用 `.agents/skills/pixi8/` 下的 PixiJS v8 技能。

## 中文编码兼容规则
1. 所有新建或编辑的文本、代码、配置文件都保存为 UTF-8。
2. 不得交付乱码文本。
3. 最终回复前，对每个改动过的文本文件执行编码自检。
4. 如果中文显示为乱码，最终回复前必须修复编码。

## 范围
允许写入范围：

- `web/`
- `agent-documents/dev-notes/`

这些路径之外的文档或规则改动需要 Owner 明确批准。

## 固定技术栈
- Next.js
- React
- TypeScript
- 通过直接使用 `pixi.js` 接入 PixiJS v8
- 只使用 npm

不得使用 `npx create-next-app`、`create-pixi`、pnpm、yarn、bun、Docker、WSL、IIS、Nginx、PM2、SSH、SFTP、SCP 或 rsync。

## 初始化规则
当 Owner 要求初始化网站，包括“初始化当前网站”“初始化这个网站”“初始化当前的 web”“初始化当前的web”“初始化这个网站项目”“初始化 web”或“初始化web”时，按 `agent-documents/WEBSITE_INIT.md` 创建或修复最小项目。

除非 Node.js/npm 不可用，或必需文件无法写入，否则不要追问。

## Next.js 规则
- 使用 `web/app/` 下的 App Router。
- 浏览器专用逻辑放在 Client Components 中。
- 除非 `app/page.tsx` 本身直接需要交互，否则应保持为 Server Component。
- PixiJS 代码放在 `web/components/PixiStage.tsx`，并写 `'use client'`。
- 全局 CSS 只能从 `app/layout.tsx` 导入。
- 不要创建 `api/`、`www/`、`content/` 等额外根目录。

## PixiJS v8 规则
- 安装 `pixi.js`。
- 在 Next.js 中，Client Components 顶部只做类型导入，并在 `useEffect` 内动态导入 `pixi.js`。
- 使用 `const app = new Application();`，随后执行 `await app.init(...)`。
- 挂载 `app.canvas`，不要使用 `app.view`。
- 不要给 `new Application(...)` 传选项。
- `app.init(...)` 完成前，不要访问 `app.canvas`、`app.renderer` 或 `app.screen`。
- React 组件卸载时用 `app.destroy(...)` 销毁 Pixi application。
- 避免 v7 API，例如 `beginFill`、`endFill`、`drawCircle` 链式调用、`BaseTexture` 和 `DisplayObject`。

## 本地运行规则
- 使用 `npm install` 安装依赖。
- 使用 `npm run build` 做构建验证。
- 不要在前台运行 `npm run dev`。
- 使用 `agent-documents/Local/Start-Website.ps1` 安装、构建、后台启动开发服务器、探测 localhost，并报告最终 URL。
- 使用 `agent-documents/Local/Stop-Website.ps1` 停止已记录的本地开发服务器。
- 如果 `3000` 端口被占用，启动脚本会依次尝试 `3001` 到 `3009`。

## 输出要求
对代码任务：

- 报告具体到文件级别的改动。
- 报告是否尝试过 `Start-Website.ps1`、`npm install`、`npm run build` 和本地预览。
- 包含 `Encoding Check: PASS/FAIL`，并列出已检查的改动文本文件。
