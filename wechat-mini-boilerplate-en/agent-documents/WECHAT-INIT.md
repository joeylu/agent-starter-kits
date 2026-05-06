# WECHAT-INIT.md

## Purpose

This document is the WeChat initialization SOP.

It is written for low-capability agents. Follow it exactly.

It owns:

- project shell checks
- file-based project type detection
- common initialization checks
- Mini Program initialization handoff
- Mini Game initialization handoff
- Mini Game Pixi4 baseline checks
- `PASS` and `BLOCKED` output

It does not own feature implementation, animation logic, particle logic, preview release policy, upload release policy, or web-console submission.

## Entry Rule

Read this file after `WECHAT.md` and before any work under `/wechat`.

Run this gate for:

- initialization
- repair work
- build-ready setup
- preview setup
- upload setup
- any feature work under `/wechat`

Feature work may start only after this gate reports `PASS`.

## Root Rule

The WeChat project root is:

```text
/wechat
```

If `/wechat` is missing:

```text
BLOCKED
Missing: /wechat
Why: the human must create the WeChat DevTools project shell first.
Owner action: create the project shell in WeChat DevTools under /wechat.
```

Do not fabricate a WeChat DevTools shell.

## Project Type Detection

Detect type only from files.

Rules:

- `/wechat/game.json` exists and `/wechat/app.json` does not exist: WeChat Mini Game
- `/wechat/app.json` exists and `/wechat/game.json` does not exist: WeChat Mini Program
- both exist: `BLOCKED`
- neither exists: `BLOCKED`

Conflict output:

```text
BLOCKED
Missing: valid single project type signal
Why: /wechat/game.json and /wechat/app.json cannot both exist.
Owner action: keep only the file that matches the real WeChat project type.
```

Missing shell output:

```text
BLOCKED
Missing: /wechat/game.json or /wechat/app.json
Why: the folder is not a recognizable WeChat DevTools project shell.
Owner action: create a Mini Game or Mini Program shell in WeChat DevTools.
```

Do not guess type from user wording.

## Common Required Checks

Both Mini Program and Mini Game must have:

```text
/wechat/project.config.json
/agent-documents/Deploy/CREDENTIAL.md
/agent-documents/Deploy/DEPLOY.md
```

If any item is missing or unreadable, report `BLOCKED`.

Do not invent credentials.
Do not invent AppID.
Do not invent private-key paths.
Do not expose private-key material.

## Common Cleanliness Check

`/wechat` must not contain agent workflow documentation.

Forbidden examples:

```text
/wechat/README.md
/wechat/agent-documents/
/wechat/AGENTS.md
process notes
summaries
workflow docs
```

If found, report `BLOCKED` unless the Owner explicitly identifies the file as a real runtime asset.

## Tool Check

Before running WeChat tooling, read:

```text
agent-tools/TOOLS.md
agent-tools/TOOLS_WECHAT.md
```

If a registered local tool covers the task, use it.

If the registered Mini Game initializer installs, generates, imports, or requires Pixi6, npm Pixi, `@pixi/unsafe-eval`, `miniprogram_npm`, or `js/vendor/pixi-runtime.js` as the runtime baseline, do not run it for the Pixi4 baseline. Report `BLOCKED`: initializer is not upgraded.

Do not install a replacement tool without Owner approval.

## Mini Program Route

For Mini Program:

1. read `agent-documents/MINIAPP.md`
2. do not read Mini Game rules
3. do not create `game.json`
4. do not introduce Mini Game runtime architecture
5. complete common required checks
6. report `PASS` or `BLOCKED`

Mini Program initialization details belong to `MINIAPP.md`.

## Mini Game Route

For Mini Game:

1. read `agent-documents/MINIGAME.md`
2. do not read Mini Program rules
3. do not create `app.json`
4. use the official Pixi4 local-file baseline
5. complete common required checks
6. for initialization or repair requests, run the registered local initializer:

```bash
node scripts/init-wechat-minigame.js --project-root wechat
```

7. for feature work, do not re-sync an already valid baseline; if baseline checks fail, report `BLOCKED` and tell the Owner to run or repair the initializer
8. complete Mini Game baseline checks
9. report `PASS` or `BLOCKED`

Pixi feature development must go through the Pixi skill selected by the WeChat skill routing gate.

## Mini Game Pixi4 Baseline

Mini Game initialization must use the official demo-style Pixi4 local-file route:

```text
wechat/game.js
wechat/game.json
wechat/project.config.json
wechat/libs/weapp-adapter.js
wechat/libs/pixi.js
wechat/src/index.js
wechat/src/config.js
wechat/src/scenes/
wechat/src/base/
wechat/src/common/
wechat/images/
wechat/user-assets/
```
`wechat/user-assets/` is a compatibility/staging directory only. Pixi runtime image assets must use `wechat/images/` and runtime paths such as `images/...`.

Startup route:

```text
game.js
  -> import ./libs/weapp-adapter
  -> import ./src/index.js
  -> new App()
  -> App extends PIXI.Application
  -> import * as PIXI from ../libs/pixi.js
```

Pixi baseline:

```text
wechat/libs/pixi.js
PIXI.VERSION = 4.8.2
```

Do not replace this with Pixi6, Pixi7, Pixi8, npm Pixi, or browser DOM Pixi tutorials.

## Mini Game Forbidden PASS Items

The following files and packages are not required for Mini Game Pixi initialization PASS:

```text
wechat/miniprogram_npm
wechat/js/vendor/pixi-runtime.js
wechat/node_modules/@pixi/unsafe-eval
```

Do not report `BLOCKED` only because these items are missing.

Do not create them as part of the Pixi4 baseline.

## Mini Game Forbidden Actions

Do not:

- install `pixi.js` as the Pixi runtime baseline
- install `@pixi/unsafe-eval`
- generate `wechat/js/vendor/pixi-runtime.js`
- require `wechat/miniprogram_npm` for Pixi initialization PASS
- import Pixi from npm at runtime
- copy Pixi dist files by hand into random project folders
- introduce lockstep, room, battle, invite, login, or ad business logic from the official demo

Only use the official demo-style startup architecture and local Pixi4 baseline.

## Mini Game PASS Checklist

Report `PASS` only when all are true:

- `/wechat` exists
- exactly one of `/wechat/game.json` or `/wechat/app.json` exists
- Mini Game type is detected from `/wechat/game.json`
- `/wechat/project.config.json` exists
- `/wechat/project.config.json` has `compileType` absent or set to `game`; if present with another value, report `BLOCKED`
- `agent-documents/MINIGAME.md` has been read
- `agent-documents/Deploy/CREDENTIAL.md` is readable
- `agent-documents/Deploy/DEPLOY.md` is readable
- `/wechat/game.js` exists
- `/wechat/libs/weapp-adapter.js` exists
- `/wechat/libs/pixi.js` exists
- `/wechat/libs/pixi.js` contains Pixi version marker `4.8.2`
- `/wechat/src/index.js` exists
- `/wechat/game.js` imports `./libs/weapp-adapter`
- `/wechat/game.js` imports `./src/index.js`
- `/wechat/game.js` calls `new App()`
- `/wechat/src/index.js` imports Pixi from `../libs/pixi.js`
- `/wechat/src/index.js` defines `App extends PIXI.Application`
- `/wechat/src/config.js` exists
- `/wechat/src/scenes/` exists
- `/wechat/src/base/` exists
- `/wechat/src/common/` exists
- `/wechat/images/` exists
- `/wechat/user-assets/` exists as a compatibility/staging directory, not as the Pixi runtime image path
- `/wechat` contains no forbidden agent workflow documentation

If any check fails, report `BLOCKED`.

## Mini Program PASS Checklist

Report `PASS` only when all are true:

- `/wechat` exists
- exactly one of `/wechat/game.json` or `/wechat/app.json` exists
- Mini Program type is detected from `/wechat/app.json`
- `/wechat/project.config.json` exists
- `agent-documents/MINIAPP.md` has been read
- `agent-documents/Deploy/CREDENTIAL.md` is readable
- `agent-documents/Deploy/DEPLOY.md` is readable
- `/wechat` contains no forbidden agent workflow documentation

If any check fails, report `BLOCKED`.

## PASS Output

Use this shape:

```text
PASS
Project type: WeChat Mini Game
Checked: project shell, project.config.json, deploy docs, type document, initialization baseline, /wechat cleanliness.
Next: feature work may start after WeChat skill routing.
```

or:

```text
PASS
Project type: WeChat Mini Program
Checked: project shell, project.config.json, deploy docs, type document, /wechat cleanliness.
Next: feature work may start after WeChat skill routing.
```

## BLOCKED Output

Use this shape:

```text
BLOCKED
Missing: <exact missing or conflicting item>
Why: <why this prevents initialization or feature work>
Owner action: <what the Owner must provide or decide>
```

Stop after reporting `BLOCKED`.

## Initialization Completion Rule

Initialization PASS means the project has a valid shell, type route, required docs, and required baseline files.

It does not mean preview has been opened.
It does not mean upload has been performed.
It does not mean review submission or final release is complete.

Preview and upload must follow:

```text
agent-documents/Deploy/DEPLOY.md
```

Review submission and final release remain human web-console actions.
