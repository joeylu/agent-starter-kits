# Expo Boilerplate Commands

这个文档列出 Expo boilerplate 的固定命令入口。

当你输入“执行命令 ...”时，AI 会读取 `agent-scripts/SCRIPTS.md`，再运行对应脚本。不要让 AI 猜脚本路径。

## 命令总览

| 命令 | 用途 | 前置条件 | 结果 |
| --- | --- | --- | --- |
| `执行命令 初始化 expo` | 创建或接管 `expo/` 项目 | Node.js、npm、npx、Git、EAS CLI | `expo/` 成为 Expo 项目，`EXPO.md` 状态更新 |
| `执行命令 启动 expo` | 启动 Expo 本地开发服务器 | `expo/package.json` 存在 | 新 PowerShell 窗口显示 Expo Go 二维码 |
| `执行命令 初始化封包` | 首次配置并执行 EAS Build | Expo 已初始化，EAS CLI 可用，已登录 EAS | 完成首次云端构建，写入 build-ready 状态 |
| `执行命令 封包 expo` | 后续非交互式云端封包 | 对应平台已完成初始化封包 | 构建产物下载到 `user-assets/builds/` |

## 初始化 Expo

```text
执行命令 初始化 expo
```

行为：

- `expo/` 不存在：创建。
- `expo/` 为空：创建新的 Expo 项目。
- `expo/` 已是 Expo 项目：接管并同步状态，不覆盖源码。
- `expo/` 非空但不是 Expo 项目：停止。

如果 Node.js、Git 或 EAS CLI 缺失，AI 会先报告缺失项。安装环境工具必须得到用户批准。

## 启动 Expo

```text
执行命令 启动 expo
```

行为：

- 检查 `expo/package.json`。
- 检查是否已有 Expo / Metro 进程或端口占用。
- 打开新的 PowerShell 窗口。
- 在新窗口中运行 `npm start`。

关闭该 PowerShell 窗口即可停止本地开发服务器。

## 初始化封包

```text
执行命令 初始化封包
```

AI 会要求选择封包类型：

| 类型 | 输出 | 说明 |
| --- | --- | --- |
| 普通 APK 安装包 | `.apk` | Android 直接安装测试 |
| Google Play 安装包 | 通常是 `.aab` | 用于 Google Play 提交流程 |
| iOS 安装包 | `.ipa` | 需要 Apple Developer 账号或凭证 |

首次封包会打开交互式 EAS Build 窗口。  
构建成功后，AI 会把 Android 或 iOS 的 ready 状态写入 `agent-documents/EXPO.md`。

## 后续封包

```text
执行命令 封包 expo
```

AI 会再次要求选择封包类型，然后执行非交互式 EAS Cloud Build。

产物保存到：

```text
user-assets/builds/yyyy-MM-dd-HH-mm-ss/
```

如果 Android 或 iOS 尚未完成首次封包初始化，AI 会停止并提示先执行 `执行命令 初始化封包`。

## 常见阻塞

| 阻塞 | 处理 |
| --- | --- |
| Expo 未初始化 | 先执行 `执行命令 初始化 expo` |
| EAS 未登录 | 手动完成 `eas login` 后重试 |
| 未选择封包类型 | 选择 APK、Google Play 或 iOS |
| iOS 缺少 Apple 账号或凭证 | 用户处理 Apple Developer 相关信息 |
| 端口或 Expo 进程占用 | 关闭已有 Expo PowerShell 窗口后重试 |

这个模板使用 Expo Cloud Build，不使用本地 Android Studio、Android SDK、Xcode 构建链路。
