# LOCAL_DEPLOY.md

## 定义
本地部署 = 在 Windows 11 本机完成依赖安装、启动预览、构建检查。

不连接外部环境，不处理域名，不处理证书，不发布到公网。

## 唯一入口
用户说“安装 / 启动 / 运行 / 预览 / 本地部署 / 部署”时，执行以下链路。

部署前提：`web/package.json` 必须存在。

如果 `web/package.json` 不存在，立即中断，不得自动初始化，不得继续安装依赖。回复用户：

```text
当前网站还没有初始化。请先说：初始化当前网站
```

```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Start-Website.ps1
```

默认优先地址，实际地址以脚本输出为准：

```text
http://localhost:3000
```

## 构建检查
每次本地部署都由 `Start-Website.ps1` 自动先运行 `npm run build`，再后台启动预览。

如果只需要单独检查构建，可运行：

```powershell
Set-Location .\web
npm run build
```

如果构建失败，按报错修复 `web/` 内源码，再重新运行构建检查。构建失败时不得启动预览，不得让学生打开浏览器。

不要直接前台运行 `npm run dev`。本地预览必须通过 `agent-documents/Local/Start-Website.ps1` 后台启动。

## 成功口径
只有满足以下条件，才算本地部署成功：

- 依赖安装成功
- 构建检查成功
- 本地开发服务器后台启动成功
- 返回了可访问的 localhost 地址

## 停止预览
需要停止本地预览时，只运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Stop-Website.ps1
```

## 失败处理
端口被占用时，按 `3001` 到 `3009` 顺序换端口。

依赖失败时，修复 `web/` 内依赖声明，不切换包管理器。

构建失败时，修复源码，不要求学生手动改文件。

预览进程占用终端时，说明错误地前台运行了 `npm run dev`。应停止该前台命令，然后改用 `Start-Website.ps1`。

Node.js 不可用时，立即停止；该问题不由本模板自动修复。

## 禁止动作
- 不做公网发布
- 不上传文件
- 不连接外部主机
- 不安装系统服务
- 不要求学生手动执行复杂命令
