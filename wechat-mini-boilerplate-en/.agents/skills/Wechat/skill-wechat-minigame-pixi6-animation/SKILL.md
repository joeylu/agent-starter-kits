---
name: skill-wechat-minigame-pixi6-animation
description: Implement Pixi 6 frame-animation requests inside a WeChat Mini Game from natural-language prompts. Use when the user says things like "让这个角色动起来", "给首页加一个循环动画", "给这个物体做逐帧动画", "make this sprite animate", or "add a frame animation to the scene". Use this for character, creature, prop, mascot, or UI loop animations driven by a local spritesheet. Do not use this as the top-level match for sparks, bursts, trails, snow, smoke, or other particle effects. Follow the local Pixi 6 runtime path, load local art with wx.createImage, use `*-data.js` atlas modules, and if a raw PNG grid sheet still needs packaging, own the full two-phase description-confirmation flow before calling the local spritesheet cropper tool directly.
---

# WeChat Mini Game Pixi6 Animation

Use this skill as the top-level match for frame-animation intent in a WeChat Mini Game.

Natural-language matches include:

- 让这个角色动起来
- 给首页吉祥物加个循环动画
- 给这个物体做逐帧动画
- make this sprite animate
- add a looping animation to the scene

This skill is Mini Game-only. Do not use it for Mini Program work.

Do not use this as the top-level match when the user's visible goal is a particle effect such as:

- 爆炸火花
- 拖尾
- 飘雪
- 烟雾
- 碎屑
- hit spark
- floating dust

## Workspace-First Rule

The validated Pixi 6 path is:

- dependency pin: `pixi.js` `6.5.10`
- build output: `/wechat/js/vendor/pixi-runtime.js`
- runtime import: local adapter import from `/wechat/js/vendor/pixi-runtime.js`
- local atlas data source: sibling `*-data.js`
- local image loading: `wx.createImage()`
- local atlas assembly: `BaseTexture.from(image)` plus `new PIXI.Spritesheet(...)`

Do not let generic browser Pixi guidance override this path.

## Raw PNG Gate

This gate has higher priority than runtime code inspection.

If the user's request includes a raw PNG path plus a grid such as `3x3`, `{cols}x{rows}`, "sequence frames", "spritesheet", "逐帧", or "循环动画", handle it as a raw spritesheet packaging request first.

Before the raw PNG packaging subflow completes:

- Do not read, reuse, or modify `wechat/js/main.js`, `wechat/game.js`, `wechat/js/render.js`, or other runtime animation wiring files.
- Do not treat existing runtime animation code as proof that the asset package exists or is valid.
- Do not treat files in `wechat/images` as valid animation packages.
- Do not run the cropper until the newest user message contains `CONFIRM_DESCRIPTION`.

Only after Phase 2 creates or verifies a package under `wechat/user-assets/animations/{animationName}/` may runtime wiring work begin.

## Raw Spritesheet Packaging Subflow

If the user starts from a raw PNG grid sheet and the runtime asset package does not exist yet, do not hand off to another skill.

This skill owns the full packaging subflow.

This subflow has two hard gates:

- Phase 1 may only inspect and describe the PNG. It must not write files and must not run the cropper.
- Phase 2 may only begin when the newest user message contains the exact phrase `CONFIRM_DESCRIPTION`.

Required inputs for the packaging subflow:

- PNG file path
- grid as `{cols}x{rows}`
- explicit loop value: `true` or `false`
- animation name, or use the PNG filename stem
- confirmed description between 100 and 2000 characters

Optional inputs:

- `frame-size` as `{width}x{height}` for non-square frames
- `crop` as `left,top,width,height`
- `trim` threshold

Stop immediately when any of these is true:

- The current agent cannot visually inspect the PNG and the user has not provided a manual description yet.
- The PNG appears to contain more than one animation group.
- The user has not provided the grid.
- The user has not explicitly said whether the animation loops.
- The user has not replied exactly `CONFIRM_DESCRIPTION` after the description is shown.

If the user says `批准修改`, `可以`, `继续`, `确认`, or any other approval without `CONFIRM_DESCRIPTION`, do not pack. Reply that exact `CONFIRM_DESCRIPTION` is still required.

### Phase 1: Inspect

When the raw spritesheet still needs packaging:

1. Inspect the PNG when image understanding is available.
2. Generate a natural-language description of the animation content, subject, motion, style, and likely gameplay usage.
3. Keep the description between 100 and 2000 characters.
4. If the user is working in Chinese, write the description in Chinese.
5. Show the description to the user.
6. Ask the user to reply exactly `CONFIRM_DESCRIPTION`.
7. Stop immediately.

If the environment cannot inspect the PNG, stop and ask the user to provide the description manually. Do not invent one.

Phase 1 must not run the cropper tool or write files.

Use this response shape in Phase 1:

```text
Description:
{100-2000 character description}

Reply exactly:
CONFIRM_DESCRIPTION
```

If repository identity rules also require write approval, ask for both tokens on the same line:

```text
CONFIRM_DESCRIPTION 批准修改
```

### Phase 2: Pack

Phase 2 may begin only when the newest user message contains the exact phrase `CONFIRM_DESCRIPTION`.

The following replies are not sufficient:

- `可以`
- `继续`
- `好`
- `没问题`
- `确认`

Only after `CONFIRM_DESCRIPTION`, run the registered local tool directly:

```bash
node agent-tools/wechat/spritesheet-cropper/scripts/spritesheet-cropper.js --input path/to/source.png --grid 8x8 --name run --loop true --description "100-2000 character confirmed description"
```

If required cropper inputs are missing, ask only for the missing inputs:

- grid
- loop true or false
- animation name if the filename is not enough
- exact `CONFIRM_DESCRIPTION` reply when description confirmation is required

### Asset Package Contract

Generated Pixi frame-animation packages must use this layout:

```text
wechat/user-assets/animations/{animationName}/{animationName}.png
wechat/user-assets/animations/{animationName}/{animationName}.json
wechat/user-assets/animations/{animationName}/{animationName}-data.js
```

For `user-assets/images/test.png` with `--name test`, the generated package must be:

```text
wechat/user-assets/animations/test/test.png
wechat/user-assets/animations/test/test.json
wechat/user-assets/animations/test/test-data.js
```

Do not put generated atlas packages in `wechat/images`, `wechat/js`, `wechat/user-assets`, or any flat directory without the `{animationName}` subfolder.

## Pixi Runtime Dependency Gate

Run this gate before writing animation runtime code.

Required checks:

1. Read `agent-documents/WECHAT.md` and `agent-documents/MINIGAME.md`.
2. Verify `/wechat/package.json` declares `dependencies.pixi.js` as `6.5.10`.
3. Verify `/wechat/package.json` declares `devDependencies.@pixi/unsafe-eval` as `6.5.10`.
4. Verify `/wechat/node_modules/pixi.js/package.json` exists.
5. Verify `/wechat/node_modules/@pixi/unsafe-eval/package.json` exists.
6. Verify `/wechat/package.json` has `scripts.build:npm`.
7. Verify `/wechat/scripts/build-npm.js` exists.
8. Verify `/wechat/miniprogram_npm` exists from the latest successful npm build.
9. Verify `/wechat/js/vendor/pixi-runtime.js` exists from the latest successful npm build.
10. Before `new PIXI.Application(...)`, verify the Mini Game root canvas exists.
11. Before `new PIXI.Application(...)`, verify the root canvas can return a `webgl` or `experimental-webgl` context, or the project has an explicitly validated equivalent WebGL startup path.
12. If the project overrides `PIXI.settings.ADAPTER.createCanvas()`, verify that code path also returns a WebGL-capable canvas for Pixi renderer probing and is not locked to a 2D-only canvas shape.
13. If the local runtime bundle or sample code still looks like Pixi 8 residue such as `DOMAdapter`, `await app.init(...)`, or options-object `AnimatedSprite` construction, rerun `npm run build:npm` and treat the old bundle as stale output.

If any check fails, stop.
If the failure is on the WebGL startup path, report a Pixi startup blocker and do not continue to animation logic first.

## WeChat Mini Game Rules

- Work under `/wechat` for runtime files.
- Keep runtime JS out of `wechat/user-assets/animations/`; that directory is for assets.
- Do not use browser DOM patterns such as `document.body.appendChild`.
- Do not use bare runtime imports from `pixi.js`; use the generated local adapter path.
- Do not default to `Assets.load(...)`, `Loader.load(...)`, or direct runtime `require('*.json')` for local Mini Game spritesheets.
- Reuse the existing scene, loop, and asset structure if the project already has one.
- If the atlas JSON is trusted but `*-data.js` is missing, the only asset-side adaptation allowed here is generating the sibling CommonJS data module.
- Do not treat `WebGL unsupported in this browser` as an animation-content problem before checking the root canvas path and adapter canvas path.

## Runtime Startup Rule

Before touching animation import, spritesheet assembly, or scene wiring, verify the current Pixi 6 Mini Game startup ownership model:

The expected Pixi 6 Mini Game startup ownership model is:

- `game.js` initializes the root canvas before requiring `js/main.js`
- `js/render.js` owns root canvas registration
- `js/main.js` owns WebGL resolution, adapter probing, safe global stubs, and `new PIXI.Application(...)`

If the current runtime files diverge from that shape, repair startup first.
Do not start with animation code and hope startup will work later.

## Animation Workflow

1. Confirm whether the request is really frame animation, not a particle effect.
2. If the request includes a raw PNG grid sheet, run the Raw PNG Gate and the full two-phase packaging subflow before reading runtime animation files.
3. After `CONFIRM_DESCRIPTION`, run the local spritesheet cropper tool directly.
4. Run `node agent-tools/wechat/spritesheet-cropper/scripts/validate-animation-assets.js --name {animationName}` after packaging.
5. Audit `game.js`, `js/render.js`, and `js/main.js` startup ownership only after the asset package is valid.
6. If the startup shape is missing or drifting, repair startup first and stop on any Pixi startup blocker.
7. Import Pixi through the local runtime adapter path already used by the project.
8. Load atlas data from `*-data.js` with `require(...)`.
9. Load the PNG with `wx.createImage()`.
10. Apply the Mini Game image shim before `BaseTexture.from(image)`: map `HTMLImageElement` and `Image` to the wx image constructor on `globalThis` and `GameGlobal`, and ensure `complete`, `naturalWidth`, and `naturalHeight` exist.
11. Build the atlas with `new PIXI.Spritesheet(baseTexture, atlasData)` and `await spritesheet.parse()`.
12. Build the animation with `new PIXI.AnimatedSprite(frames, false)` when the project already has one primary ticker.
13. Drive `animation.update(deltaTime)` from that primary ticker instead of silently creating a second animation loop.
14. Expose a small reusable API if the surrounding codebase has no existing wrapper pattern.

## Output Contract

Prefer the existing project style. Otherwise expose this shape:

```js
{
  displayObject,
  update,
  play,
  stop,
  gotoAndPlay,
  gotoAndStop,
  destroy
}
```

`displayObject` should usually be the `AnimatedSprite` itself or a `Container` wrapping it.

## Required Pixi 6 Pattern

Use this as the default Pixi 6 Mini Game pattern:

```js
const PIXI = require('../vendor/pixi-runtime');
const atlasData = require('../../user-assets/animations/run/run-data');

async function loadMiniGameImage(src) {
  return new Promise((resolve, reject) => {
    const image = wx.createImage();

    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error || new Error('Image load failed.'));
    image.src = src;
  });
}

function applyMiniGameImageShim(image) {
  if (typeof globalThis.HTMLImageElement === 'undefined') {
    globalThis.HTMLImageElement = image.constructor;
  }

  if (typeof globalThis.Image === 'undefined') {
    globalThis.Image = image.constructor;
  }

  if (typeof GameGlobal !== 'undefined') {
    if (typeof GameGlobal.HTMLImageElement === 'undefined') {
      GameGlobal.HTMLImageElement = image.constructor;
    }

    if (typeof GameGlobal.Image === 'undefined') {
      GameGlobal.Image = image.constructor;
    }
  }

  if (typeof image.complete === 'undefined') {
    image.complete = true;
  }

  if (typeof image.naturalWidth === 'undefined') {
    image.naturalWidth = image.width || 0;
  }

  if (typeof image.naturalHeight === 'undefined') {
    image.naturalHeight = image.height || 0;
  }
}

async function createRunAnimation() {
  const image = await loadMiniGameImage('user-assets/animations/run/run.png');

  applyMiniGameImageShim(image);

  const baseTexture = PIXI.BaseTexture.from(image);
  const spritesheet = new PIXI.Spritesheet(baseTexture, atlasData);

  await spritesheet.parse();

  const frames = spritesheet.animations.run;
  const animation = new PIXI.AnimatedSprite(frames, false);

  animation.loop = true;
  animation.animationSpeed = 0.15;
  animation.play();

  return {
    displayObject: animation,
    update(deltaTime) {
      animation.update(deltaTime);
    },
    play() {
      animation.play();
    },
    stop() {
      animation.stop();
    },
    gotoAndPlay(frameNumber) {
      animation.gotoAndPlay(frameNumber);
    },
    gotoAndStop(frameNumber) {
      animation.gotoAndStop(frameNumber);
    },
    destroy() {
      animation.destroy();
      baseTexture.destroy();
    }
  };
}
```

If the project deliberately uses `PIXI.Ticker.shared` as the only ticker, `new PIXI.AnimatedSprite(frames)` plus `play()` is acceptable. Do not assume that by default.

For startup ownership, root canvas resolution, adapter probing, and safe global stubs, do not invent a second pattern here.
Reuse the validated runtime files under `/wechat`.

## Hard Guards

- Do not route to another skill from this skill.
- Do not skip the inspect-and-confirm phase when the input is a raw PNG spritesheet.
- Do not treat write approval as description confirmation. `批准修改` is not a replacement for `CONFIRM_DESCRIPTION`.
- Do not read `wechat/js/main.js` first when the user supplied a raw PNG grid sheet. Packaging gate comes first.
- Do not invent a description when the current environment cannot inspect the image; require the user to provide it.
- Do not place generated animation packages outside `wechat/user-assets/animations/{animationName}/`.
- Do not place generated atlas PNG, JSON, or `*-data.js` files in `wechat/images`.
- Do not instantiate `PIXI.Application` until the root canvas and adapter canvas paths are confirmed WebGL-capable.
- Do not start animation import work before `game.js`, `js/render.js`, and `js/main.js` match the validated startup ownership model.
- Do not use Pixi 8 patterns such as `DOMAdapter`, `await app.init(...)`, `new AnimatedSprite({ textures })`, or `ParticleContainer.addParticle(...)`.
- Do not directly `require('*.json')` in Mini Game runtime code.
- Do not access `spritesheet.animations[animationName]` before `parse()` resolves.
- Do not create a second ticker if the game already has one primary loop.
- Do not silently downgrade a frame animation request into a single-image pulse or scale tween because assets are incomplete.
- Do not treat sparks, trails, smoke, snow, debris, or burst effects as this skill's primary match.
- Do not lock `PIXI.settings.ADAPTER.createCanvas()` to a 2D-only canvas shape when Pixi startup still needs WebGL detection.
- Do not directly assign `clientWidth` or `clientHeight` onto a real Mini Game host canvas.
- Do not overwrite native `document.createElement` or `document.createElementNS` when they already exist.
- If runtime reports `module '...json.js' is not defined`, `HTMLImageElement is not defined`, or `Current environment does not allow unsafe-eval`, fix the build or Mini Game image path before changing scene logic.
