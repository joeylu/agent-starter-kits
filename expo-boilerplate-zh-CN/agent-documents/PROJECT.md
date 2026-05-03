# PROJECT.md

## 项目名称
expo default

## 项目类型
基于 Expo 的 React Native 本地开发环境模板。

## 项目目标
本项目用于建立一套可复制、可复用、适合 LLM agent 协作的 Expo React Native 开发环境。

最终形态不是一个具体业务应用，而是一个根目录模板：复制当前整个根目录后，可以作为新 React Native 项目的起点，并由 agent 引导用户进入正式开发。

## 当前边界
- 当前阶段不开发具体 React Native 产品功能。
- 当前阶段优先完成本地开发所需的软件、配置、工具索引、文档约束和 agent 工作流。
- 所有环境变更、工具安装、依赖安装都必须先说明原因、影响和风险，再由 Owner 放行。
- 已下载或已登记的本地工具必须优先复用，工具索引以 `agent-tools/TOOLS.md` 为准。

## Expo 工作目录规则
`expo/` 是 Expo React Native 项目的实际项目根目录。

后续 React Native 源码、Expo 配置、依赖安装、运行命令和开发验证，默认都在 `expo/` 内执行。

仓库根目录只作为 LLM agent 开发环境模板与文档治理层。

所有 agent 在读取本文件后，必须继续读取 `agent-documents/EXPO.md`，并以其中记录的 Expo / EAS 状态作为执行依据。

当前仓库作为模板维护时，不执行 Expo 项目初始化。

当 Owner 明确将复制后的仓库作为实体 Expo 项目开发时，如果 `agent-documents/EXPO.md` 中 `expo_initialized` 不是 `true`，必须提醒 Owner 先执行 `执行命令 初始化 expo`，直到初始化完成。

## Expo 官方技能
Expo 官方 agent 技能已安装在 `.agents/skills/expo/`。

来源记录见 `.agents/skills/expo/SOURCE.md`。

Expo / React Native 相关开发任务，agent 必须优先读取本地官方技能，再进行实现或建议。

常用入口：
- UI、导航、Expo Router、动画、组件：`.agents/skills/expo/plugins/expo/skills/building-native-ui/SKILL.md`
- 网络请求、API 调用、缓存、离线能力：`.agents/skills/expo/plugins/expo/skills/native-data-fetching/SKILL.md`
- Expo API Routes：`.agents/skills/expo/plugins/expo/skills/expo-api-routes/SKILL.md`
- Tailwind / NativeWind：`.agents/skills/expo/plugins/expo/skills/expo-tailwind-setup/SKILL.md`
- DOM components：`.agents/skills/expo/plugins/expo/skills/use-dom/SKILL.md`
- EAS Build、App Store、Google Play、部署：`.agents/skills/expo/plugins/expo/skills/expo-deployment/SKILL.md`
- EAS workflows / CI/CD：`.agents/skills/expo/plugins/expo/skills/expo-cicd-workflows/SKILL.md`
- Expo SDK 升级：`.agents/skills/expo/plugins/expo/skills/upgrading-expo/SKILL.md`
- Expo Dev Client：`.agents/skills/expo/plugins/expo/skills/expo-dev-client/SKILL.md`
- EAS Update 健康状态：`.agents/skills/expo/plugins/expo/skills/eas-update-insights/SKILL.md`

原生扩展相关技能仅在 Owner 明确要求时使用：
- `.agents/skills/expo/plugins/expo/skills/expo-module/SKILL.md`
- `.agents/skills/expo/plugins/expo/skills/expo-ui-swift-ui/SKILL.md`
- `.agents/skills/expo/plugins/expo/skills/expo-ui-jetpack-compose/SKILL.md`

不得因为读取原生扩展技能，就把本项目默认切换到 Android Studio、Android SDK、Xcode 或本地原生构建链路。

## 建设内容
- Expo / React Native 基础开发环境。
- Node.js、包管理器、Expo CLI、EAS CLI 与云端构建相关配置。
- agent 可读的项目文档、开发规则、工具索引和变更记录。
- 新项目复制后的初始化说明和开发引导流程。

## 非目标
- 不绑定具体 App 题材、页面、业务模型或后端服务。
- 不提前引入无明确用途的 UI 框架、状态管理库、数据库或云服务。
- 不制造看似完成但不可验证的环境结果。

## 执行原则
- 先确认本机已有工具，再判断是否需要安装。
- 先建立可验证的最小 Expo 开发链路，再扩展辅助工具。
- 默认优先使用 Expo / EAS 云端构建 Android 与 iOS 包。
- 本项目永远以 Expo Cloud Build 为构建路径，不纳入 Android Studio、Android SDK、Xcode 或本地原生构建链路。
- `agent-scripts/SCRIPTS.md` 是确定性命令层入口；用户输入“执行命令”或“Run Command”时，必须从该文件匹配命令。
- EAS build 相关状态以 `agent-documents/EXPO.md` 为准；Android 自动 build 依赖 `android_build_ready`，iOS 自动 build 依赖 `ios_build_ready`。
- `执行命令 封包 expo` 必须先让 Owner 选择封包类型：普通 APK 安装包、Google Play 安装包、iOS 安装包。
- `执行命令 初始化封包` 也必须先让 Owner 选择封包类型：普通 APK 安装包、Google Play 安装包、iOS 安装包。
- 首次 EAS Build 和后续自动 EAS Build 成功后，构建产物默认下载到 `user-assets/builds/yyyy-MM-dd-HH-mm-ss/`。
- 构建流程执行 fail-fast：缺少登录、缺少配置、缺少 Apple 账户或 EAS 凭证等问题时，停止并向 Owner 报告，不自动修复。
- 所有文档与配置文件保持 UTF-8，中文必须可读。
- 每次代码、脚本或配置改动后，必须在 `agent-documents/dev-notes` 写入当天变更记录。

## 当前状态
PROJECT.md 已初始化。

已明确 `expo/` 为后续 Expo React Native 项目的实际项目根目录。

当前仓库是可复制模板，不绑定任何具体 Expo 项目、EAS 账号、Expo projectId、Apple 账户、构建凭证或用户身份。

当前模板仓库不执行 `执行命令 初始化 expo`。

目标项目复制本仓库后，先执行：
- `执行命令 初始化 expo`

如果 `expo/` 为空，该命令会创建新 Expo 项目。

如果 `expo/` 已经是现有 Expo 项目，该命令会接管现有项目并同步 `agent-documents/EXPO.md`，不会覆盖源码。

如果 `expo/` 非空但不是 Expo 项目，该命令必须 fail-fast。

完成 Expo 初始化后，再根据需要执行：
- `执行命令 启动 expo`
- `执行命令 初始化封包`
- `执行命令 封包 expo`
