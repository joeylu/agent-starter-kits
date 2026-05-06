# TOOLS_WECHAT.md

## Scope

- This branch covers WeChat Mini Program and Mini Game tooling already bundled in this repository.
- When a task mentions `wechat`, `微信`, `小程序`, `小游戏`, `build`, `preview`, `upload`, `debug`, `assets`, or runtime adaptation, check this file first.

## Boundary

- This document only registers local tools that already exist in the repository.
- This document does not define AppID, AppSecret, private keys, upload versions, release workflow, or account permissions.
- Project rules still come from `agent-documents/PROJECT.md`, `agent-documents/WECHAT.md`, `agent-documents/WECHAT-INIT.md`, `agent-documents/MINIAPP.md`, `agent-documents/MINIGAME.md`, `.agents/skills/Wechat/`, and `agent-documents/Deploy/`.

## Selection Rules

- Reuse tools registered here before proposing any new install.
- If a required WeChat tool is not registered here, stop and ask the Owner before installing anything else.
- Do not use a tool whose local implementation contradicts `WECHAT-INIT.md`.

## Tool List

## minigame init

### Tool Type

WeChat Mini Game Pixi4 initialization and baseline sync tool

### Install Status

Built in

### Local Paths

- Tool directory: `agent-tools/wechat/minigame-init`
- Baseline manifest: `agent-tools/wechat/minigame-init/versions.json`
- Official baseline asset root: `agent-tools/wechat/minigame-init/assets/pixi4-baseline`
- Initializer core: `agent-tools/wechat/minigame-init/lib/init-minigame-core.js`
- Preview gate core: `agent-tools/wechat/minigame-init/lib/preview-core.js`
- Upload gate core: `agent-tools/wechat/minigame-init/lib/upload-core.js`
- Initializer entry: `scripts/init-wechat-minigame.js`

### Use Cases

Use this tool when starting or re-syncing a WeChat Mini Game project whose real project root is `/wechat`.

It keeps the official-demo Pixi4 local-file baseline consistent:

- `wechat/game.js`
- `wechat/libs/weapp-adapter.js`
- `wechat/libs/pixi.js`
- `wechat/src/index.js`
- `wechat/src/config.js`
- `wechat/src/scenes/`
- `wechat/src/base/`
- `wechat/src/common/`
- `wechat/images/`
- `wechat/user-assets/` compatibility/staging directory only; Pixi runtime images must use `wechat/images/`
- `wechat/scripts/preview.js`
- `wechat/scripts/upload.js`

It also removes old Pixi6 generated runtime artifacts when they exist:

- `wechat/miniprogram_npm/`
- `wechat/js/vendor/pixi-runtime.js`
- `wechat/node_modules/pixi.js`
- `wechat/node_modules/@pixi/`
- `wechat/package-lock.json` only when it contains old Pixi6 markers
- `wechat/scripts/build-npm.js`

### Non-Goals

This tool does not decide AppID, AppSecret, private key ownership, release ownership, review workflow, animation implementation, or particle implementation.
It may create an empty `wechat/user-assets/` compatibility directory, but Pixi runtime image assets must be written under `wechat/images/`. It does not prepare particle or animation runtime assets during initialization.

Those belong in:

- `agent-documents/Deploy/`
- `.agents/skills/Wechat/skill-wechat-minigame-pixi/`
- selected Pixi child skills

### Standard Usage

Default full-init:

```bash
node scripts/init-wechat-minigame.js --project-root wechat
```

Compatibility flags accepted as no-op:

```bash
node scripts/init-wechat-minigame.js --project-root wechat --sync-only
node scripts/init-wechat-minigame.js --project-root wechat --skip-build
node scripts/init-wechat-minigame.js --project-root wechat --skip-install
```

The Pixi4 initializer does not run dependency installation or npm build.

### Required Local Baseline

The following files must exist before this initializer can sync `/wechat`:

```text
agent-tools/wechat/minigame-init/assets/pixi4-baseline/libs/weapp-adapter.js
agent-tools/wechat/minigame-init/assets/pixi4-baseline/libs/pixi.js
agent-tools/wechat/minigame-init/assets/pixi4-baseline/game.js
agent-tools/wechat/minigame-init/assets/pixi4-baseline/src/index.js
agent-tools/wechat/minigame-init/assets/pixi4-baseline/src/config.js
```

Rules:

- `libs/pixi.js` must be from the official demo baseline and contain Pixi version marker `4.8.2`.
- The initializer must not download these files.
- If any local baseline file is missing, the initializer must report `BLOCKED`.
- If future Pixi baseline changes, update the local baseline assets, `versions.json`, documents, and skills together.

### Rules

- The Mini Game project root must stay `/wechat`.
- This initializer is Mini Game-only. Do not use it for Mini Program shells.
- It expects an existing WeChat DevTools Mini Game shell, including `/wechat/game.json` and `/wechat/project.config.json`.
- If `/wechat` has been cleared, recreate the Mini Game shell in WeChat DevTools first.
- Run this tool for initialization or explicit Pixi4 baseline repair. Do not re-sync an already valid baseline during ordinary feature work.
- Do not install npm Pixi as the runtime baseline.
- Do not install `@pixi/unsafe-eval`.
- Do not generate `wechat/js/vendor/pixi-runtime.js`.
- Do not require `wechat/miniprogram_npm` for initialization PASS.
- Do not copy lockstep, room, battle, invite, login, or ad business logic from the official demo.

### Verification

Syntax checks:

```bash
node --check scripts/init-wechat-minigame.js
node --check agent-tools/wechat/minigame-init/lib/init-minigame-core.js
node --check agent-tools/wechat/particle-assets/lib/copy-particle-category-core.js
node --check scripts/copy-wechat-particle-category.js
node --check agent-tools/wechat/minigame-init/lib/preview-core.js
node --check agent-tools/wechat/minigame-init/lib/upload-core.js
```

Expected blocker when local official baseline assets are absent:

```bash
node scripts/init-wechat-minigame.js --project-root wechat
```

Expected result:

```text
BLOCKED Missing local official Pixi4 baseline assets
```

### Maintenance Notes

- Keep the local baseline asset root as the only source for Pixi runtime files.
- Do not replace checked-in Pixi4 local files with npm Pixi.
- Do not add a compile layer unless the Owner explicitly approves it.

## particle category copy

### Tool Type

WeChat Mini Game particle runtime asset materialization tool

### Install Status

Built in

### Local Paths

- Source particle library: `user-assets/particle-library`
- Copy core: `agent-tools/wechat/particle-assets/lib/copy-particle-category-core.js`
- Copy entry: `scripts/copy-wechat-particle-category.js`

### Use Cases

Use this only after the user selects route A in `skill-wechat-minigame-pixi-particles`.

It materializes exactly one selected particle category from:

```text
user-assets/particle-library/{category}/
```

to the Pixi runtime image path:

```text
wechat/images/particle-library/{category}/
```

It also creates a runtime helper:

```text
wechat/src/assets/particles/{category}.js
```

The helper uses `images/...` texture paths.

### Standard Usage

```bash
node scripts/copy-wechat-particle-category.js --project-root wechat --category smoke
```

### Canonical Particle Asset Rule

For new Pixi particle work, follow `skill-wechat-minigame-pixi-particles`:

```text
source material: user-assets/particle-library/{category}/
runtime PNGs: wechat/images/particle-library/{category}/
runtime paths: images/particle-library/{category}/{fileName}.png
optional runtime data helper: wechat/src/assets/particles/{category}.js
```

Do not copy the entire particle library into `/wechat`.

## sharp spritesheet cropper

### Tool Type

WeChat asset preprocessing tool

### Install Status

Installed

### Local Paths

- Tool directory: `agent-tools/wechat/spritesheet-cropper`
- CLI script: `agent-tools/wechat/spritesheet-cropper/scripts/spritesheet-cropper.js`
- Validation script: `agent-tools/wechat/spritesheet-cropper/scripts/validate-animation-assets.js`
- Dependency manifest: `agent-tools/wechat/spritesheet-cropper/package.json`

### Use Cases

Use this tool for WeChat Mini Game image preprocessing when a selected skill requires it:

- read PNG dimensions
- crop rectangles
- trim edges
- validate grid alignment
- output cropped PNGs

Pixi4 animation default runtime image output is:

```text
wechat/images/animations/{animationName}/frames/*.png
```

Optional runtime data helpers belong under:

```text
wechat/src/assets/animations/{animationName}.js
```

Runtime texture paths must use `images/...` and resolve to existing `wechat/{runtimePath}` files. Do not output Pixi6 atlas/data-module runtime packages.

### Output Boundary

The selected Pixi child skill owns the exact output contract.

Do not output generated runtime assets to:

- `wechat/js`
- random flat folders
- agent document folders

### Validation

```bash
cd agent-tools/wechat/spritesheet-cropper
npm run check
```

## Default Decisions

- For WeChat initialization, inspect `agent-documents/WECHAT.md`, `agent-documents/WECHAT-INIT.md`, and this file first.
- For WeChat build/preview/upload, inspect `/wechat/package.json`, `agent-documents/WECHAT.md`, and `agent-documents/Deploy/` first.
- For WeChat Mini Program development, read `agent-documents/MINIAPP.md`.
- For WeChat Mini Game development, read `agent-documents/MINIGAME.md`.
- For Pixi work, route through `skill-wechat-minigame-pixi` first.
- For new Mini Game shell setup and Pixi4 baseline sync, use `minigame init`.

## No Duplicate Installs

- If a tool in this file can handle the task, do not install a duplicate.
- If a required tool is missing, unregistered, broken, or undocumented here, stop and ask the Owner before installing anything new.
