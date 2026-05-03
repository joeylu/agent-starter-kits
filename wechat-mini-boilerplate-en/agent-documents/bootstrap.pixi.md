# bootstrap.pixi.md

## Purpose

This document is the Mini Game Pixi6 bootstrap and pre-skill routing guide.

It is read before concrete animation or particle skills are selected.
After a skill is selected, the skill owns the concrete workflow and must not route back here.

## When To Read

Read this file after `WECHAT.md` detects Mini Game when the request involves:

- Pixi6 initialization
- `build:npm` for Pixi runtime
- `pixi.js` or `@pixi/unsafe-eval`
- frame animation
- spritesheets or raw PNG grids
- particle effects
- ambiguous visual effects that might be animation or particles

Do not use this file for Mini Program work.

## Pixi6 Initialization Contract

Pixi6 initialization requires a valid Mini Game DevTools shell first:

- `/wechat/game.json`
- `/wechat/project.config.json`

If those files are missing, stop and return to `WECHAT.md`.
Do not fabricate a DevTools shell.

Before running tools, read:

- `agent-tools/TOOLS.md`
- `agent-tools/TOOLS_WECHAT.md`

For Mini Game full-init, prefer the registered initializer:

```bash
node scripts/init-wechat-minigame.js --project-root wechat
```

Full-init must leave the project build-ready:

- `/wechat/package.json` declares Pixi6 dependencies
- `/wechat/node_modules/pixi.js/package.json` exists
- `/wechat/node_modules/@pixi/unsafe-eval/package.json` exists
- `/wechat/package.json` has `scripts.build:npm`
- `/wechat/scripts/build-npm.js` exists
- `npm run build:npm` succeeds
- `/wechat/miniprogram_npm` exists
- `/wechat/js/vendor/pixi-runtime.js` exists

The version source is:

- `agent-tools/wechat/minigame-init/versions.json`

Do not install `pixi`.
Install `pixi.js`.
Do not replace pinned versions with `latest`.

## Runtime Adapter Contract

Runtime code must import Pixi through:

```text
/wechat/js/vendor/pixi-runtime.js
```

Rules:

- do not use bare runtime imports from `pixi.js`
- do not hand-copy Pixi dist files into `/wechat/js`
- do not mix Pixi adapter paths in the same project
- do not use Pixi 7/8 startup patterns unless the shared baseline is upgraded

If `pixi.js`, `@pixi/unsafe-eval`, `miniprogram-ci`, `less`, or the runtime dependency tree changes, run:

```bash
cd wechat && npm run build:npm
```

Then clear WeChat DevTools compile/npm cache before trusting runtime results.

## Startup Ownership

The Pixi Mini Game startup path must keep ownership explicit:

- `game.js` initializes the Mini Game entry and root canvas before Pixi scene code loads.
- `js/render.js` owns root canvas registration and canvas helpers when the project has that layer.
- `js/main.js` owns Pixi application creation, root-canvas resolution, safe runtime stubs, and scene startup when the project has that layer.

Before creating `new PIXI.Application(...)`, verify:

- the root canvas exists
- the root canvas can return `webgl` or `experimental-webgl`, or the project has an explicitly validated equivalent
- any `PIXI.settings.ADAPTER.createCanvas()` override can return a WebGL-capable canvas for Pixi probing
- adapter code is not locked to a 2D-only canvas shape
- runtime code does not directly assign `clientWidth` or `clientHeight` onto a real host canvas
- runtime code does not overwrite native `document.createElement` or `document.createElementNS` when those methods already exist

If WebGL startup fails, fix the Pixi startup path before animation, particle, or scene logic.

## Local Image And Atlas Contract

Local Pixi art in Mini Game should use the validated Mini Game image path:

- load local images with `wx.createImage()`
- apply an image shim before `BaseTexture.from(image)`
- use sibling `*-data.js` CommonJS atlas modules instead of direct runtime `.json` loading
- assemble atlases with `BaseTexture` plus `new PIXI.Spritesheet(...)`
- do not default to browser Pixi loaders for local atlas packages

The image shim must cover:

- `globalThis.HTMLImageElement`
- `globalThis.Image`
- `GameGlobal.HTMLImageElement` when `GameGlobal` exists
- `GameGlobal.Image` when `GameGlobal` exists
- image `complete`
- image `naturalWidth`
- image `naturalHeight`

## Skill Routing Hints

Use this section only to choose the correct skill.
Do not continue implementing here after a skill is selected.

Choose `skill-wechat-minigame-pixi6-animation` when the visible goal is:

- frame animation
- looping animation
- spritesheet animation
- mascot, character, prop, object, icon, or UI element changing frames
- raw PNG grid packaging for an animation

Choose `skill-wechat-minigame-pixi6-particles` when the visible goal is:

- particles
- smoke
- fire
- splash
- sparks
- trails
- snow
- rain
- dust
- debris
- glow motes
- aura-like emitted effects

If the user provides a raw PNG grid, spritesheet, sequence frames, `3x3`, `{cols}x{rows}`, or asks for a loop from raw art, the chosen skill must run its own raw PNG description and `CONFIRM_DESCRIPTION` flow before runtime wiring.

If the request is ambiguous, decide by visible goal:

- a subject changing frames is animation
- emitted marks around, behind, in front of, or trailing from a subject are particles

If still ambiguous, ask one focused question before editing.

## Stop Conditions

Stop and report `BLOCKED` when:

- Mini Game DevTools shell files are missing
- Pixi dependencies or build output are missing for Pixi runtime work
- `npm run build:npm` fails
- WebGL root-canvas probing fails
- local atlas packages are in forbidden locations
- a raw PNG grid needs description confirmation and the newest user message does not contain `CONFIRM_DESCRIPTION`
