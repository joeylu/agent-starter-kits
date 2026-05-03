# MINIGAME.md

## Purpose

This is the type-specific rule set for WeChat Mini Game work.

It applies only after `WECHAT.md` detects `/wechat/game.json`.
If `WECHAT.md` detects a Mini Program, do not use this document as the implementation standard.

## Hard Entry Rule

When `WECHAT.md` detects a Mini Game, read this file before Mini Game design, source edits, initialization, refactor, test, preview, upload, or deployment work.

If this file is missing or unreadable, stop.

## Document Boundary

This file owns Mini Game architecture and runtime constraints.

It does not own:

- project-type detection; use `WECHAT.md`
- Pixi6 initialization and pre-skill routing; use `bootstrap.pixi.md`
- concrete animation workflow; use the selected animation skill
- concrete particle workflow; use the selected particle skill
- local tool usage details; use `agent-tools/TOOLS_WECHAT.md`
- deploy credentials and release steps; use `agent-documents/Deploy/`

## Project Boundary

All real Mini Game project files live under:

- `/wechat`

All agent documents live under:

- `/agent-documents`

Do not create notes, README files, process documents, summaries, or agent workflow files inside `/wechat`.

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

Do not introduce `app.json`, WXML pages, WXSS page layouts, `Page`, `Component`, or Mini Program route architecture unless the Owner explicitly changes the project type.

## File Structure Rules

Mini Game work must keep ownership explicit:

- `game.json` owns Mini Game configuration.
- `game.js` owns entry startup only.
- gameplay logic must not be dumped into `game.js`.
- rendering code must be separate from game state rules when practical.
- input handling must be centralized when more than one feature consumes input.
- asset loading must have one clear owner.
- save data and settings must have one clear owner.

Recommended source ownership:

- `src/core` for boot, loop, lifecycle, and shared runtime coordination
- `src/scenes` for scene-level flow
- `src/systems` for input, collision, audio, animation, and other update systems
- `src/entities` for game objects
- `src/rendering` for canvas or WebGL rendering
- `src/assets` for manifests and loading helpers
- `src/storage` for save data and settings

Use the existing structure when one already exists.

## Runtime Rules

Mini Game code must use the WeChat Mini Game runtime model:

- use `game.js` as the entry point
- use `wx.*` APIs for platform capabilities
- do not assume browser DOM APIs, HTML elements, CSS layout, or browser routing
- do not assume Mini Program page lifecycles
- do not assume npm packages are runtime-usable until the WeChat npm build path validates them

Do not add dependencies that require DOM layout, Node runtime APIs, native modules, or unsupported globals.

## Pixi6 Rules

Pixi6 is allowed only after the `WECHAT.md` initialization gate passes.

For Pixi6 setup, read:

- `agent-documents/bootstrap.pixi.md`

Pixi runtime rules:

- install `pixi.js`, never `pixi`
- import Pixi through `/wechat/js/vendor/pixi-runtime.js`
- do not use bare runtime imports from `pixi.js`
- do not hand-copy Pixi dist files under `/wechat/js`
- do not use Pixi 7/8-only APIs unless the shared baseline is deliberately upgraded
- rerun `npm run build:npm` after runtime dependency or build-pin changes
- treat `parse js file ... failed` as a failed build
- clear WeChat DevTools compile/npm cache after runtime dependency changes before trusting simulator results

If runtime reports module resolution, unsafe-eval, WebGL, or local image-shape errors, inspect the Pixi initialization path before changing animation, particle, or scene logic.

## Game Loop Rules

There must be one primary update and render loop.

Rules:

- keep loop ownership explicit
- use delta time for frame-dependent simulation
- keep update and render responsibilities separate
- do not create multiple uncoordinated timers or animation loops
- pause or reduce expensive work when the game is hidden
- resume safely when the game returns to foreground

Frame hot paths must avoid unnecessary allocation, repeated asset lookup, and repeated object construction.

## Canvas And Rendering Rules

Rendering must be designed for mobile WeChat runtime constraints.

Rules:

- handle device pixel ratio explicitly
- handle canvas size changes explicitly
- keep draw order deterministic
- preload required assets before first use
- provide a blocking state or fallback when required assets fail to load

Do not rely on CSS to position game content.

## Input Rules

Input must be normalized before gameplay systems consume it.

Rules:

- centralize touch input registration
- translate raw touch data into game-space coordinates in one place
- avoid duplicate listeners for the same scene or system
- remove or disable listeners when a scene is destroyed or inactive

Input code must not directly mutate unrelated game state without going through the owning system or scene.

## Asset Rules

Assets must be managed as runtime resources.

Rules:

- keep asset paths stable and explicit
- preload assets required for the current scene
- avoid loading large assets during frame-sensitive gameplay
- keep package size impact visible when adding images, audio, fonts, or large data files
- do not add decorative assets unused by runtime code

### Frame Animation Package Contract

Generated Pixi frame-animation packages must live under:

```text
/wechat/user-assets/animations/{animationName}/
```

Each package must contain:

```text
/wechat/user-assets/animations/{animationName}/{animationName}.png
/wechat/user-assets/animations/{animationName}/{animationName}.json
/wechat/user-assets/animations/{animationName}/{animationName}-data.js
```

Forbidden destinations:

- `/wechat/images`
- `/wechat/js`
- `/wechat/user-assets` without `/animations/{animationName}/`
- any flat folder that mixes unrelated atlas PNG, JSON, and `*-data.js` files

After generating or changing a frame-animation package, run:

```bash
node agent-tools/wechat/spritesheet-cropper/scripts/validate-animation-assets.js --name {animationName}
```

## State And Save Rules

Game state and persisted save data must be separate.

Rules:

- transient runtime state stays in memory
- persisted data uses explicit schema and versioning
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

Audio failures must not crash core gameplay.

## Performance Rules

Mini Game performance work starts with frame stability.

Rules:

- keep the frame loop small
- avoid per-frame JSON parsing, path resolution, and large object creation
- reuse objects in high-frequency systems when it materially reduces churn
- avoid synchronous heavy work during input response
- measure before adding complex optimization layers

Do not add a framework or engine unless the Owner explicitly approves it or the project already uses it.

## Testing And Verification Rules

For Mini Game changes, verify the smallest useful surface:

- syntax and lint checks if configured
- `npm run build:npm` before preview when Pixi or runtime npm dependencies changed
- game startup through preview when runtime wiring changed
- asset load paths when assets are added or moved
- lifecycle behavior when pause, resume, audio, storage, or networking changes
- upload command only when the Owner asks for upload

Do not claim review submission or final release. Those remain human web-console actions.
