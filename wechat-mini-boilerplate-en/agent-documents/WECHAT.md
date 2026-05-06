# WECHAT.md

## Purpose

This is the WeChat entry gate for the repository.

It owns only:

- `/wechat` root boundary
- initialization trigger
- file-based project type detection
- handoff to `WECHAT-INIT.md`
- handoff to exactly one type document
- high-level WeChat skill routing after initialization passes

It does not own Mini Game runtime architecture, Pixi implementation details, animation details, particle details, deployment credentials, or local tool internals.

## Root Boundary

The real WeChat project root is:

```text
/wechat
```

Deployment documents live under:

```text
/agent-documents/Deploy
```

Rules:

- do not guess another WeChat root
- do not create another `agent-documents` folder
- do not create `/wechat/agent-documents`
- do not put agent notes, README files, process documents, summaries, or workflow docs inside `/wechat`
- do not invent AppID, AppSecret, private-key paths, release ownership, or project type

## Hard Stop Rule

If a required gate fails:

1. stop work
2. report the exact missing or conflicting item
3. report `BLOCKED`
4. continue only after the blocker is resolved

No silent fallback.
No partial development.
No bypass.

## Initialization Trigger

Run this gate when the user asks for:

- `wechat init`
- `初始化`
- `初始化小程序`
- `初始化小游戏`
- `full-init`
- project setup
- build-ready setup
- preview setup
- upload setup
- any feature work under `/wechat`

The startup route is:

```text
PROJECT.md
  -> WECHAT.md
  -> WECHAT-INIT.md
  -> detect project type
  -> MINIAPP.md or MINIGAME.md
```

Read `agent-documents/WECHAT-INIT.md` before initialization, repair work, feature work, preview work, or upload work under `/wechat`.

## Project Type Detection

Detection is file-based.

Do not guess the project type from folder names, user wording, dependencies, or existing code style.

Rules:

- if both `/wechat/game.json` and `/wechat/app.json` exist, stop and report `BLOCKED`: project-type conflict
- if `/wechat/game.json` exists, treat the project as **WeChat Mini Game**
- if `/wechat/app.json` exists, treat the project as **WeChat Mini Program**
- if neither exists, stop and report `BLOCKED`: missing WeChat DevTools project shell

Required companion file:

```text
/wechat/project.config.json
```

If `project.config.json` is missing, stop and report `BLOCKED`.

## Type Document Handoff

After detection, read exactly one type document:

- Mini Program: `agent-documents/MINIAPP.md`
- Mini Game: `agent-documents/MINIGAME.md`

Do not mix Mini Program and Mini Game rules.

Mini Program work must not use Mini Game runtime rules.
Mini Game work must not introduce Mini Program page architecture.

## Initialization Handoff

`WECHAT-INIT.md` owns:

- initialization order
- required initialization checks
- `PASS` output
- `BLOCKED` output
- common deployment-document checks
- Mini Program vs Mini Game initialization routing

Feature work may continue only after the initialization gate reports `PASS`.

## WeChat Skill Routing Gate

For WeChat development work after initialization passes, inspect local WeChat skills:

```text
.agents/skills/Wechat/
```

Before choosing an implementation path, proposing a technical solution, editing files, or starting feature work:

1. inspect every `SKILL.md` under `.agents/skills/Wechat/`
2. read only the YAML frontmatter `name` and `description` first
3. choose the skill that matches the user's top-level visible intent
4. follow the selected skill
5. proceed without a WeChat skill only if no skill matches

Routing rules:

- choose by product intent, not by low-level implementation detail
- prefer narrower intent matches over broad helpers
- do not require the human to name a skill
- do not route Mini Program work into Mini Game-only skills
- if no skill matches, say so before ordinary coding

Mini Game Pixi routing rule:

- if a Mini Game request may involve Pixi, visual effects, 视觉, 视觉效果, sprites, 精灵, scenes, 场景, 场景切换, canvas rendering, canvas 渲染, UI, HUD, buttons, 按钮, text effects, 文字, 文本, 文字动效, animation, 动画, frame animation, 逐帧动画, 序列帧, spritesheets, particles, 粒子, 粒子特效, smoke, 烟雾, fire, flame, 火焰, splash, 水花, 溅水, sparks, 火花, trails, 拖尾, snow, 雪, rain, 雨, dust, 灰尘, debris, 碎屑, glow motes, 光点, or any similar visible Pixi rendering request, load `skill-wechat-minigame-pixi` first
- let `skill-wechat-minigame-pixi` choose `skill-wechat-minigame-pixi-animation` or `skill-wechat-minigame-pixi-particles`
- do not choose a Pixi child skill as the first WeChat routing result unless the user explicitly names that child skill or the child skill has already been invoked by the skill system
- if a Pixi child skill is directly invoked, its first step must still verify the `skill-wechat-minigame-pixi` baseline

Required reply audit:

- report that the WeChat skill routing gate was completed
- report which WeChat skills were scanned
- report which skill was chosen, or that no skill matched
- report the reason for the choice

Once a WeChat skill is selected, the selected skill owns the concrete workflow.

## Final Gate

Continue only when:

- `WECHAT-INIT.md` reports `PASS`
- exactly one type document has been read
- skill routing has been completed for feature work

Otherwise report `BLOCKED` and stop.
