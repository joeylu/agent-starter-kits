# PROJECT.md

## 项目身份
本项目是 Windows 11 本地教学网站模板，不绑定任何真实站点、域名、远程主机或外部运行环境。

学生打开本目录后，AI 的职责是把 `web/` 内的网站实体化开发，并在本机完成安装、运行、预览和构建检查。

学生的默认入口口令包括：

```text
初始化当前网站
初始化这个网站
初始化当前的 web
初始化当前的web
初始化这个网站项目
初始化 web
初始化web
```

看到这些口令，AI 必须按 `agent-documents/WEBSITE_INIT.md` 初始化 Next.js + PixiJS v8 项目。

## 固定基础环境
- 操作系统：Windows 11
- 编辑器：VSCode
- 运行环境：Node.js LTS 已经安装
- 包管理器：只使用 npm
- 网站根目录：只使用 `web/`
- 默认网站栈：Next.js + React + TypeScript + PixiJS v8

如果 `node --version` 或 `npm --version` 不可用，立即停止并报告：Node.js LTS 未正确安装。不得自行安装 Node.js。

## 本地部署定义
本模板中的“部署”只表示本地部署：

1. 在 `web/` 安装依赖
2. 执行构建检查
3. 后台启动本地预览
4. 打开本机地址

本地部署不表示上线，不连接外部主机，不处理域名，不处理证书，不处理远程发布。

## 固定命令链
所有命令默认从项目根目录执行。

```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Start-Website.ps1
```

默认优先预览地址，实际地址以脚本输出为准：

```text
http://localhost:3000
```

构建检查只运行：

```powershell
Set-Location .\web
npm run build
```

不要直接前台运行 `npm run dev`。本地预览必须通过 `agent-documents/Local/Start-Website.ps1` 后台启动。

## 触发规则
用户说“初始化当前网站 / 初始化这个网站 / 初始化当前的 web / 初始化当前的web / 初始化这个网站项目 / 初始化 web / 初始化web”时，AI 必须直接进入网站初始化链路：

1. 检查 Node.js 与 npm
2. 在 `web/` 内创建或修复固定文件清单
3. 写入 Next.js + PixiJS v8 最小可运行项目
4. 运行本地启动脚本
5. 脚本自动执行 `npm install`
6. 脚本自动执行 `npm run build`
7. 脚本后台启动本地预览
8. 返回实际 localhost 地址

不得要求用户再确认“批准修改”。

用户说“安装 / 启动 / 运行 / 预览 / 本地部署 / 部署”时，AI 只执行本地命令链。执行前必须确认 `web/package.json` 存在；如果不存在，立即中断并要求用户先说“初始化当前网站”。

用户说“上线 / 上传 / 服务器 / 远程发布”时，AI 必须说明：当前模板不包含外部发布能力，只支持本地运行与构建检查。

## 子项目结构
`web/` 是唯一网站根目录。不要额外创建 `api/`、`www/`、`content/` 来包裹网站。

`web/` 至少应包含：

- `package.json`
- `app/`
- `app/page.*`
- `app/layout.*`
- `next.config.*`
- `components/PixiStage.*`

如果这些文件缺失，AI 应按 `agent-documents/WEBSITE_INIT.md` 在 `web/` 内补齐最小 Next.js + PixiJS v8 项目结构。不得运行 `npx create-next-app`。

## 固定技术边界
允许：

- Next.js
- React
- TypeScript 或 JavaScript
- PixiJS v8
- CSS Modules / 全局 CSS / Tailwind，按现有项目决定
- `public/` 静态资源

禁止：

- Docker
- WSL
- IIS
- Nginx
- PM2
- SSH / SFTP / SCP / rsync
- pnpm / yarn / bun
- `npx create-next-app`
- `create-pixi`
- 全局安装 npm 包
- 自动更换技术栈

## 依赖规则
默认安装命令只有：

```powershell
npm install
```

AI 不得因为安装失败就切换包管理器。先修复当前 `web/` 的 `package.json`、锁文件或依赖冲突。

允许清理：

- `web/.next/`
- `web/node_modules/`

未经 Owner 明确同意，不得删除 `package.json`、`package-lock.json` 或源代码目录。

## 端口规则
默认端口是 `3000`。

如果端口被占用，AI 直接改用 `3001`，再按顺序尝试到 `3009`。最终回复必须给出实际可访问地址。

## 验收标准
本地部署成功必须同时满足：

- `npm install` 成功
- `npm run build` 成功
- 本地开发服务器在后台成功启动
- 浏览地址可访问

不得把“命令已经执行过”当成成功。

## 文档入口
具体本地部署 SOP 见：

- `agent-documents/WEBSITE_INIT.md`
- `agent-documents/LOCAL_DEPLOY.md`
- `agent-documents/LOCAL_TROUBLESHOOT.md`
- `agent-documents/Local/Start-Website.ps1`
- `agent-documents/Local/Stop-Website.ps1`

## 当前边界结论
AI 被授权开发和维护 `web/` 内的本地 Next.js 网站。

AI 未被授权执行任何外部发布、远程连接、服务器配置或系统级安装。
