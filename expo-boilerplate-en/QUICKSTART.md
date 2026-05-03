# Expo Boilerplate Quickstart

This template helps you quickly create an AI-ready Expo React Native workspace.

It is designed for local preview with Expo Go and Android / iOS cloud builds with EAS Cloud Build. `EAS Cloud Build` is Expo's official cloud packaging service, so this template does not require local Android Studio, Android SDK, or Xcode builds.

## 1. Create A Workspace

1. Copy `expo-boilerplate-en` and use the copy as your new app project folder.
2. Open the full folder in an AI-agent-capable development tool, such as VSCode, Claude, Codex, OpenCode, or a similar environment.
3. Let the agent read the project rules before using the command layer.

The real Expo project lives in `expo/`. The repository root holds agent documents, scripts, tool indexes, and Expo / EAS state.

## 2. Initialize The Expo Project

Tell the agent: Run Command init expo.

The agent checks Node.js, npm, npx, Git, and EAS CLI.  
If a tool is missing, the agent stops and explains what is missing. Installation only happens after user approval.

Initialization behavior:

- Empty `expo/`: creates a new Expo project.
- Existing Expo project in `expo/`: adopts it without overwriting source code.
- Non-empty `expo/` that is not an Expo project: stops immediately.

## 3. Start Local Preview

After initialization, tell the agent: Run Command start expo.

The agent opens a new PowerShell window, starts the Expo development server, and shows the Expo Go QR code.  
Closing that PowerShell window stops the Expo development server.

## 4. Develop With Natural Language

After initialization, describe the app you want directly, for example:

```text
Create bottom tab navigation.
Create a login screen.
Connect a list API.
Add a loading state to the detail screen.
```

The agent uses the local official Expo skills first, such as UI, navigation, networking, Tailwind, and EAS deployment skills.

## 5. Initialize Packaging

When you need an install package, tell the agent: Run Command init build.

The agent asks you to choose a package type:

```text
Standard APK install package
Google Play package
iOS package
```

The first package build is an interactive EAS Build. It may require Expo / EAS login, credential setup, and for iOS, an Apple Developer account.  
If required information is missing, the agent stops and waits for you instead of trying to repair it automatically.

## 6. Later Automatic Builds

After the first successful package build, tell the agent: Run Command build expo.

The agent runs a non-interactive EAS Cloud Build, waits for completion, and downloads the artifact to:

```text
user-assets/builds/yyyy-MM-dd-HH-mm-ss/
```

Android and iOS build-ready state is recorded separately in:

```text
agent-documents/EXPO.md
```

## 7. Command Document

This Quickstart only covers the common flow.

Full command details are in:

```text
COMMANDS.md
```

It covers initialization, startup, first package setup, later package builds, APK / Google Play / iOS differences, prerequisites, and artifact locations.

## 8. Boundary

This template is not tied to a specific app topic, business model, or backend.

It does not use local Android Studio / Xcode native build chains. Tool installation, EAS login, Apple accounts, and build credentials require explicit user participation or approval.
