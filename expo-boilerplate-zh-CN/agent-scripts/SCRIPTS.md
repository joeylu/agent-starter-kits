# SCRIPTS.md

## 目的
`agent-scripts/SCRIPTS.md` 是当前仓库的确定性命令层索引。

当用户输入“执行命令”或“Run Command”（不区分大小写）时，agent 必须读取本文档，并按本文档登记的命令执行对应本地脚本。

## 匹配规则
- 命令名称大小写不敏感。
- 命令必须匹配“命令列表”中的“命令”或“别名”。
- 若命令不存在，agent 必须列出可能匹配的命令，并列出全部可用命令。
- 模糊匹配由 agent 基于本文档完成，不额外引入命令分发脚本。

## 命令列表

### init expo
- 命令：`init expo`
- 别名：`初始化 expo`
- 说明：初始化根目录下的 `expo/` Expo React Native 项目。
- 含义：初始化或接管根目录下的 `expo/` Expo React Native 项目。
- 脚本：`agent-scripts/expo/Init-Expo.ps1`
- 执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Init-Expo.ps1
```

- Owner 批准安装依赖后执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Init-Expo.ps1 -InstallMissingDependencies
```

- 行为：
  - 查找仓库根目录下的 `expo/`。
  - 若 `expo/` 不存在，则创建。
  - 若 `expo/` 存在且为空，则初始化新 Expo 项目。
  - 若 `expo/` 存在且已有 Expo 项目，则接管现有项目并同步 `EXPO.md`，不覆盖源码。
  - 若 `expo/` 存在且非 Expo 项目，fail-fast。
  - 检查 Node.js、npm、npx、Git、EAS CLI。
  - 若缺少依赖，列出缺失项并 fail-fast；Owner 批准后，可由 agent 使用 `-InstallMissingDependencies` 重新执行。
  - 在临时目录生成 Expo 项目，再移动到 `expo/`，避免 npm 包名与 `expo` 依赖同名冲突。
  - 删除临时项目 `.git`，git 由目标项目用户自行建立。
  - 初始化或接管完成后同步更新 `agent-documents/EXPO.md`。
  - 不检查、不安装、不建议 Android Studio、Android SDK、Xcode 或任何本地原生构建链路。

### start expo
- 命令：`start expo`
- 别名：`启动 expo`
- 说明：打开新的 PowerShell 窗口，进入 `expo/`，启动 Expo 开发服务器并显示 Expo Go 二维码。
- 脚本：`agent-scripts/expo/Start-Expo.ps1`
- 执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Start-Expo.ps1
```

- 行为：
  - 校验根目录下存在 `expo/package.json`。
  - 若已有 Expo/Metro 进程或相关开发端口占用，fail-fast，要求 Owner 先关闭已有 PowerShell，或明确同意 LLM 帮助关闭。
  - 打开新的 PowerShell 窗口。
  - 在新窗口中执行 `npm start`。
  - 用户关闭该 PowerShell 窗口时，视为 Expo 进程结束。

### init build
- 命令：`init build`
- 别名：`初始化封包`
- 说明：先由 Owner 选择封包类型，再执行首次 EAS Build 初始化流程。该命令允许交互，用于配置 EAS Build、账号、凭证、首次云构建和首次产物下载。
- 脚本：`agent-scripts/expo/Init-Build.ps1`
- 执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Init-Build.ps1
```

- Owner 选择普通 APK 安装包后执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Init-Build.ps1 -BuildKind apk
```

- Owner 选择 Google Play 安装包后执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Init-Build.ps1 -BuildKind google-play
```

- Owner 选择 iOS 安装包后执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Init-Build.ps1 -BuildKind ios
```

- 行为：
  - 读取 `agent-documents/EXPO.md`。
  - 若 `expo_initialized` 不是 `true`，立即停止，并提示先执行 `执行命令 初始化 expo`。
  - 检查 `expo/`、`eas-cli`、EAS 登录状态。
  - 若未指定 `-BuildKind`，fail-fast，要求 Owner 选择：普通 APK 安装包、Google Play 安装包、iOS 安装包。
  - 普通 APK 安装包执行 Android build，profile 为 `apk`，产物为 `.apk`。
  - Google Play 安装包执行 Android build，profile 为 `production`，通常产物为 `.aab`；build 阶段不检查 Google Play 账号。
  - iOS 安装包执行 iOS build，profile 为 `production`，产物为 `.ipa`。
  - 打开新的 PowerShell 窗口，执行对应封包类型的首次交互式 EAS Build 初始化。
  - Android 首次初始化不检查 Google Play 账号。
  - Android 首次初始化会确保 `eas.json` 中存在 `production` 和 `apk` build profile。
  - iOS 首次初始化可能需要 Apple Developer 账号或凭证；缺少时 fail-fast，停止并等待 Owner 处理。
  - 首次 EAS Build 成功后，按平台更新 `android_build_ready` 或 `ios_build_ready`。
  - 首次 EAS Build 成功后，默认下载构建产物到 `user-assets/builds/yyyy-MM-dd-HH-mm-ss/`。
  - 不检查、不安装、不建议 Android Studio、Android SDK、Xcode 或任何本地原生构建链路。

### build expo
- 命令：`build expo`
- 别名：`封包 expo`
- 说明：先由 Owner 选择封包类型，再执行非交互式 Expo Cloud Build，等待完成，并把构建产物下载到本地项目目录。
- 脚本：`agent-scripts/expo/Build-Expo.ps1`
- 执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Build-Expo.ps1
```

- Owner 选择普通 APK 安装包后执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Build-Expo.ps1 -BuildKind apk
```

- Owner 选择 Google Play 安装包后执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Build-Expo.ps1 -BuildKind google-play
```

- Owner 选择 iOS 安装包后执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Build-Expo.ps1 -BuildKind ios
```

- 行为：
  - 读取 `agent-documents/EXPO.md`。
  - 若 `expo_initialized` 不是 `true`，立即停止，并提示先执行 `执行命令 初始化 expo`。
  - 若未指定 `-BuildKind`，fail-fast，要求 Owner 选择：普通 APK 安装包、Google Play 安装包、iOS 安装包。
  - 普通 APK 安装包执行 Android build，profile 为 `apk`，产物为 `.apk`。
  - Google Play 安装包执行 Android build，profile 为 `production`，通常产物为 `.aab`；build 阶段不检查 Google Play 账号。
  - iOS 安装包执行 iOS build，profile 为 `production`，产物为 `.ipa`。
  - Android build 依赖 `android_build_ready`。
  - iOS build 依赖 `ios_build_ready`。
  - 检查 `expo/eas.json`、`eas-cli`、EAS 登录状态。
  - 执行对应平台和 profile 的 `eas build --wait --json --non-interactive`。
  - 下载构建产物到 `user-assets/builds/yyyy-MM-dd-HH-mm-ss/`。
  - 若 EAS 返回错误或没有产物下载地址，fail-fast，停止并报告。

## 可用命令
- `init expo`
- `初始化 expo`
- `start expo`
- `启动 expo`
- `init build`
- `初始化封包`
- `build expo`
- `封包 expo`
