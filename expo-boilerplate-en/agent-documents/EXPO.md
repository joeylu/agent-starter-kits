# EXPO.md

## Purpose
`agent-documents/EXPO.md` records the current Expo / EAS state for this repository.

After reading `agent-documents/PROJECT.md`, every agent must continue by reading this file.

## Reminder Rules
- If `expo_initialized` is not `true`, remind Owner in every conversation to run `Run Command init expo` first.
- If the user tries an automated Android build but `android_build_ready` is not `true`, stop immediately and tell Owner to run `Run Command init build`, then choose either standard APK install package or Google Play package.
- If the user tries an automated iOS build but `ios_build_ready` is not `true`, stop immediately and tell Owner to run `Run Command init build`, then choose iOS.
- The EAS build flow is fail-fast. If login, configuration, Apple account, credentials, or EAS responses are missing or invalid, stop and report to Owner. Do not auto-repair.
- This project always uses Expo Cloud Build. Do not include Android Studio, Android SDK, Xcode, or any local native build chain.

## State
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

## Current Notes
- This repository is a copyable template. It is not bound to any concrete Expo project, EAS account, or user identity.
- `expo/` may be empty or may already contain an Expo project.
- After the target project runs `Run Command init expo`, an empty `expo/` creates a new project, an existing Expo project is adopted and synced, and a non-Expo non-empty `expo/` fails fast.
- After initialization or adoption, scripts write SDK, Expo, React Native, EAS login, and build state into this file.
- Android build-ready state and iOS build-ready state are tracked separately. APK and Google Play packages share `android_build_ready`.
- After the first EAS Build, and after later automated EAS Builds, build artifacts are downloaded by default to `user-assets/builds/yyyy-MM-dd-HH-mm-ss/`.
