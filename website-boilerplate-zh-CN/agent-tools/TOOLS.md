# TOOLS.md

## 目的
本文档是本地教学模板的工具索引。

本模板默认不携带远程连接工具，不复用外部发布工具，不安装服务器相关工具。

## 当前工具状态
- Node.js LTS：默认已由教学流程提前安装
- npm：随 Node.js 提供
- 仓库内额外工具：无

## 检索方法
1. 先读取 `TOOLS.md`
2. 用户要求初始化网站时，读取 `agent-documents/WEBSITE_INIT.md`
3. 网站开发、安装、运行、构建任务，统一进入 `web/`
4. 优先使用 `web/package.json` 里的 npm scripts
5. 如果 `node --version` 或 `npm --version` 不可用，停止并报告 Node.js LTS 未正确安装
6. 如果需要新工具，必须先说明用途、影响和维护成本，再等待 Owner 明确批准

## 固定命令
```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Start-Website.ps1
```

停止本地预览：

```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Stop-Website.ps1
```

## 禁止
- 不安装 Docker、WSL、IIS、Nginx、PM2
- 不使用 SSH、SFTP、SCP、rsync
- 不使用 pnpm、yarn、bun
- 不运行 `npx create-next-app`
- 不运行 `create-pixi`
- 不直接前台运行 `npm run dev`
- 不全局安装 npm 包
- 不把本地预览解释成外部发布
