# LOCAL_TROUBLESHOOT.md

## Node.js 不可用
检查：

```powershell
node --version
npm --version
```

任一命令不可用时，停止并报告 Node.js LTS 未正确安装。不得自行安装。

## 依赖安装失败
固定处理顺序：

1. 检查 `web/package.json`
2. 修复明显错误的依赖或 scripts
3. 重新运行 `npm install`
4. 仍失败时，报告 npm 输出中的关键错误

不得切换到其他包管理器。

## 端口占用
默认端口 `3000`。

如果占用，启动脚本会自动尝试 `3001` 到 `3009`。最终只报告脚本输出的实际地址。低能力模型不应手动拼端口命令。

## 页面打不开
先确认开发服务器仍在运行，再确认实际端口。

只报告 localhost 地址，不让学生判断终端日志。

如果需要重新启动预览，运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Start-Website.ps1
```

如果需要停止预览，运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Stop-Website.ps1
```

## 构建失败
运行：

```powershell
npm run build
```

根据报错修复源码。不得跳过构建失败，也不得把开发预览成功等同于构建成功。

构建失败时不得启动本地预览。

## 可清理目录
允许清理：

- `web/.next/`
- `web/node_modules/`

不得擅自删除源码、`package.json` 或 `package-lock.json`。
