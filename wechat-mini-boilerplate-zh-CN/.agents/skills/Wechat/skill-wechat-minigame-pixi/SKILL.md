---
name: skill-wechat-minigame-pixi
description: Route and govern Pixi work inside a WeChat Mini Game that uses the project-approved official-demo Pixi4 local-file baseline. Use for Pixi, PIXI, visual effects, 视觉, 视觉效果, sprites, 精灵, scenes, 场景, 场景切换, canvas rendering, canvas 渲染, UI, HUD, buttons, 按钮, text effects, 文字, 文本, 文字动效, animation, 动画, frame animation, 逐帧动画, 序列帧, spritesheets, particles, 粒子, 粒子特效, smoke, 烟雾, fire, flame, 火焰, splash, 水花, 溅水, sparks, 火花, trails, 拖尾, snow, 雪, rain, 雨, dust, 灰尘, debris, 碎屑, glow motes, 光点, or any natural-language WeChat Mini Game request that may touch Pixi. This is the parent Pixi skill; route animation work to skill-wechat-minigame-pixi-animation and particle work to skill-wechat-minigame-pixi-particles. Stop for UI, HUD, buttons, text effects, scene work, UI、按钮、文字动效、场景切换, or broad visual work when the matching child skill is not available.
---

# WeChat Mini Game Pixi

## Role

Use this as the parent Pixi skill for WeChat Mini Game work.

It owns:

- Pixi baseline verification
- Pixi startup route verification
- Pixi child-skill routing
- Pixi version and path prohibitions

It does not own concrete animation or particle implementation.

## Required Report

After loading this skill, report:

- Pixi main skill loaded
- Pixi baseline: `wechat/libs/pixi.js`, `PIXI.VERSION = 4.8.2`
- selected child skill, or `none`
- selection reason

## Baseline Gate

Before Pixi implementation, verify all items:

```text
wechat/game.json
wechat/project.config.json
wechat/game.js
wechat/libs/weapp-adapter.js
wechat/libs/pixi.js
wechat/src/index.js
wechat/src/config.js
```

Verify `wechat/libs/pixi.js` contains:

```text
4.8.2
```

Verify startup file contents:

```text
wechat/game.js imports ./libs/weapp-adapter
wechat/game.js imports ./src/index.js
wechat/game.js calls new App()
wechat/src/index.js imports * as PIXI from ../libs/pixi.js
wechat/src/index.js defines App extends PIXI.Application
```

If any item is missing:

```text
BLOCKED
Missing: <exact item>
Why: Pixi work must use the official-demo Pixi4 local-file baseline.
Owner action: run or repair the Mini Game Pixi4 initializer before feature work.
```

Stop after `BLOCKED`.

## Startup Route

The only approved Pixi startup route is:

```text
game.js
  -> import ./libs/weapp-adapter
  -> import ./src/index.js
  -> new App()
  -> App extends PIXI.Application
  -> import * as PIXI from ../libs/pixi.js
```

Keep `game.js` as startup only.
Put scene, entity, effect, and UI logic under `wechat/src/`.
## Runtime Asset Path Contract

Pixi runtime image assets must live under:

```text
wechat/images/
```

Code must reference Pixi runtime image assets with the path relative to `wechat/`:

```text
PIXI.Texture.from('images/path/to/asset.png')
```

Before reporting completion for any Pixi visual work, verify each referenced runtime path exists on disk:

```text
wechat/{runtimePath}
```

Examples:

```text
File: wechat/images/particle-library/water/water-drop.png
Code: images/particle-library/water/water-drop.png

File: wechat/images/animations/test/frames/frame-0001.png
Code: images/animations/test/frames/frame-0001.png
```

The repo-root `user-assets/` directory is source material only. Do not use `user-assets/...` as a Pixi runtime path unless the file actually exists under `wechat/user-assets/...` and the Owner has explicitly approved that exception.

## Forbidden

Do not use:

- Pixi6
- Pixi7
- Pixi8
- npm Pixi runtime imports
- `pixi.js` package as the runtime baseline
- `@pixi/unsafe-eval`
- `wechat/js/vendor/pixi-runtime.js`
- `wechat/miniprogram_npm` as a Pixi PASS condition
- `DOMAdapter`
- `await app.init()`
- `new AnimatedSprite({ textures })`
- browser DOM Pixi tutorials

Do not change the Pixi version or path unless the Owner explicitly changes the project baseline.

## Natural-Language Routing

Choose `skill-wechat-minigame-pixi-animation` for:

- animation
- 动画
- 逐帧
- 序列帧
- frame animation
- spritesheet
- raw PNG grid
- 角色动起来
- 道具循环动画
- UI icon loop animation

Choose `skill-wechat-minigame-pixi-particles` for:

- particles
- 粒子
- 烟雾
- 火焰
- 水花
- 溅水
- 火花
- 拖尾
- 雪
- 雨
- 灰尘
- 碎屑
- 光点
- aura
- glow motes

For UI, HUD, buttons, text effects, scene transition, or broad visual requests not covered by animation or particles:

- UI
- HUD
- buttons
- 按钮
- text effects
- 文字
- 文本
- 文字动效
- scenes
- 场景
- 场景切换
- 视觉
- 视觉效果

```text
BLOCKED
Missing: matching Pixi child skill
Why: P3 first round only defines animation and particles. UI, text effects, and scene skills are not built yet.
Owner action: approve creation of the missing Pixi child skill, or provide a direct implementation exception.
```

Do not freely implement those categories from this parent skill.

## Child Skill Rule

If a child skill is directly selected by frontmatter, the child skill must still verify this parent baseline first.

The child skill must obey:

- `wechat/libs/pixi.js`
- `PIXI.VERSION = 4.8.2`
- official-demo startup route
- all forbidden items above

## Verification

For routing-only requests, verification is:

- skill frontmatter scan completed
- baseline gate checked
- child skill selected or `BLOCKED` reported

For implementation requests, the selected child skill owns final verification.
