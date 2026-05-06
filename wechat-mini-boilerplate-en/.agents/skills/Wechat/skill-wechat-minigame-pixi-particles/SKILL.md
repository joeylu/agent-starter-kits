---
name: skill-wechat-minigame-pixi-particles
description: Implement Pixi4 particle effects inside a WeChat Mini Game using the project-approved official-demo local Pixi baseline. Use for particles, 粒子, 粒子特效, smoke, 烟雾, fire, flame, 火焰, splash, 水花, 溅水, sparks, 火花, trails, 拖尾, bursts, snow, 雪, rain, 雨, dust, 灰尘, debris, 碎屑, aura, glow motes, 光点, ambient particles, or any visible emitted marks around, behind, in front of, or trailing from a subject. Do not use for character, mascot, prop, or UI frame-animation loops whose visible goal is only a subject changing frames.
---

# WeChat Mini Game Pixi Particles

## Parent Baseline First

Before particle work, load or enforce:

```text
.agents/skills/Wechat/skill-wechat-minigame-pixi/SKILL.md
```

Verify:

```text
wechat/libs/pixi.js
PIXI.VERSION = 4.8.2
game.js -> libs/weapp-adapter -> src/index.js -> App extends PIXI.Application
```

If the parent baseline is missing or not confirmed, stop and report `BLOCKED`.

## Use This For

- particles
- smoke, fire, flame, splash, sparks, trails, bursts
- snow, rain, dust, debris
- aura, glow motes, ambient particles
- visible emitted marks around, behind, in front of, or trailing from a subject

Do not use this for plain frame-animation loops.

## Asset Choice Flow

Before implementation, choose one route and report it:

```text
A: local particle asset library at repo root user-assets/particle-library/
B: temporary slice from the current image for validation
C: user-provided dedicated particle art
```

If the user has not selected A, B, or C, ask which route to use and stop until the user answers.

For route A, inspect `user-assets/particle-library/index.js` first, then the selected category manifest such as `smoke/manifest.js`, `fire/manifest.js`, `water/manifest.js`, or `dust/manifest.js`.
If the user has not selected a category, report the available categories and ask the user to choose one.
After the user chooses a category, materialize only that category from:

```text
user-assets/particle-library/{category}/
```

to the Pixi runtime image path:

```text
wechat/images/particle-library/{category}/
```

Runtime code must reference those files as:

```text
images/particle-library/{category}/{fileName}.png
```

For generated or adapted particle art, write the final PNG files directly into `wechat/images/particle-library/{category}/`. Do not first place them under `wechat/user-assets/`.

The root particle library manifests use CommonJS (`module.exports` / `require`) for Node-side tools. Do not import those root manifests from WeChat runtime code. If runtime code needs a manifest, create an ES module or plain data helper under `wechat/src/assets/particles/{category}.js` whose texture paths are `images/...` runtime paths.

If no suitable asset exists, use simple Pixi graphics or a minimal local texture only for temporary validation, then report the asset limitation.

## Pixi4 API

For many simple particles, use:

```text
PIXI.particles.ParticleContainer
PIXI.Sprite
object pool
```

For fewer complex particles, use:

```text
PIXI.Container
PIXI.Sprite
PIXI.extras.AnimatedSprite
```

Do not use Pixi6 or npm runtime patterns.

## Default Locations

Particle module:

```text
wechat/src/effects/{particleName}.js
```

Route A selected runtime particle image assets:

```text
wechat/images/particle-library/{category}/
```

Optional runtime particle asset data helper:

```text
wechat/src/assets/particles/{category}.js
```

Do not copy the entire root particle library into `wechat` during initialization or by default. Materialize only the selected route A category after the user chooses it.

For route B or C, report the exact source art path before use and write final runtime PNG files under `wechat/images/`. Do not store particle implementation JavaScript under `wechat/user-assets`; implementation code stays under `wechat/src/effects/{particleName}.js`.

## Runtime Rules

- particles must be updated by the existing main loop or Pixi ticker
- do not start a second game loop
- use object pools for high-count particles
- avoid per-frame texture loading
- avoid per-frame path resolution
- expose `start`, `stop`, `update`, and `destroy` only when needed
- first implementation must be clearly visible, not merely error-free

## Verification

After implementation, verify:

- parent Pixi4 baseline is still valid
- changed JavaScript files pass syntax check when possible
- route A selected category has been materialized to `wechat/images/particle-library/{category}/`, and every runtime texture path resolves to an existing `wechat/{runtimePath}` file; or temporary asset limitation is reported
- no Pixi particle runtime code references repo-root `user-assets/...` paths
- high-count effects use `PIXI.particles.ParticleContainer`
- no Pixi6/npm runtime path was introduced
- no second game loop was introduced
- effect is visibly obvious in the target scene or a validation scene

Do not claim success based only on no syntax errors.
