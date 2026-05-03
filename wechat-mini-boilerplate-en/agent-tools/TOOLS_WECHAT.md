# TOOLS_WECHAT.md

## Scope

- This branch covers WeChat Mini Program and Mini Game tooling already bundled in this repository.
- When a task mentions `wechat`, `WeChat`, `Mini Program`, `Mini Game`, `build`, `preview`, `upload`, `debug`, `assets`, or runtime adaptation, check this file first.

## Boundary

- This document only registers local tools that already exist in the repository.
- This document does not define AppID, AppSecret, private keys, upload versions, release workflow, or account permissions.
- Project rules still come from `agent-documents/PROJECT.md`, `agent-documents/WECHAT.md`, `agent-documents/MINIAPP.md`, `agent-documents/MINIGAME.md`, and `agent-documents/Deploy/`.

## Selection Rules

- Reuse tools registered here before proposing any new install.
- If a required WeChat tool is not registered here, stop and ask the Owner before installing anything else.

## Tool List

## minigame init

### Tool Type

WeChat Mini Game initialization and shared build baseline tool

### Install Status

Built in

### Local Paths

- Tool directory: `agent-tools/wechat/minigame-init`
- Shared version source: `agent-tools/wechat/minigame-init/versions.json`
- Shared build core: `agent-tools/wechat/minigame-init/lib/build-npm-core.js`
- Initializer entry: `scripts/init-wechat-minigame.js`

### Use Cases

Use this tool when starting or re-syncing a WeChat Mini Game project whose real project root is `/wechat`.

It keeps these project-local entry files consistent across projects:

- `wechat/package.json`
- `wechat/project.config.json`
- `wechat/.gitignore`
- `wechat/scripts/build-npm.js`
- `wechat/scripts/preview.js`
- `wechat/scripts/upload.js`

### Non-Goals

This tool does not decide AppID, AppSecret, private key ownership, release ownership, or review workflow.
Those belong in `agent-documents/Deploy/`.

### Standard Usage

Default full-init:

```bash
node scripts/init-wechat-minigame.js --project-root wechat
```

Shell sync only:

```bash
node scripts/init-wechat-minigame.js --project-root wechat --sync-only
```

Install dependencies but skip build:

```bash
node scripts/init-wechat-minigame.js --project-root wechat --skip-build
```

### Rules

- The Mini Game project root must stay `/wechat`.
- This initializer is Mini Game-only. Do not use it for Mini Program shells.
- The PixiJS Mini Game wrapper skills are Mini Game-only as well and assume a Mini Game shell, not a Mini Program shell.
- It expects an existing WeChat DevTools Mini Game shell, including `/wechat/game.json` and `/wechat/project.config.json`.
- If `/wechat` has been cleared, recreate the Mini Game shell in WeChat DevTools first, then run full-init.
- `/wechat/scripts/*.js` are thin project-local entry points; shared logic lives under `agent-tools/wechat/minigame-init/lib/`.
- Default full-init runs `npm install` in `/wechat`, installs the pinned Pixi/WeChat toolchain, and then runs `build:npm`.
- The pinned Mini Game baseline currently includes `pixi.js`, `@pixi/unsafe-eval`, `miniprogram-ci`, `minigame-api-typings`, and the `less` compatibility override from `versions.json`.
- Full-init depends on `agent-documents/Deploy/credential.local.json` being present and valid, because the current official `packNpm` flow still uses `miniprogram-ci`.
- The supported DevTools npm mode for this workspace is `project.config.json -> setting.packNpmManually=false` and `setting.packNpmRelationList=[]`.
- `build:npm` must generate `wechat/js/vendor/pixi-runtime.js`; runtime code should import that generated local adapter rather than a bare runtime import from `pixi.js`.
- `--skip-build` and `--sync-only` are only for pre-credential shell setup and do not count as initialization PASS.

### Verification

```bash
node --check scripts/init-wechat-minigame.js
node scripts/init-wechat-minigame.js --project-root wechat
node scripts/init-wechat-minigame.js --project-root wechat --skip-build
node scripts/init-wechat-minigame.js --project-root wechat --sync-only
```

### Maintenance Notes

- Update `versions.json` first when the validated Pixi baseline changes.
- Then update the shared build/init scripts, smoke checks, and docs together.
- Do not change a single project to `latest` while leaving the shared initializer behind.

## sharp spritesheet cropper

### Tool Type

WeChat asset preprocessing tool

### Install Status

Installed

### Official Install Reference

Sharp documentation:

`https://sharp.pixelplumbing.com/install`

Local install flow:

```bash
cd agent-tools/wechat/spritesheet-cropper
npm install sharp
```

### Local Paths

- Tool directory: `agent-tools/wechat/spritesheet-cropper`
- CLI script: `agent-tools/wechat/spritesheet-cropper/scripts/spritesheet-cropper.js`
- Validation script: `agent-tools/wechat/spritesheet-cropper/scripts/validate-animation-assets.js`
- Dependency manifest: `agent-tools/wechat/spritesheet-cropper/package.json`

### Use Cases

Use this tool for WeChat Mini Game spritesheet preprocessing:

- read PNG dimensions
- crop rectangles
- trim edges
- validate grid alignment
- output cropped PNGs
- generate PixiJS spritesheet JSON
- generate a CommonJS spritesheet data module for direct Mini Game runtime `require`

### Non-Goals

This tool is not for preview, upload, runtime rendering code generation, or manual art editing.

### Standard Usage

```bash
node agent-tools/wechat/spritesheet-cropper/scripts/spritesheet-cropper.js ^
  --input user-assets/images/test.png ^
  --name jelly-cube ^
  --grid 3x3 ^
  --crop 0,0,2046,2046 ^
  --loop true ^
  --description "User-confirmed animation description between 100 and 2000 characters."
```

### Output Contract

Default output is:

```text
wechat/user-assets/animations/{animationName}/{animationName}.png
wechat/user-assets/animations/{animationName}/{animationName}.json
wechat/user-assets/animations/{animationName}/{animationName}-data.js
```

The default output root is resolved from the repository root, not from the caller's current working directory.

For `--name test`, output must be:

```text
wechat/user-assets/animations/test/test.png
wechat/user-assets/animations/test/test.json
wechat/user-assets/animations/test/test-data.js
```

Do not output generated frame-animation atlas packages to `wechat/images`, `wechat/js`, or a flat `wechat/user-assets` directory.
The cropper is expected to fail if `--output-root` resolves outside `wechat/user-assets/animations`.

### Validation

```bash
cd agent-tools/wechat/spritesheet-cropper
npm run check
node scripts/spritesheet-cropper.js --input ../../../user-assets/images/test.png --name jelly-cube-check --grid 3x3 --crop 0,0,2046,2046 --loop true --description "Confirmed test description longer than 100 characters so the cropper can validate PNG loading, crop bounds, grid alignment, and PixiJS spritesheet JSON generation."
```

After generating an animation package, validate the asset contract:

```bash
node agent-tools/wechat/spritesheet-cropper/scripts/validate-animation-assets.js --name jelly-cube
```

This validator fails when generated atlas packages are placed in forbidden locations such as `wechat/images`.

## Default Decisions

- For WeChat build/preview/upload, inspect `/wechat/package.json`, `agent-documents/WECHAT.md`, and `agent-documents/Deploy/` first.
- For WeChat Mini Program development, read `agent-documents/MINIAPP.md`.
- For WeChat Mini Game development, read `agent-documents/MINIGAME.md`.
- For new Mini Game shell setup and Pixi build baseline sync, use `minigame init`.
- For spritesheet crop/trim/grid/Pixi JSON generation, use `sharp spritesheet cropper`.

## No Duplicate Installs

- If a tool in this file can handle the task, do not install a duplicate.
- If a required tool is missing, unregistered, broken, or undocumented here, stop and ask the Owner before installing anything new.
