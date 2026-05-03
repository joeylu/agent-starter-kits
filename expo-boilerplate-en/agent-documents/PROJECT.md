# PROJECT.md

## Project Name
expo default

## Project Type
This is an Expo-based React Native local development environment template.

## Project Goal
This project provides a copyable, reusable Expo React Native development environment designed for LLM agent collaboration.

The final form is not a concrete business app. It is a root-directory template: after copying this entire directory, it can become the starting point for a new React Native project, with the agent guiding Owner into actual development.

## Current Boundary
- Do not build specific React Native product features at this stage.
- At this stage, prioritize the local development software, configuration, tool index, document rules, and agent workflow.
- Any environment change, tool install, or dependency install must be explained first, including purpose, impact, and risk, then approved by Owner.
- Reuse downloaded or registered local tools first. The tool index is `agent-tools/TOOLS.md`.

## Expo Working Directory Rules
`expo/` is the real project root for the Expo React Native app.

React Native source code, Expo configuration, dependency installation, run commands, and development verification should all happen inside `expo/` by default.

The repository root is only the LLM agent environment-template layer and documentation-governance layer.

After reading this file, every agent must also read `agent-documents/EXPO.md` and use the Expo / EAS state recorded there as execution input.

When maintaining this repository as a template, do not initialize an Expo project.

When Owner explicitly treats a copied repository as a real Expo project, and `expo_initialized` in `agent-documents/EXPO.md` is not `true`, remind Owner to run `Run Command init expo` first, until initialization is complete.

## Official Expo Skills
Official Expo agent skills are installed under `.agents/skills/expo/`.

Source information is recorded in `.agents/skills/expo/SOURCE.md`.

For Expo / React Native development tasks, the agent must read the relevant local official skills before implementing or advising.

Common entry points:
- UI, navigation, Expo Router, animation, components: `.agents/skills/expo/plugins/expo/skills/building-native-ui/SKILL.md`
- Network requests, API calls, caching, offline behavior: `.agents/skills/expo/plugins/expo/skills/native-data-fetching/SKILL.md`
- Expo API Routes: `.agents/skills/expo/plugins/expo/skills/expo-api-routes/SKILL.md`
- Tailwind / NativeWind: `.agents/skills/expo/plugins/expo/skills/expo-tailwind-setup/SKILL.md`
- DOM components: `.agents/skills/expo/plugins/expo/skills/use-dom/SKILL.md`
- EAS Build, App Store, Google Play, deployment: `.agents/skills/expo/plugins/expo/skills/expo-deployment/SKILL.md`
- EAS workflows / CI/CD: `.agents/skills/expo/plugins/expo/skills/expo-cicd-workflows/SKILL.md`
- Expo SDK upgrades: `.agents/skills/expo/plugins/expo/skills/upgrading-expo/SKILL.md`
- Expo Dev Client: `.agents/skills/expo/plugins/expo/skills/expo-dev-client/SKILL.md`
- EAS Update health status: `.agents/skills/expo/plugins/expo/skills/eas-update-insights/SKILL.md`

Native-extension skills are used only when Owner explicitly asks for native-extension work:
- `.agents/skills/expo/plugins/expo/skills/expo-module/SKILL.md`
- `.agents/skills/expo/plugins/expo/skills/expo-ui-swift-ui/SKILL.md`
- `.agents/skills/expo/plugins/expo/skills/expo-ui-jetpack-compose/SKILL.md`

Reading native-extension skills must not switch this project by default to Android Studio, Android SDK, Xcode, or any local native build chain.

## What This Template Builds
- A basic Expo / React Native development environment.
- Node.js, package-manager, Expo CLI, EAS CLI, and cloud-build configuration guidance.
- Agent-readable project documents, development rules, tool indexes, and change records.
- Initialization instructions and development guidance for a copied new project.

## Non-Goals
- Do not bind this template to a specific app topic, page set, business model, or backend service.
- Do not introduce UI frameworks, state-management libraries, databases, or cloud services without a clear purpose.
- Do not create environment results that look complete but cannot be verified.

## Execution Principles
- Confirm local tools first, then decide whether anything needs installation.
- Establish a verifiable minimal Expo development path before adding supporting tools.
- Prefer Expo / EAS cloud builds for Android and iOS packages by default.
- This project always uses Expo Cloud Build as the build path. Do not include Android Studio, Android SDK, Xcode, or any local native build chain.
- `agent-scripts/SCRIPTS.md` is the deterministic command-layer entry. When the user enters `Run Command`, match the command through that file.
- EAS build state is controlled by `agent-documents/EXPO.md`; automated Android builds depend on `android_build_ready`, and automated iOS builds depend on `ios_build_ready`.
- `Run Command build expo` must first make Owner choose the package type: standard APK install package, Google Play package, or iOS package.
- `Run Command init build` must also first make Owner choose the package type: standard APK install package, Google Play package, or iOS package.
- After the first EAS Build, and after later automated EAS Builds, build artifacts are downloaded by default to `user-assets/builds/yyyy-MM-dd-HH-mm-ss/`.
- The build flow is fail-fast: if login, configuration, Apple account, or EAS credentials are missing, stop and report to Owner. Do not auto-repair.
- Keep all documents and configuration files in UTF-8.
- After every code, script, or configuration change, write a same-day change note under `agent-documents/dev-notes`.

## Current State
`PROJECT.md` has been initialized.

`expo/` is the real project root for future Expo React Native work.

This repository is a copyable template. It is not bound to any concrete Expo project, EAS account, Expo projectId, Apple account, build credentials, or user identity.

This template repository does not run `Run Command init expo`.

After copying this repository into a target project, run:
- `Run Command init expo`

If `expo/` is empty, that command creates a new Expo project.

If `expo/` is already an existing Expo project, that command adopts it and syncs `agent-documents/EXPO.md` without overwriting source code.

If `expo/` is non-empty but not an Expo project, that command must fail fast.

After Expo initialization is complete, run these as needed:
- `Run Command start expo`
- `Run Command init build`
- `Run Command build expo`
