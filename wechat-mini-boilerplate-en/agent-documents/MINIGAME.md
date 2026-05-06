# MINIGAME.md

## Purpose

This is the type-specific rule set for WeChat Mini Game work.

It applies only after `WECHAT.md` detects:

```text
/wechat/game.json
```

If `WECHAT.md` detects a Mini Program, do not use this document.

## Hard Entry Rule

When `WECHAT.md` detects a Mini Game, read this file before Mini Game design, source edits, initialization, refactor, test, preview, upload, or deployment work.

If this file is missing or unreadable, stop and report `BLOCKED`.

## Document Boundary

This file owns Mini Game general architecture and runtime constraints.

It does not own:

- project-type detection; use `WECHAT.md`
- initialization SOP; use `WECHAT-INIT.md`
- Pixi startup, Pixi API, Pixi animation, Pixi particles, Pixi UI, or Pixi scene implementation
- local tool usage details; use `agent-tools/TOOLS_WECHAT.md`
- deploy credentials and release steps; use `agent-documents/Deploy/`

Pixi-related development must enter the Pixi main skill:

```text
.agents/skills/Wechat/skill-wechat-minigame-pixi/
```

If that skill does not exist or cannot be read, report `BLOCKED` instead of freely implementing Pixi behavior.

## Project Boundary

All real Mini Game project files live under:

```text
/wechat
```

All agent documents live under:

```text
/agent-documents
```

Do not create notes, README files, process documents, summaries, agent instructions, or workflow documents inside `/wechat`.

Do not create:

```text
/wechat/agent-documents
```

## Mini Game Identity

A Mini Game is runtime-driven, not page-driven.

Canonical signals:

- `/wechat/game.json`
- `/wechat/game.js`
- canvas or WebGL rendering
- game lifecycle
- asset loading
- input handling
- update and render flow

Do not introduce Mini Program architecture unless the Owner explicitly changes the project type.

Forbidden in Mini Game work:

- `app.json`
- WXML pages
- WXSS page layout
- `Page`
- `Component`
- Mini Program route architecture

## Entry Rules

`game.js` owns startup only.

Rules:

- keep `game.js` small
- initialize the runtime from `game.js`
- do not dump gameplay logic into `game.js`
- do not put scene logic, entity logic, asset manifests, save logic, or large UI logic in `game.js`
- do not create a second entry file unless the existing project already has that pattern

## Recommended Structure

Use the existing structure when it is already clear.

For new or repaired Mini Game structure, prefer:

```text
wechat/src/index.js
wechat/src/config.js
wechat/src/scenes/
wechat/src/base/
wechat/src/common/
wechat/src/systems/
wechat/src/entities/
wechat/src/assets/
wechat/src/storage/
wechat/images/
wechat/audio/
wechat/libs/
```

Ownership:

- `src/index.js` owns game runtime startup after `game.js`
- `src/config.js` owns device, canvas, and runtime configuration
- `src/scenes/` owns scene-level flow
- `src/base/` owns reusable base classes
- `src/common/` owns shared utilities and constants
- `src/systems/` owns input, collision, audio, animation coordination, and other update systems
- `src/entities/` owns gameplay objects
- `src/assets/` owns manifests and loading helpers
- `src/storage/` owns save data and settings
- `images/` owns runtime image assets
- `audio/` owns runtime audio assets
- `libs/` owns checked-in runtime libraries approved by project rules

## Runtime Rules

Mini Game code must use the WeChat Mini Game runtime model.

Rules:

- use `wx.*` APIs for platform capabilities
- do not assume browser DOM APIs
- do not assume HTML elements
- do not assume CSS layout
- do not assume browser routing
- do not assume Mini Program page lifecycles
- do not assume Node.js runtime APIs in client code
- do not add dependencies that require DOM layout, Node runtime APIs, native modules, or unsupported globals

Non-Pixi development must not introduce another engine or framework unless the Owner explicitly approves it or the existing project already uses it.

## Game Loop Rules

There must be one primary update and render loop.

Rules:

- keep loop ownership explicit
- separate logic updates from rendering work
- use delta time for frame-dependent simulation
- do not create multiple uncoordinated `setInterval` loops
- do not create multiple uncoordinated `requestAnimationFrame` loops
- pause or reduce expensive work when the game is hidden
- resume safely when the game returns to foreground

Frame hot paths must avoid unnecessary allocation, repeated asset lookup, repeated path resolution, and repeated object construction.

## Rendering Rules

Rendering must be designed for mobile WeChat runtime constraints.

Rules:

- handle device pixel ratio explicitly
- handle canvas size changes explicitly
- keep draw order deterministic
- preload required visual assets before first use
- provide a blocking state or fallback when required assets fail to load
- do not rely on CSS to position game content

Renderer-specific API rules belong to the selected rendering skill or implementation document, not this file.

## Input Rules

Input must be normalized before gameplay systems consume it.

Rules:

- centralize touch input registration
- translate raw touch data into game-space coordinates in one place
- avoid duplicate listeners for the same scene or system
- remove or disable listeners when a scene is destroyed or inactive
- do not let input handlers directly mutate unrelated game state

When multiple systems need input, route through the owning input system or scene.

## Asset Rules

Assets must be managed as runtime resources.

Rules:

- keep image, audio, font, and data paths stable and explicit
- do not guess paths at runtime
- preload assets required for the current scene
- avoid loading large assets during frame-sensitive gameplay
- keep package size impact visible when adding images, audio, fonts, or large data files
- do not add decorative assets unused by runtime code
- do not store agent workflow documents inside `/wechat`

Generated or user-provided runtime assets must stay under a project-owned asset path such as:

```text
wechat/images/
wechat/audio/
```

For Pixi visual work, runtime image files must use `wechat/images/`, and code must reference them with `images/...` paths. Repo-root `user-assets/` is source material only. `wechat/user-assets/` is not the default Pixi runtime image path.

The exact asset contract for Pixi animation or particles belongs to the selected Pixi child skill.

## State And Save Rules

Game state and persisted save data must be separate.

Rules:

- transient runtime state stays in memory
- persisted data uses an explicit schema
- persisted data uses versioning when the schema can change
- persisted keys must use a project-specific prefix
- save writes must be intentional, not every frame
- corrupted or missing save data must fall back safely
- never store secrets in client-side storage

Gameplay rules should be testable without requiring rendering when practical.

## Audio Rules

Audio must be lifecycle-aware.

Rules:

- preload frequently used audio where practical
- stop or pause audio when the game is hidden if needed
- do not create unlimited audio instances
- keep music, ambient sound, and short effects separate
- audio failures must not crash core gameplay

## Performance Rules

Mini Game performance work starts with frame stability.

Rules:

- keep the frame loop small
- avoid per-frame JSON parsing
- avoid per-frame path resolution
- avoid large per-frame object creation
- reuse objects in high-frequency systems when it materially reduces churn
- avoid synchronous heavy work during input response
- measure before adding complex optimization layers

Do not add a framework, rendering engine, physics engine, ECS layer, or state library unless the Owner explicitly approves it or the project already uses it.

## Pixi Boundary

Pixi is allowed only through the project-approved Pixi main skill.

Pixi work includes:

- Pixi startup
- Pixi version selection
- Pixi library path
- Pixi scene setup
- Pixi UI
- Pixi text effects
- frame animation
- spritesheets
- particle effects
- visual effects implemented with Pixi objects

Required route:

```text
WECHAT.md
  -> MINIGAME.md
  -> .agents/skills/Wechat/skill-wechat-minigame-pixi/
  -> selected Pixi child skill when needed
```

Do not implement Pixi behavior from memory.
Do not use browser Pixi tutorials as project rules.
Do not replace the project-approved Pixi baseline.

## Testing And Verification Rules

For Mini Game changes, verify the smallest useful surface.

Use checks that match the change:

- syntax checks for changed JavaScript files
- configured lint checks if present
- startup check when runtime wiring changes
- asset path checks when assets are added or moved
- input checks when touch handling changes
- lifecycle checks when pause, resume, audio, storage, or networking changes
- preview command only when preview is needed or requested
- upload command only when the Owner asks for upload

Do not claim review submission or final release.

Review submission and final release remain human web-console actions.

## Deployment Boundary

Preview and upload rules live in:

```text
agent-documents/Deploy/DEPLOY.md
```

Before preview or upload:

- read `agent-documents/Deploy/DEPLOY.md`
- read `agent-documents/Deploy/CREDENTIAL.md`
- do not invent version numbers
- do not invent version descriptions
- do not invent release ownership
- do not expose private-key material

Human-owned steps:

- review submission
- final release
- web-console account actions
