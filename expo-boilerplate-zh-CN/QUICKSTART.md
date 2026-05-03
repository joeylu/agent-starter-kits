# Expo Boilerplate Quickstart

这个模板用于快速搭建一个可以交给 AI 开发的 Expo React Native 工作区。

它适合用 Expo Go 做本地预览，用 EAS Cloud Build 做 Android / iOS 云端封包。`EAS Cloud Build` 是 Expo 官方云端打包服务，不需要本机安装 Android Studio、Android SDK 或 Xcode。

## 1. 创建工作区

1. 复制 `expo-boilerplate-zh-CN`，作为新 App 项目目录。
2. 用支持 AI agent 的开发工具打开整个目录，例如 VSCode、Claude、Codex、OpenCode 等。
3. 让 AI 先读取项目规则，再进入命令层。

真实 Expo 项目位于 `expo/`。根目录主要放 agent 文档、脚本、工具索引和 Expo / EAS 状态记录。

## 2. 初始化 Expo 项目

告诉 AI：执行命令 初始化 expo。

AI 会检查 Node.js、npm、npx、Git 和 EAS CLI。  
如果工具缺失，AI 会停止并说明缺什么；只有用户批准后才会安装。

初始化行为：

- `expo/` 为空：创建新的 Expo 项目。
- `expo/` 已经是 Expo 项目：接管现有项目，不覆盖源码。
- `expo/` 非空但不是 Expo 项目：直接停止。

## 3. 启动本地预览

初始化完成后，告诉 AI：执行命令 启动 expo。

AI 会打开一个新的 PowerShell 窗口，在里面启动 Expo 开发服务器，并显示 Expo Go 二维码。  
关闭这个 PowerShell 窗口，就等于停止 Expo 开发服务器。

## 4. 用自然语言开发

初始化后可以直接描述 App 需求，例如：

```text
做一个底部 Tab 导航
做一个登录页
接入一个列表接口
给详情页加一个加载状态
```

AI 会优先使用本地 Expo 官方 skills，例如 UI、导航、网络请求、Tailwind、EAS 部署等技能。

## 5. 初始化封包

当需要打安装包时，告诉 AI：执行命令 初始化封包。

AI 会先让你选择封包类型：

```text
普通 APK 安装包
Google Play 安装包
iOS 安装包
```

首次封包是交互式 EAS Build，可能需要登录 Expo / EAS、配置凭证，iOS 还可能需要 Apple Developer 账号。  
缺少这些信息时，AI 会停止并让你处理，不会自动乱修。

## 6. 后续自动封包

首次封包成功后，告诉 AI：执行命令 封包 expo。

AI 会执行非交互式 EAS Cloud Build，等待构建完成，并把产物下载到：

```text
user-assets/builds/yyyy-MM-dd-HH-mm-ss/
```

Android 和 iOS 的 ready 状态分别记录在：

```text
agent-documents/EXPO.md
```

## 7. 命令文档

Quickstart 只说明常用流程。

完整命令说明见：

```text
COMMANDS.md
```

里面包含初始化、启动、初始化封包、后续封包、APK / Google Play / iOS 的区别、前置条件和产物位置。

## 8. 边界

这个模板不绑定具体 App 题材、业务模型或后端。

它不走本地 Android Studio / Xcode 原生构建链路。工具安装、EAS 登录、Apple 账号、构建凭证等关键动作，都需要用户明确参与或批准。
