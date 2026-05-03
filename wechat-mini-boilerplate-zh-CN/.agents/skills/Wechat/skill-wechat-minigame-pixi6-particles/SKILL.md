---
name: skill-wechat-minigame-pixi6-particles
description: Implement Pixi 6 particle effects inside a WeChat Mini Game from natural-language prompts. Use as the top-level match when the user asks for particles, 粒子, 粒子特效, 加一点particles, 烟雾, 火焰, 着火, 溅水, 水花, 火花, 拖尾, 飘雪, 下雨, 灰尘, 碎屑, 光点, smoke, fire, flame, splash, sparks, trails, bursts, snow, rain, dust, debris, aura, glow motes, or ambient particles. Also match requests like "做一个粒子特效", "加一点烟雾粒子特效", "做火焰粒子", "做溅水粒子", "add particles", "add smoke particles", "add fire particles", and "add splash particles". Do not use for character/mascot/UI frame-animation loops whose visible goal is not a particle effect. Follow the local Pixi 6 runtime path, prefer `ParticleContainer` plus Sprite pooling, and use the raw spritesheet confirmation flow when source art still needs packaging.
---

# WeChat Mini Game Pixi6 Particles

Use this skill as the top-level match for particle-effect intent in a WeChat Mini Game.

Natural-language matches include:

- 做一个粒子特效
- 加一点粒子
- 加一点particles
- 加一点烟雾粒子特效
- 加点烟雾
- 做火焰粒子
- 做溅水粒子
- 做一个爆炸火花
- 给子弹加拖尾
- 做飘雪粒子
- 做一些环境漂浮粒子
- 加一点发光尘埃
- add particles
- add a particle effect
- add smoke particles
- add fire particles
- add splash particles
- add a hit spark effect
- add floating dust around the scene

This skill is Mini Game-only. Do not use it for Mini Program work.

Do not use this as the top-level match when the user's visible goal is:

- 让角色动起来
- 做角色待机循环
- 给图标做逐帧动画
- mascot idle loop
- animate this sprite

## Routing Match Contract

The WeChat skill routing gate reads this skill's YAML `name` and `description` first. Keep the frontmatter description broad enough to catch natural particle requests.

Positive routing signals:

- Chinese: `粒子`, `粒子特效`, `火焰`, `着火`, `燃烧`, `溅水`, `水花`, `烟雾`, `烟雾粒子`, `火花`, `拖尾`, `飘雪`, `下雨`, `灰尘`, `尘埃`, `碎屑`, `光点`, `环境粒子`
- English: `particle`, `particles`, `particle effect`, `fire`, `flame`, `burning`, `splash`, `water splash`, `smoke`, `spark`, `trail`, `burst`, `snow`, `rain`, `dust`, `debris`, `motes`, `aura`, `glow`
- Mixed: `加一点particles`, `做particles`, `smoke粒子`

Negative routing signals:

- `逐帧动画`, `循环动画`, `spritesheet animation`, `idle loop`, `mascot animation`, `animate this sprite`
- If the visible goal is a character, mascot, prop, or UI element changing frames, route to `skill-wechat-minigame-pixi6-animation`.
- If the visible goal is particles emitted around, behind, in front of, or trailing from an object, use this skill even when the target object is animated.

## Workspace-First Rule

The validated Pixi 6 runtime path is:

- dependency pin: `pixi.js` `6.5.10`
- build output: `/wechat/js/vendor/pixi-runtime.js`
- runtime import: local adapter import from `/wechat/js/vendor/pixi-runtime.js`
- local image loading: `wx.createImage()`
- local atlases: sibling `*-data.js` CommonJS modules

Keep particle implementation on that path. Do not switch to generic browser recipes.

## Mandatory Chain

Follow this chain before particle implementation:

```text
AGENTS.md
  -> agent-settings/SOUL.md
  -> agent-settings/IDENTITY.md
  -> agent-documents/PROJECT.md
  -> agent-documents/WECHAT.md
  -> detect /wechat/game.json as Mini Game
  -> agent-documents/MINIGAME.md
  -> agent-tools/TOOLS.md
  -> agent-tools/TOOLS_WECHAT.md
  -> WeChat skill routing gate
  -> this particles skill
  -> Pixi runtime dependency gate
  -> Particle Creation Method Gate
  -> Particle Requirement Template Gate
  -> texture / asset decision
  -> runtime implementation
  -> validation commands
  -> DevTools visual check by Owner when preview automation is gated
  -> update this skill if a new validated rule or failure mode is discovered
  -> write dev-note when files were changed
```

Do not jump directly from a natural-language particle request into `wechat/js/main.js`.

## Particle Creation Method Gate

If the user requests a particle effect but does not clearly specify the particle asset source, stop before writing code and ask the Owner to choose one creation method.

Use this exact shape:

```text
请选择粒子建立方式：

A. 使用本地粒子资产库
从 wechat/user-assets/particle-library 中查找 fire/water/smoke/dust 等 preset。

B. 当前图切片临时验证
从当前已加载图或 atlas 切小块做简化粒子。只适合验证，不保证像真实火焰/水花。

C. 用户提供专属素材
你提供 PNG 或 spritesheet。素材不进入 particle-library，只放入本次粒子目录。
```

Rules:

- If the user already provided a valid local PNG path and said it is a single particle texture, skip this choice gate and continue to the requirement template gate.
- If the user already provided a valid local raw spritesheet/grid path, skip this choice gate and continue to the raw PNG gate.
- If the user explicitly says to use the particle library, use method A.
- If the user explicitly says to use the current image, atlas, or a temporary validation effect, use method B.
- If the user explicitly says they will provide or already provided dedicated art, use method C.
- Do not infer method A when the library has no matching manifest or preset.
- Do not infer method B for semantic effects such as real fire, smoke, or splash unless the user accepts a temporary validation effect.
- After the user chooses A, B, or C, stop again and run `Particle Requirement Template Gate`; do not write code yet.

## Particle Requirement Template Gate

After the Owner confirms the creation method, stop and ask the Owner to fill a compact requirement template.

Use this base template:

```text
请按这个模板补充粒子需求：

粒子名称：
目标对象：
效果类型：
触发方式：持续 / 点击 / 一次性
位置：前景 / 背景 / 顶部 / 底部 / 周围
强度：轻微 / 明显 / 强烈
素材：资产库 / 当前图切片 / 我会提供文件
```

If method C is selected, append:

```text
文件路径：
素材类型：单 PNG / spritesheet
```

If method C plus `spritesheet` is selected, append:

```text
网格：
是否循环：true / false
```

Fail-fast rules:

- If method C is selected and `文件路径` is missing, stop and ask only for the file path.
- If method C plus `spritesheet` is selected and `网格` is missing, stop and ask only for the grid.
- If method C plus `spritesheet` is selected and `是否循环` is missing, stop and ask only for loop `true` or `false`.
- If method C plus raw spritesheet is selected, complete the raw PNG description / `CONFIRM_DESCRIPTION` flow before runtime wiring.
- If method A is selected but no matching library preset exists, stop and report the missing library asset/preset.
- If method B is selected, state in the response that it is a temporary validation effect and not a real semantic fire/smoke/splash asset.

## Particle Library Gate

Use this gate only when method A is selected or the user explicitly asks to use reusable library assets.

Library root:

```text
wechat/user-assets/particle-library/
```

Initialization source:

```text
user-assets/particle-library/
```

Recommended structure:

```text
wechat/user-assets/particle-library/
  index.js
  fire/manifest.js
  water/manifest.js
  smoke/manifest.js
  dust/manifest.js
```

Rules:

- Treat `user-assets/particle-library/` as the default reusable source library.
- The shared Mini Game initializer must copy that source library into `wechat/user-assets/particle-library/` during full-init, `--skip-build`, and `--sync-only`.
- If `wechat/user-assets/particle-library/index.js` is missing but `user-assets/particle-library/index.js` exists, run `node scripts/init-wechat-minigame.js --project-root wechat --sync-only` before reporting the library missing.
- Check `wechat/user-assets/particle-library/index.js` first.
- If the library root or index does not exist, stop and report that the particle library is not initialized.
- If a matching category such as `fire`, `water`, `smoke`, or `dust` is missing, stop and report the missing category.
- If the category exists but no suitable preset exists, list close presets if any and ask the Owner to choose; otherwise stop.
- Do not fabricate library assets, manifests, presets, or PNG paths.
- Do not copy user-provided dedicated assets into `particle-library` unless the Owner explicitly says to add them to the reusable library.

Current baseline library:

```text
wechat/user-assets/particle-library/index.js
wechat/user-assets/particle-library/fire/manifest.js
wechat/user-assets/particle-library/water/manifest.js
wechat/user-assets/particle-library/smoke/manifest.js
wechat/user-assets/particle-library/dust/manifest.js
```

Baseline categories and presets:

- `fire`: `itemBurning`, `emberBurst`
- `water`: `sideSplash`, `drip`
- `smoke`: `softSmoke`, `dissipate`
- `dust`: `groundDust`, `debrisBurst`

Baseline assets are simple raster PNG sprites intended for `ParticleContainer + Sprite pool` effects. They are reusable starting points, not final art-quality fire/water/smoke simulation.

## User Asset Flow

Use this flow only when method C is selected or the user explicitly provides dedicated particle art.

User-provided assets belong inside the specific particle package directory:

```text
wechat/user-assets/particles/{particleName}/
```

Examples:

```text
wechat/user-assets/particles/splash/splash-particles.js
wechat/user-assets/particles/splash/splash.png
wechat/user-assets/particles/splash/splash.json
wechat/user-assets/particles/splash/splash-data.js
```

Rules:

- If `wechat/user-assets/particles/` does not exist, create it.
- If `wechat/user-assets/particles/{particleName}/` does not exist, create it.
- Do not place method C assets under `wechat/user-assets/particle-library/`.
- A single PNG can be loaded directly through `wx.createImage()` and does not need `CONFIRM_DESCRIPTION`.
- A raw spritesheet/grid must go through the raw PNG gate and `CONFIRM_DESCRIPTION`.
- Generated or adapted data files for this one effect stay in the same particle package directory.

## Texture Decision Tree

Choose texture source before writing emitter code:

1. Existing validated local atlas already loaded in runtime: cut small particle textures from its `baseTexture`, or reuse parsed frame textures only when those frames are particle-like.
2. Single local PNG particle image: load through `wx.createImage()`, apply the Mini Game image shim, call `PIXI.BaseTexture.from(image)`, then create `new PIXI.Texture(baseTexture)`.
3. Raw PNG spritesheet/grid: run this skill's raw spritesheet packaging subflow before runtime wiring.
4. No art available and user only asks for a simple visible test: cut small highlight/opaque rectangles from an already-loaded validated image. Do not use `PIXI.Texture.WHITE`.

Never use browser-default Pixi loaders, `PIXI.Texture.WHITE`, DOM canvas-generated textures, remote texture assumptions, or a new runtime dependency as the default answer.

## Particle File Package Contract

Every particle effect must have a dedicated particle package directory under:

```text
wechat/user-assets/particles/{particleName}/
```

The effect runtime module must use this filename:

```text
wechat/user-assets/particles/{particleName}/{particleName}-particles.js
```

For particle name `test`, the required file is:

```text
wechat/user-assets/particles/test/test-particles.js
```

Directory rules:

- If `wechat/user-assets/particles/` does not exist, create it.
- If `wechat/user-assets/particles/{particleName}/` does not exist, create it.
- Do not use `wechat/js/effects/*.js` as the default particle effect location.
- Do not put particle effect modules under `wechat/images`, `wechat/js`, or `wechat/user-assets/animations`.
- `wechat/js/main.js` or scene runtime files may require the module, create the effect, add `displayObject` to the stage, and call `update(deltaTime)` from the main ticker.
- The particle package module must not create `PIXI.Application`, must not create a second ticker, and must not boot itself.
- The particle package module should export a factory function that returns the standard emitter API.

Required import shape from `wechat/js/main.js`:

```js
const createParticleEffect = require('../user-assets/particles/{particleName}/{particleName}-particles');
```

Required existence check after creating a particle effect:

```bash
Test-Path wechat/user-assets/particles/{particleName}/{particleName}-particles.js
```

## Raw PNG Gate

This gate has higher priority than runtime code inspection when the particle source art is a raw PNG spritesheet/grid.

If the user's request includes a raw PNG path plus a grid such as `3x3`, `{cols}x{rows}`, "sequence frames", "spritesheet", "逐帧", "序列帧", or a looping/non-looping particle burst sheet, handle it as raw spritesheet packaging first.

Before the raw PNG packaging subflow completes:

- Do not read, reuse, or modify `wechat/js/main.js`, `wechat/game.js`, `wechat/js/render.js`, or other runtime particle wiring files.
- Do not treat existing runtime particle code as proof that the asset package exists or is valid.
- Do not treat files in `wechat/images` as valid generated particle packages.
- Do not run the cropper until the newest user message contains `CONFIRM_DESCRIPTION`.

Only after Phase 2 creates or verifies a package under `wechat/user-assets/animations/{effectName}/` may runtime wiring work begin.

## Raw Spritesheet Packaging Subflow

If source art still needs spritesheet packaging, call the local tool directly. Do not route through another skill.

Required inputs for the packaging subflow:

- PNG file path
- grid as `{cols}x{rows}`
- explicit loop value: `true` or `false`
- effect name, or use the PNG filename stem
- confirmed description between 100 and 2000 characters

Optional inputs:

- `frame-size` as `{width}x{height}` for non-square frames
- `crop` as `left,top,width,height`
- `trim` threshold

Use this only when packaging is actually missing. If the particle effect only needs a single PNG texture, skip the cropper.

Stop immediately when any of these is true:

- The current agent cannot visually inspect the PNG and the user has not provided a manual description yet.
- The PNG appears to contain more than one animation group.
- The user has not provided the grid.
- The user has not explicitly said whether the effect loops.
- The user has not replied exactly `CONFIRM_DESCRIPTION` after the description is shown.

### Phase 1: Inspect

When the raw spritesheet still needs packaging:

1. Inspect the PNG when image understanding is available.
2. Generate a natural-language description of the effect subject, motion, timing, style, and likely gameplay usage.
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
node agent-tools/wechat/spritesheet-cropper/scripts/spritesheet-cropper.js --input path/to/source.png --grid 4x4 --name spark --loop false --description "100-2000 character confirmed description"
```

## Pixi Runtime Dependency Gate

Run this gate before writing particle runtime code.

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
13. If the local runtime bundle or sample code still looks like Pixi 8 residue such as `DOMAdapter`, `await app.init(...)`, or `addParticle(...)`, rerun `npm run build:npm` and treat the old bundle as stale output.

If any check fails, stop.
If the failure is on the WebGL startup path, report a Pixi startup blocker and do not continue to particle logic first.

## Choose The Correct Particle Path

Use one of these two paths. Do not mix them carelessly.

### Path A: High-count simple particles

Use `PIXI.ParticleContainer` when the effect is mostly many lightweight sprites:

- sparks
- snow
- rain
- dust
- debris bursts
- bullet trails

Rules:

- Share one base texture source per `ParticleContainer`.
- Use `PIXI.Sprite` children.
- Reuse Sprite instances through pooling.
- Update position, rotation, scale, alpha, and tint manually in the main loop.

### Path B: Low-count complex particles

Use `PIXI.Container` plus normal `PIXI.Sprite` or `PIXI.AnimatedSprite` when each particle needs richer behavior:

- frame-animated bursts
- particles with different textures from unrelated base textures
- particles that need filters, masks, or bespoke timing

## WeChat Mini Game Rules

- Keep runtime JS out of asset folders.
- Do not use browser DOM patterns.
- Do not use bare runtime imports from `pixi.js`; use the generated local adapter path.
- Do not default to browser loaders for local Mini Game art.
- Reuse the existing scene and main ticker if the project already has one.
- Do not treat `WebGL unsupported in this browser` as a particle-behavior problem before checking the root canvas path and adapter canvas path.

## Runtime Startup Rule

Before touching particle emitters, sprite pools, or effect timing, verify the current Pixi 6 Mini Game startup ownership model:

The expected Pixi 6 Mini Game startup ownership model is:

- `game.js` initializes the root canvas before requiring `js/main.js`
- `js/render.js` owns root canvas registration
- `js/main.js` owns WebGL resolution, adapter probing, safe global stubs, and `new PIXI.Application(...)`

If the current runtime files diverge from that shape, repair startup first.
Do not start with particle logic and hope startup will work later.

## Particle Workflow

1. Confirm whether the effect uses a single PNG texture, a local atlas package, or a raw spritesheet that still needs packaging.
2. Audit `game.js`, `js/render.js`, and `js/main.js` startup ownership.
3. If the startup shape is missing or drifting, repair startup first and stop on any Pixi startup blocker.
4. If packaging is missing and the source is a raw PNG spritesheet, run the full two-phase packaging subflow in this skill.
5. If the effect only needs one texture, skip packaging and load that texture directly through the validated Mini Game path.
6. Load the image through `wx.createImage()`.
7. Apply the Mini Game image shim before `BaseTexture.from(image)`.
8. Build `PIXI.Texture` or `PIXI.Spritesheet` objects from that local image path.
9. For high-count effects, create one `PIXI.ParticleContainer(...)` and fill it with pooled `PIXI.Sprite` children.
10. For low-count complex effects, use a normal `PIXI.Container` and manage Sprite or AnimatedSprite children directly.
11. Drive particle simulation from the existing main ticker.
12. Expose a reusable emitter-style API instead of loose scene code.
13. Make first-pass visibility deliberately obvious: front layer, high alpha, large enough size/radius, and a startup burst.
14. Treat "no error but no visible particle" as a failed integration, not a success.

## Validated Runtime Integration Flow

Use this flow for a simple particle integration before inventing a new pattern.

1. Complete the mandatory chain: `PROJECT.md`, `WECHAT.md`, `MINIGAME.md`, `TOOLS.md`, `TOOLS_WECHAT.md`, WeChat skill routing, and this skill.
2. If an existing animation atlas is already parsed in `main.js`, reuse its parsed `spritesheet.animations.{name}` textures for particles when the effect can share that base texture.
3. If the effect has no existing parsed texture, load one local PNG with `wx.createImage()`, apply the Mini Game image shim, then build `BaseTexture` / `Texture`.
4. Put effect code in `wechat/user-assets/particles/{particleName}/{particleName}-particles.js`; create missing directories first and do not bury emitter logic in `main.js`.
5. Export a small emitter API: `displayObject`, `emit`, `burst`, `update`, `stop`, `play`, `destroy`.
6. In `main.js`, create the effect after texture parsing succeeds, add `effect.displayObject` to the stage, then update it from the existing `app.ticker`.
7. Use one normalized delta per tick, for example `const deltaTime = app.ticker.deltaMS / 16.667;`, then pass the same delta to animation and particle updates.
8. Expose debug globals only when useful, such as `__PARTICLES_DEBUG__`, and keep them explicit.

### Particle Texture Choice

Do not blindly reuse full animation-frame textures as particles. If each frame is a complete character or prop, tiny particles become miniature copies of that object and may disappear visually against the scene.

Do not use `PIXI.Texture.WHITE` in this WeChat Mini Game path. It can call `BaseTexture.from(canvas)` internally and fail with `Unrecognized source type to auto-detect Resource`.

For an obvious first-pass visual verification effect, prefer small textures cut from an image that has already passed the validated `wx.createImage()` / `BaseTexture.from(image)` path:

```js
function createParticleTextures(baseTexture) {
  return [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(185, 152, 32, 32)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(223, 137, 32, 32))
  ];
}

const particleTextures = createParticleTextures(baseTexture);
const particles = createParticleEffect(PIXI, {
  textures: particleTextures,
  target: animatedSprite,
  poolSize: 140,
  emitRate: 72
});
```

Then tint, scale, and alpha the pooled sprites manually. This keeps the `ParticleContainer` on one already-valid base texture and avoids browser-only canvas resource detection.

Reusing parsed animation atlas textures is valid only when the texture content itself is particle-like, such as spark frames, smoke puffs, dust motes, debris chips, or other small elements from one atlas base texture.

```js
const createParticleEffect = require('../user-assets/particles/{particleName}/{particleName}-particles');

const frames = spritesheet.animations.test;
const animatedSprite = new PIXI.AnimatedSprite(frames, false);
const particles = createParticleEffect(PIXI, {
  textures: frames,
  target: animatedSprite,
  poolSize: 96,
  emitRate: 30
});

app.stage.addChild(animatedSprite);
app.stage.addChild(particles.displayObject);

app.ticker.add(() => {
  const deltaTime = app.ticker.deltaMS / 16.667;

  testAnimation.update(deltaTime);
  particles.update(deltaTime);
});
```

All textures in one `ParticleContainer` must come from the same base texture. Do not put unrelated base textures into one `ParticleContainer`.

### ParticleContainer Pooling Detail

For Pixi 6 high-count particles, pre-create sprites and reuse them.

Use:

```js
const displayObject = new PIXI.ParticleContainer(
  poolSize,
  {
    scale: true,
    position: true,
    rotation: true,
    alpha: true,
    tint: true
  },
  poolSize,
  false
);
```

Important details:

- `scale: true` is required when particle scale changes.
- `alpha: true` or `tint: true` is required when particle alpha/tint changes; Pixi 6 maps both through the tint upload path.
- Do not rely on `sprite.visible = false` as the only inactive state in `ParticleContainer`; the renderer batches children by list length.
- For inactive pooled sprites, set at minimum `sprite.alpha = 0` and `sprite.scale.set(0)`.
- Keep particle metadata in sidecar objects instead of adding unbounded new sprites during runtime.

### Stage Ordering

Add the particle display object before the target sprite when particles should sit behind it:

```js
app.stage.addChild(particles.displayObject);
app.stage.addChild(animatedSprite);
```

Add it after the target sprite when the effect should appear in front.

For first visual validation, place the particle display object in front, use high alpha, and make the initial burst large enough to be visible in a still screenshot. A particle effect that logs no error but cannot be seen is not a successful integration.

## Visual Acceptance

A particle implementation is not complete until the Owner can see the effect in WeChat DevTools or on device.

First-pass acceptance rules:

- The effect must be visible in a still screenshot without needing frame-perfect timing.
- The startup burst should be intentionally obvious.
- If attached to an existing sprite, test front-layer placement first, then move behind only after visibility is proven.
- If using smoke or dust, start with stronger alpha/scale than the final art direction, then tune down.
- If the effect is invisible but no error is logged, inspect layer ordering, texture opacity, particle scale, alpha, spawn radius, and whether the selected texture rectangle is transparent.
- Do not declare success based on successful `npm run build:npm` alone.

### Verification Commands

After runtime particle changes:

```bash
node --check wechat/js/main.js
node --check wechat/user-assets/particles/{particleName}/{particleName}-particles.js
Test-Path wechat/user-assets/particles/{particleName}/{particleName}-particles.js
node agent-tools/wechat/spritesheet-cropper/scripts/validate-animation-assets.js --name {animationName}
cd wechat && node node_modules/eslint/bin/eslint.js js/main.js user-assets/particles/{particleName}/{particleName}-particles.js
cd wechat && npm run build:npm
```

Expected known warning:

- ESLint may print `[ESLINT_LEGACY_ECMAFEATURES]` from the existing `.eslintrc.js`; this is not caused by the particle effect.

When runtime npm dependencies or generated Pixi runtime output changed, clear WeChat DevTools compile/npm cache before trusting the simulator.

### Documentation Alignment

Keep this flow aligned with:

- WeChat Mini Game canvas/image runtime APIs: `wx.createCanvas`, `wx.createImage`, canvas `getContext`
- WeChat Developer Tools npm build behavior: build npm output before runtime uses npm packages
- Pixi 6 `ParticleContainer`: fast sprite batching for many simple particles, with limited advanced display features

## Known Failure Modes

### `PIXI.Texture.WHITE` Fails At Boot

Symptom:

```text
Unrecognized source type to auto-detect Resource
```

Cause:

- `PIXI.Texture.WHITE` can call `BaseTexture.from(canvas)` internally.
- In this WeChat Mini Game adapter path, Pixi cannot auto-detect that generated canvas source.

Fix:

- Do not use `PIXI.Texture.WHITE`.
- Cut `new PIXI.Texture(baseTexture, new PIXI.Rectangle(...))` from an image already loaded through `wx.createImage()`.

### No Error But No Visible Particles

Likely causes:

- Particle layer is behind a large opaque/semi-opaque target sprite.
- Particle texture is a miniaturized full character frame, not a small particle mark.
- Particle scale or alpha is too low.
- Spawn radius is inside the target sprite.
- Texture rectangle is transparent or low contrast.

Fix:

- Put particle layer in front for first validation.
- Use high alpha, larger scale, and a clear startup burst.
- Cut from bright non-transparent pixels or use dedicated particle art.

### ParticleContainer Renders Wrong Or Flickers

Likely causes:

- Mixed base textures in one `ParticleContainer`.
- Dynamic properties are not declared, such as scale/alpha/tint.
- Pool state relies only on `visible=false`.

Fix:

- Use one base texture per `ParticleContainer`.
- Set `scale`, `position`, `rotation`, `alpha`, and `tint` properties based on what changes.
- Inactive sprites must set `alpha=0` and `scale=0`.

## Output Contract

Prefer the existing project style. Otherwise expose this shape:

```js
{
  displayObject,
  emit,
  burst,
  update,
  stop,
  destroy
}
```

`displayObject` should usually be a `PIXI.ParticleContainer` or a `PIXI.Container`.

## Required Pixi 6 Patterns

### Pattern 0: Local texture loading in Mini Game

```js
const PIXI = require('../vendor/pixi-runtime');

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

async function loadParticleTexture(src) {
  const image = await loadMiniGameImage(src);

  applyMiniGameImageShim(image);

  const baseTexture = PIXI.BaseTexture.from(image);
  const texture = new PIXI.Texture(baseTexture);

  return {
    texture,
    destroy() {
      texture.destroy();
      baseTexture.destroy();
    }
  };
}
```

### Pattern A: High-count ParticleContainer

```js
const PIXI = require('../vendor/pixi-runtime');

const container = new PIXI.ParticleContainer(
  200,
  {
    scale: true,
    position: true,
    rotation: true,
    alpha: true,
    tint: true
  },
  200,
  false
);

const spritePool = [];

function createParticleSprite(texture) {
  const sprite = new PIXI.Sprite(texture);

  sprite.anchor.set(0.5);
  sprite.alpha = 0;
  sprite.scale.set(0);
  container.addChild(sprite);
  spritePool.push(sprite);

  return sprite;
}
```

### Pattern B: Main-loop driven update

```js
function updateParticles(deltaTime) {
  for (let index = 0; index < spritePool.length; index += 1) {
    const sprite = spritePool[index];

    if (sprite.alpha <= 0) {
      continue;
    }

    sprite.x += sprite.vx * deltaTime;
    sprite.y += sprite.vy * deltaTime;
    sprite.rotation += sprite.spin * deltaTime;
    sprite.alpha -= sprite.fade * deltaTime;

    if (sprite.alpha <= 0) {
      sprite.alpha = 0;
      sprite.scale.set(0);
    }
  }
}
```

### Pattern C: Complex burst via normal Container

```js
const burstLayer = new PIXI.Container();
const burst = new PIXI.AnimatedSprite(frames, false);

burst.anchor.set(0.5);
burst.loop = false;
burst.animationSpeed = 0.3;
burst.gotoAndPlay(0);
burstLayer.addChild(burst);
```

For startup ownership, root canvas resolution, adapter probing, and safe global stubs, do not invent a second pattern here.
Reuse the validated runtime files under `/wechat`.

## Hard Guards

- Do not route to another skill from this skill.
- Do not skip `Particle Creation Method Gate` when the particle asset source is not explicit.
- Do not continue after method A/B/C is chosen until `Particle Requirement Template Gate` has collected the required fields.
- Do not skip the inspect-and-confirm phase when the input is a raw PNG spritesheet.
- Do not place method C user-provided dedicated assets under `wechat/user-assets/particle-library/`.
- Do not use library assets unless `wechat/user-assets/particle-library/index.js` and the matching manifest/preset exist.
- Do not invent a description when the current environment cannot inspect the image; require the user to provide it.
- Do not instantiate `PIXI.Application` until the root canvas and adapter canvas paths are confirmed WebGL-capable.
- Do not start particle import or emitter work before `game.js`, `js/render.js`, and `js/main.js` match the validated startup ownership model.
- Do not use Pixi 8 particle APIs such as `addParticle`, `particleChildren`, or `dynamicProperties`.
- Do not create default particle effect modules under `wechat/js/effects`; use `wechat/user-assets/particles/{particleName}/{particleName}-particles.js`.
- Do not skip creating `wechat/user-assets/particles/{particleName}/` when the directory does not exist.
- In Pixi 6 `ParticleContainer`, use `addChild(sprite)` with `PIXI.Sprite` children.
- Do not put unrelated base textures into the same `ParticleContainer`.
- Do not use `PIXI.Texture.WHITE` as a default Mini Game particle texture.
- Do not rely on `sprite.visible = false` as the only inactive-pool state in `ParticleContainer`; also drive alpha/scale to zero.
- Do not spawn unbounded new Sprites every frame when pooling is enough.
- Do not create a second ticker if the project already has one main loop.
- Do not default to third-party emitter libraries. Only use them when the user explicitly asks and the repo already validates them.
- Do not treat character loops, mascot idle animation, or UI frame animation as this skill's primary match.
- Do not accept a particle integration that builds successfully but is not visible in WeChat DevTools.
- Do not lock `PIXI.settings.ADAPTER.createCanvas()` to a 2D-only canvas shape when Pixi startup still needs WebGL detection.
- Do not directly assign `clientWidth` or `clientHeight` onto a real Mini Game host canvas.
- Do not overwrite native `document.createElement` or `document.createElementNS` when they already exist.
