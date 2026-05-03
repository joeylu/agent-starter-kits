# SCRIPTS.md

## Purpose
`agent-scripts/SCRIPTS.md` is the deterministic command-layer index for this repository.

When the user enters `Run Command` in any casing, the agent must read this document and run the matching local script registered here.

## Matching Rules
- Command names are case-insensitive.
- The command must match a `Command` or `Aliases` entry in the command list.
- If the command does not exist, the agent must list possible matches and all available commands.
- Fuzzy matching is done by the agent using this document. Do not introduce an extra command-dispatch script.

## Command List

### init expo
- Command: `init expo`
- Aliases: `initialize expo`
- Description: Initialize the `expo/` Expo React Native project at the repository root.
- Meaning: Create or adopt the `expo/` Expo React Native project at the repository root.
- Script: `agent-scripts/expo/Init-Expo.ps1`
- Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Init-Expo.ps1
```

- Run after Owner approves dependency installation:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Init-Expo.ps1 -InstallMissingDependencies
```

- Behavior:
  - Looks for `expo/` at the repository root.
  - Creates `expo/` if it does not exist.
  - Creates a new Expo project if `expo/` exists and is empty.
  - Adopts an existing Expo project if `expo/` already contains one, syncs `EXPO.md`, and does not overwrite source code.
  - Fails fast if `expo/` exists, is non-empty, and is not an Expo project.
  - Checks Node.js, npm, npx, Git, and EAS CLI.
  - If dependencies are missing, lists them and fails fast. After Owner approval, the agent may rerun with `-InstallMissingDependencies`.
  - Creates the Expo project in a temporary directory first, then moves it into `expo/` to avoid npm package-name conflicts with the `expo` dependency.
  - Deletes the temporary project's `.git`; git setup belongs to the target project user.
  - After initialization or adoption, syncs `agent-documents/EXPO.md`.
  - Does not check, install, or recommend Android Studio, Android SDK, Xcode, or any local native build chain.

### start expo
- Command: `start expo`
- Aliases: `launch expo`
- Description: Open a new PowerShell window, enter `expo/`, start the Expo development server, and show the Expo Go QR code.
- Script: `agent-scripts/expo/Start-Expo.ps1`
- Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Start-Expo.ps1
```

- Behavior:
  - Verifies that `expo/package.json` exists at the repository root.
  - If an Expo/Metro process or related development port is already in use, fails fast and asks Owner to close the existing PowerShell window or explicitly approve the LLM to close it.
  - Opens a new PowerShell window.
  - Runs `npm start` in the new window.
  - When the user closes that PowerShell window, the Expo process is considered stopped.

### init build
- Command: `init build`
- Aliases: `initialize build`
- Description: Owner chooses a package type first, then the script runs the first EAS Build initialization flow. This command is interactive and configures EAS Build, accounts, credentials, the first cloud build, and the first artifact download.
- Script: `agent-scripts/expo/Init-Build.ps1`
- Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Init-Build.ps1
```

- Run after Owner chooses standard APK install package:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Init-Build.ps1 -BuildKind apk
```

- Run after Owner chooses Google Play package:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Init-Build.ps1 -BuildKind google-play
```

- Run after Owner chooses iOS package:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Init-Build.ps1 -BuildKind ios
```

- Behavior:
  - Reads `agent-documents/EXPO.md`.
  - If `expo_initialized` is not `true`, stops immediately and tells Owner to run `Run Command init expo` first.
  - Checks `expo/`, `eas-cli`, and EAS login state.
  - If `-BuildKind` is not provided, fails fast and asks Owner to choose: standard APK install package, Google Play package, or iOS package.
  - Standard APK install package runs Android build with profile `apk` and produces `.apk`.
  - Google Play package runs Android build with profile `production` and usually produces `.aab`; the build stage does not check a Google Play account.
  - iOS package runs iOS build with profile `production` and produces `.ipa`.
  - Opens a new PowerShell window and runs the first interactive EAS Build initialization for the selected package type.
  - Android first-time initialization does not check a Google Play account.
  - Android first-time initialization ensures `eas.json` contains `production` and `apk` build profiles.
  - iOS first-time initialization may require an Apple Developer account or credentials; if missing, fail fast and wait for Owner.
  - After the first EAS Build succeeds, updates `android_build_ready` or `ios_build_ready` by platform.
  - After the first EAS Build succeeds, downloads artifacts by default to `user-assets/builds/yyyy-MM-dd-HH-mm-ss/`.
  - Does not check, install, or recommend Android Studio, Android SDK, Xcode, or any local native build chain.

### build expo
- Command: `build expo`
- Aliases: `package expo`
- Description: Owner chooses a package type first, then the script runs a non-interactive Expo Cloud Build, waits for completion, and downloads the build artifact into the local project directory.
- Script: `agent-scripts/expo/Build-Expo.ps1`
- Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Build-Expo.ps1
```

- Run after Owner chooses standard APK install package:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Build-Expo.ps1 -BuildKind apk
```

- Run after Owner chooses Google Play package:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Build-Expo.ps1 -BuildKind google-play
```

- Run after Owner chooses iOS package:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\agent-scripts\expo\Build-Expo.ps1 -BuildKind ios
```

- Behavior:
  - Reads `agent-documents/EXPO.md`.
  - If `expo_initialized` is not `true`, stops immediately and tells Owner to run `Run Command init expo` first.
  - If `-BuildKind` is not provided, fails fast and asks Owner to choose: standard APK install package, Google Play package, or iOS package.
  - Standard APK install package runs Android build with profile `apk` and produces `.apk`.
  - Google Play package runs Android build with profile `production` and usually produces `.aab`; the build stage does not check a Google Play account.
  - iOS package runs iOS build with profile `production` and produces `.ipa`.
  - Android build depends on `android_build_ready`.
  - iOS build depends on `ios_build_ready`.
  - Checks `expo/eas.json`, `eas-cli`, and EAS login state.
  - Runs `eas build --wait --json --non-interactive` for the selected platform and profile.
  - Downloads build artifacts to `user-assets/builds/yyyy-MM-dd-HH-mm-ss/`.
  - If EAS returns an error or no artifact download URL, fail fast and report.

## Available Commands
- `init expo`
- `initialize expo`
- `start expo`
- `launch expo`
- `init build`
- `initialize build`
- `build expo`
- `package expo`
