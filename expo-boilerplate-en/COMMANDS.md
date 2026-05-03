# Expo Boilerplate Commands

This document lists the fixed command entries for the Expo boilerplate.

When you enter `Run Command ...`, the agent reads `agent-scripts/SCRIPTS.md` and runs the matching script. Do not ask the agent to guess script paths.

## Command Overview

| Command | Purpose | Prerequisites | Result |
| --- | --- | --- | --- |
| `Run Command init expo` | Create or adopt the `expo/` project | Node.js, npm, npx, Git, EAS CLI | `expo/` becomes an Expo project and `EXPO.md` is updated |
| `Run Command start expo` | Start the Expo local development server | `expo/package.json` exists | A new PowerShell window shows the Expo Go QR code |
| `Run Command init build` | Configure and run the first EAS Build | Expo initialized, EAS CLI available, logged in to EAS | First cloud build completes and build-ready state is written |
| `Run Command build expo` | Run later non-interactive cloud builds | Target platform has completed init build | Build artifact is downloaded to `user-assets/builds/` |

## Initialize Expo

```text
Run Command init expo
```

Behavior:

- Missing `expo/`: creates it.
- Empty `expo/`: creates a new Expo project.
- Existing Expo project in `expo/`: adopts it and syncs state without overwriting source code.
- Non-empty `expo/` that is not an Expo project: stops.

If Node.js, Git, or EAS CLI is missing, the agent reports what is missing first. Installing environment tools requires user approval.

## Start Expo

```text
Run Command start expo
```

Behavior:

- Checks `expo/package.json`.
- Checks for existing Expo / Metro processes or occupied ports.
- Opens a new PowerShell window.
- Runs `npm start` in that new window.

Close that PowerShell window to stop the local development server.

## Initialize Packaging

```text
Run Command init build
```

The agent asks you to choose a package type:

| Type | Output | Notes |
| --- | --- | --- |
| Standard APK install package | `.apk` | Direct Android install testing |
| Google Play package | Usually `.aab` | For Google Play submission flow |
| iOS package | `.ipa` | Requires Apple Developer account or credentials |

The first package build opens an interactive EAS Build window.  
After success, the agent writes Android or iOS build-ready state to `agent-documents/EXPO.md`.

## Later Builds

```text
Run Command build expo
```

The agent asks for the package type again, then runs a non-interactive EAS Cloud Build.

Artifacts are saved to:

```text
user-assets/builds/yyyy-MM-dd-HH-mm-ss/
```

If Android or iOS has not completed first-time package initialization, the agent stops and tells you to run `Run Command init build` first.

## Common Blockers

| Blocker | Fix |
| --- | --- |
| Expo is not initialized | Run `Run Command init expo` first |
| EAS is not logged in | Complete `eas login`, then retry |
| Package type not selected | Choose APK, Google Play, or iOS |
| iOS is missing Apple account or credentials | User handles Apple Developer requirements |
| Port or Expo process is already running | Close the existing Expo PowerShell window, then retry |

This template uses Expo Cloud Build. It does not use local Android Studio, Android SDK, or Xcode build chains.
