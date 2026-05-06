---
name: skill-wechat-minigame-pixi-animation
description: Implement Pixi4 frame-animation work inside a WeChat Mini Game using the project-approved official-demo local Pixi baseline. Use for character animation, mascot animation, prop animation, UI icon looping animation, frame animation, 逐帧动画, 序列帧, spritesheets, raw PNG grids, multiple PNG frame sequences, make this sprite animate, 让角色动起来, 给物体做循环动画, or any WeChat Mini Game request whose visible goal is a subject changing frames. Do not use for particles, smoke, fire, splash, sparks, trails, snow, rain, dust, debris, aura, or glow motes.
---

# WeChat Mini Game Pixi Animation

## Parent Baseline First

Before animation work, load or enforce:

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

- multiple PNG frame sequences
- raw PNG grid sheets
- spritesheets used as frame animation source
- character, mascot, prop, object, or UI icon loop animation
- visible subject changing frames

Do not use this for particle effects.

## Pixi4 API

Use Pixi4 animation APIs:

```text
PIXI.extras.AnimatedSprite
PIXI.Texture.from(path)
animation.animationSpeed
animation.play()
animation.stop()
```

Use array-style `AnimatedSprite` construction.

Do not use:

```text
new AnimatedSprite({ textures })
```

Do not use Pixi6 spritesheet or `*-data.js` atlas-module workflow as the default.

## Asset Rules

Default runtime frame image output:

```text
wechat/images/animations/{animationName}/frames/
```

Optional runtime animation asset data helper:

```text
wechat/src/assets/animations/{animationName}.js
```

Runtime texture paths must be relative to `wechat/` and must resolve to real files:

```text
File: wechat/images/animations/{animationName}/frames/frame-0001.png
Code: images/animations/{animationName}/frames/frame-0001.png
```

When using the local spritesheet cropper, convert or consume the generated manifest so `manifest.frames[*].path` contains `images/...` runtime paths, then create textures with `PIXI.Texture.from(path)`.
Do not generate `*-data.js` atlas modules for new Pixi4 animation work.

Runtime code default:

```text
wechat/src/base/{AnimationName}.js
```

If the existing project structure is clearer, use:

```text
wechat/src/entities/
wechat/src/scenes/
```

Keep paths stable and explicit.
Do not guess asset paths at runtime.

## Raw Grid Flow

If the user provides a raw grid PNG, spritesheet, or sequence frames that need packaging:

1. inspect the source image or file names when available
2. ask for or produce a 100-2000 character description of what the animation should show
3. wait for the user's exact `CONFIRM_DESCRIPTION`
4. only then cut frames or generate runtime assets

If the newest user message does not contain `CONFIRM_DESCRIPTION`, do not cut raw grid art.

## Implementation Rules

- keep animation state owned by the scene, entity, or base class that uses it
- preload frame textures before play when practical
- expose `play`, `stop`, and update hooks only when needed
- do not start a second game loop
- update animation through the existing Pixi ticker or owning scene loop
- make the animation visibly obvious on first implementation

## Verification

After implementation, verify:

- parent Pixi4 baseline is still valid
- changed JavaScript files pass syntax check when possible
- every runtime texture path resolves to an existing `wechat/{runtimePath}` file
- no Pixi animation runtime code references repo-root `user-assets/...` paths
- animation code uses `PIXI.extras.AnimatedSprite`
- no Pixi6/npm runtime path was introduced
- no second game loop was introduced

Do not claim success based only on no syntax errors.
