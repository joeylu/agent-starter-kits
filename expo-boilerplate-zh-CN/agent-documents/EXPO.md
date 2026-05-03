# EXPO.md

## 目的
`agent-documents/EXPO.md` 记录当前仓库的 Expo / EAS 状态。

所有 agent 在读取 `agent-documents/PROJECT.md` 后，必须继续读取本文件。

## 提醒规则
- 如果 `expo_initialized` 不是 `true`，每次对话都必须提醒 Owner 先执行 `执行命令 初始化 expo`。
- 如果用户尝试 Android 自动 build，但 `android_build_ready` 不是 `true`，必须立即中断，并提示 Owner 执行 `执行命令 初始化封包` 后选择普通 APK 安装包或 Google Play 安装包。
- 如果用户尝试 iOS 自动 build，但 `ios_build_ready` 不是 `true`，必须立即中断，并提示 Owner 执行 `执行命令 初始化封包` 后选择 iOS。
- EAS build 流程执行 fail-fast。缺少登录、缺少配置、缺少 Apple 账户、缺少凭证或 EAS 返回错误时，停止并向 Owner 报告，不自动修复。
- 本项目永远使用 Expo Cloud Build，不纳入 Android Studio、Android SDK、Xcode 或任何本地原生构建链路。

## 状态
- expo_initialized: false
- expo_root: `expo/`
- expo_sdk: ``
- expo_cli: ``
- expo_package: ``
- react: ``
- react_native: ``
- eas_cli: ``
- eas_logged_in: false
- eas_logged_in_account: ``
- eas_logged_in_email: ``
- eas_configured: false
- eas_project_id: ``
- android_build_ready: false
- android_build_ready_at: ``
- ios_build_ready: false
- ios_build_ready_at: ``
- default_android_apk_profile: `apk`
- default_android_store_profile: `production`
- default_ios_profile: `production`
- build_artifacts_dir: `user-assets/builds/`
- last_automated_build_at: ``
- last_automated_build_dir: ``
- last_automated_build_status: ``
- last_automated_build_kind: ``

## 当前说明
- 当前仓库是可复制模板，不绑定任何具体 Expo 项目、EAS 账号或用户身份。
- `expo/` 可以为空目录，也可以是已有 Expo 项目。
- 目标项目执行 `执行命令 初始化 expo` 后，若 `expo/` 为空则创建新项目；若 `expo/` 已是 Expo 项目则接管并同步状态；若 `expo/` 非 Expo 项目则 fail-fast。
- 初始化或接管后由脚本写入 SDK、Expo、React Native、EAS 登录与 build 状态。
- Android 构建就绪状态和 iOS 构建就绪状态分开记录；APK 和 Google Play 安装包共享 `android_build_ready`。
- 首次 EAS Build 和后续自动 EAS Build 成功后，默认下载构建产物到 `user-assets/builds/yyyy-MM-dd-HH-mm-ss/`。
