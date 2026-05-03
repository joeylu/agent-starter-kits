# WECHAT.md

## Purpose

This is the WeChat gate for the repository.

It owns:

- `/wechat` directory and DevTools shell checks
- Mini Program vs Mini Game detection
- initialization order
- WeChat skill routing
- handoff to `MINIAPP.md`, `MINIGAME.md`, `bootstrap.pixi.md`, and deploy docs

It does not own Mini Game runtime architecture, Pixi implementation details, animation implementation, particle implementation, or local tool internals.

## Root Boundary

All WeChat project checks use:

- `/wechat`

Deployment docs use:

- `/agent-documents/Deploy`

Rules:

- do not guess another project root
- do not create another `agent-documents` folder
- do not create `/wechat/agent-documents`
- do not put agent notes, README files, process docs, summaries, or workflow docs inside `/wechat`

## Hard Stop Rule

If a required gate fails:

1. stop feature work
2. report the exact missing item
3. report `BLOCKED`
4. continue only after the blocker is resolved

No silent fallback.
No partial development.
No bypass.

## Initialization Trigger

When the user asks for `wechat init`, `init`, `full-init`, project setup, build-ready setup, preview setup, upload setup, or any feature work under `/wechat`, run this gate first.

If `/wechat` is missing, report `BLOCKED`: the WeChat project root does not exist.

If `/wechat` exists but has no DevTools project signal file, report `BLOCKED`: missing `/wechat/game.json` or `/wechat/app.json`.

The agent must not fabricate a DevTools shell from nothing.

## Step 1: Detect Project Type

Detection is file-based:

- if both `/wechat/game.json` and `/wechat/app.json` exist, stop and report a project-type conflict
- if `/wechat/game.json` exists, treat the project as **WeChat Mini Game**
- if `/wechat/app.json` exists, treat the project as **WeChat Mini Program**
- if neither exists, stop and report `BLOCKED`

Required companion file:

- `/wechat/project.config.json`

If `project.config.json` is missing, stop and report `BLOCKED`.

After detection, read exactly one type document:

- Mini Program: `agent-documents/MINIAPP.md`
- Mini Game: `agent-documents/MINIGAME.md`

Do not mix Mini Program and Mini Game rules.

## Step 2: WeChat Skill Routing Gate

For WeChat development work, the local WeChat skill routing source is:

- `.agents/skills/Wechat/`

This gate is separate from project-type detection.

Before choosing an implementation path, proposing a technical solution, editing files, or starting feature work, the agent must:

1. inspect every `SKILL.md` under `.agents/skills/Wechat/`
2. read only the YAML frontmatter `name` and `description` first
3. if the request involves Mini Game Pixi6, frame animation, particle effects, spritesheets, raw PNG grids, or ambiguous visual effects, read `agent-documents/bootstrap.pixi.md` before final skill selection
4. choose the skill that matches the user's top-level visible intent
5. follow the selected skill
6. proceed without a WeChat skill only if no skill matches

Routing rules:

- choose by product intent, not by low-level implementation detail
- prefer narrower intent matches over broad helpers
- do not require the human to name a skill
- do not route Mini Program work into Mini Game-only skills
- if no skill matches, say so before ordinary coding

Required reply audit:

- report that the WeChat skill routing gate was completed
- report which WeChat skills were scanned
- report which skill was chosen, or that no skill matched
- report the reason for the choice

### Pixi6 Pre-Skill Guide

For Mini Game requests involving Pixi6 setup, frame animation, particle effects, spritesheets, raw PNG grids, or ambiguous visual effects, read:

- `agent-documents/bootstrap.pixi.md`

`bootstrap.pixi.md` helps the agent initialize Pixi6 correctly and hit the correct animation or particle skill.
It is read after WeChat skill frontmatter scanning and before final skill selection.

Once a WeChat skill is selected, the selected skill owns the concrete workflow.

## Step 3: Initialization Checklist

Initialization PASS means build-ready.

It does not automatically open preview or upload automation.

### Required Files

Required for both Mini Program and Mini Game:

- `/wechat/project.config.json`
- `/wechat/package.json`
- `/agent-documents/Deploy/CREDENTIAL.md`
- `/agent-documents/Deploy/DEPLOY.md`

Required for Mini Game:

- `/wechat/scripts/build-npm.js`

Required for preview and upload entries:

- `/wechat/scripts/preview.js`
- `/wechat/scripts/upload.js`

If any required file is missing, initialize or repair it before feature work.

### Tool Reuse

Before running WeChat tooling, read:

- `agent-tools/TOOLS.md`
- `agent-tools/TOOLS_WECHAT.md`

If a registered local tool covers the task, use it.

For Mini Game initialization, prefer the registered shared initializer after confirming the DevTools Mini Game shell exists:

```bash
node scripts/init-wechat-minigame.js --project-root wechat
```

The shared initializer is Mini Game-only.

Reduced modes such as `--skip-build` or `--sync-only` may prepare files but do not count as initialization PASS for Pixi runtime work.

### Required Dependencies

Always required:

- `miniprogram-ci`

Mini Program requires:

- `miniprogram-api-typings`
- `miniprogram-simulate`

Mini Game requires:

- `minigame-api-typings`
- `pixi.js`
- `@pixi/unsafe-eval`

For Mini Game Pixi6 versions, npm build behavior, and runtime adapter requirements, use:

- `agent-documents/bootstrap.pixi.md`
- `agent-tools/wechat/minigame-init/versions.json`
- `agent-tools/TOOLS_WECHAT.md`

Do not install `pixi`.
Use `pixi.js`.
Do not replace pinned versions with `latest`.

### Required Package Scripts

`/wechat/package.json` must provide:

- `preview`
- `upload`

Mini Game must also provide:

- `build:npm`

Canonical Mini Game script shape:

```json
{
  "scripts": {
    "build:npm": "node scripts/build-npm.js",
    "preview": "node scripts/preview.js",
    "upload": "node scripts/upload.js"
  }
}
```

Script presence is required for initialization.
Script presence does not mean preview or upload is already open.

### Mini Game NPM Build

For Mini Game projects using Pixi6 or another runtime npm dependency, initialization does not pass until:

- dependencies are installed
- `npm run build:npm` succeeds
- `/wechat/miniprogram_npm` exists
- `/wechat/js/vendor/pixi-runtime.js` exists

If `parse js file ... failed` appears during npm build, treat it as failure.

After runtime dependency or build-pin changes, rerun `npm run build:npm` and clear WeChat DevTools compile/npm cache before trusting runtime behavior.

### Credential Documentation

`agent-documents/Deploy/CREDENTIAL.md` must be readable and must not contain live secrets.

For full-init and build-ready work, the local-only file must exist:

- `agent-documents/Deploy/credential.local.json`

It must provide at least:

- `appid`
- `privateKeyPath`

The `appid` must match `/wechat/project.config.json`.
The private key path must resolve to an existing local file.

Do not guess credentials.
Do not fabricate paths.
Do not expose private key material.

### Secret Guard

The root `.gitignore` must protect:

```gitignore
agent-documents/Deploy/*.key
agent-documents/Deploy/credential.local.json
```

Mini Game generated runtime artifacts must also be ignored from the relevant project ignore file:

```gitignore
js/vendor/pixi-runtime.js
```

If protection is missing, add it before continuing.

### Deploy SOP

`agent-documents/Deploy/DEPLOY.md` must be readable.

It must contain:

- exact build command, when build applies
- exact preview command or a clear preview gate
- exact upload command or a clear upload gate
- version-number policy or a clear upload gate
- version-description policy or a clear upload gate
- upload target type
- post-upload website
- submission owner
- release owner

Do not invent deployment steps from memory.

### `/wechat` Cleanliness

`/wechat` must not contain agent workflow documentation.

Forbidden examples:

- `README.md`
- process notes
- summaries
- nested `agent-documents`
- agent instruction files

If such files exist, stop and report the violation unless the human explicitly identifies them as real project assets.

## Step 4: Initialization Order

When initialization is requested or required, execute in this order:

1. verify `/wechat` exists
2. detect Mini Program or Mini Game from `app.json` / `game.json`
3. verify `/wechat/project.config.json`
4. read `MINIAPP.md` or `MINIGAME.md`
5. read WeChat tool docs before running tools
6. for Mini Game Pixi6 setup, read `bootstrap.pixi.md`
7. create or repair `/wechat/package.json`
8. install or sync required dependencies
9. create or repair required script files and package scripts
10. verify credential docs and local credential file
11. for Mini Game runtime npm dependencies, run `npm run build:npm`
12. verify build outputs
13. verify secret guards
14. verify deploy SOP
15. verify `/wechat` cleanliness
16. report `PASS` or `BLOCKED`

Only after `PASS` may feature development begin.
