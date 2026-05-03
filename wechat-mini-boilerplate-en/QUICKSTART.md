# WeChat Mini Boilerplate Quickstart

This template helps you quickly create an AI-ready workspace for WeChat Mini Program or WeChat Mini Game projects.

Its focus is not a full game engine like Unity or Cocos. It uses lightweight JavaScript rendering modules such as Pixi for animation, particles, post-processing, and lightweight game visuals.

## 1. Create A Workspace

1. Copy `wechat-mini-boilerplate-en` and use the copy as your new project folder.
2. Use WeChat DevTools to create a WeChat Mini Program or WeChat Mini Game project under `/wechat` in that folder.
3. Open the full project folder in an AI-agent-capable development tool, such as VSCode, Claude, Codex, OpenCode, or a similar environment.

`/wechat` is the real WeChat project directory. Mini Programs usually have `app.json`; Mini Games usually have `game.json`. The agent uses those files to detect the project type.

## 2. Initialize The Project

Ask the agent to initialize this WeChat Mini Game, initialize this WeChat Mini Program, or use similar natural language.

The agent checks the `/wechat` project shell, project type, `project.config.json`, and initialization requirements.  
For Mini Game projects, it syncs the Pixi Mini Game toolchain, installs dependencies, runs `build:npm`, and brings the project to build-ready state.

`build-ready` means the local npm build path is ready. For Mini Games, it also means `miniprogram_npm/` and the Pixi runtime file have been generated.

## 3. Configure Credentials

You can fill in the local credential file yourself:

```text
agent-documents/Deploy/credential.local.json
```

You can also give the agent the AppID, Secret, and upload key path during or after initialization, and let the agent fill them in.

If required credentials are missing, the agent asks directly. It does not guess or fake them.

## 4. Develop With Natural Language

You can describe what you want directly, for example:

```text
Create a home page.
Add a leaderboard page.
Build a mini game where tapping the screen increases the score.
Make the character draggable.
```

The agent follows Mini Program rules or Mini Game rules based on `/wechat/app.json` or `/wechat/game.json`.

## 5. Animation, Particles, And Assets

For WeChat Mini Games, when you mention Pixi, frame animation, frame sequences, particles, smoke, fire, splashes, trails, post-processing, or similar effects, the agent uses the Pixi6 and WeChat Mini Game workflow.

Examples:

```text
Turn this 3x3 frame sheet into a looping animation.
Add trail particles when the character moves.
Create a spark burst when I tap.
```

If a raw PNG grid needs cropping or packaging, the agent confirms the description first, then uses the built-in spritesheet tool to generate the animation asset package.

## 6. Preview And Debug

After initialization and build are complete, you can preview the project in WeChat DevTools.

If WeChat DevTools shows an error, copy the error message to the agent so it can fix the issue.

## 7. Upload And Release

Prepare the AppID, Secret, and upload key first.

Then you can ask the agent with natural language such as upload to WeChat, upload deployment, upload to the WeChat platform, or similar wording.  
If the version number, version description, or upload authorization is missing, the agent asks for it first. After the information is complete, the agent builds and uploads the project to WeChat.

Final review submission and release are still completed by a human in the WeChat platform.
