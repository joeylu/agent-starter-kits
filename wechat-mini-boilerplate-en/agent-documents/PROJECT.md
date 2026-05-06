# PROJECT.md

## Purpose

This is the project-level startup document.

Its job is to route the agent into the WeChat rule chain, not to duplicate WeChat, Mini Game, Pixi, deployment, or skill details.

## Document Ownership

- `AGENTS.md`: identity loading, write permission, tool index entry, implicit skill loading, and dev-note rules.
- `PROJECT.md`: project-level entry, document ownership, and repository boundaries.
- `agent-documents/WECHAT.md`: WeChat entry gate, project-type detection, initialization handoff, and skill routing gate.
- `agent-documents/WECHAT-INIT.md`: WeChat initialization SOP, PASS/BLOCKED checks, and Mini Program / Mini Game initialization routing.
- `agent-documents/MINIAPP.md`: Mini Program architecture, runtime, UI, and verification rules.
- `agent-documents/MINIGAME.md`: Mini Game general architecture, runtime, assets, loop, and verification rules.
- `.agents/skills/Wechat/`: concrete WeChat skill workflows after routing has selected a skill.
- `agent-tools/`: registered local tools only.

## Startup Order

After `AGENTS.md` has loaded `SOUL.md` and `IDENTITY.md`, the agent must:

1. read this file
2. immediately read `agent-documents/WECHAT.md`
3. immediately read `agent-documents/WECHAT-INIT.md`
4. detect the project type from `/wechat/game.json` or `/wechat/app.json`
5. read exactly one matching type document, `MINIAPP.md` or `MINIGAME.md`
6. complete the initialization gate required by `WECHAT-INIT.md`
7. only continue after the gate reports `PASS`, or stop on `BLOCKED`

Do not guess the project type from folder names or user wording.

## Repository Boundary

The real WeChat project root is:

- `/wechat`

Agent documents live under:

- `/agent-documents`

Deployment documents live under:

- `/agent-documents/Deploy`

Rules:

- do not create another `agent-documents` folder
- do not create `/wechat/agent-documents`
- do not create README files, notes, process documents, summaries, or agent workflow files inside `/wechat`
- do not invent credentials, AppID, AppSecret, private-key paths, release ownership, or project type

## Working Mode

The intended workflow is:

- the human creates the WeChat DevTools project shell under `/wechat`
- the agent initializes and develops from VSCode after the shell exists
- initialization work may be automated after the shell exists and the gate passes
- preview and upload follow `agent-documents/Deploy/DEPLOY.md`
- review submission and final release remain human web-console actions

## Language And Runtime

Unless the existing project proves otherwise:

- use JavaScript as the primary source language
- do not introduce a compile layer without explicit human approval
- use Node.js LTS only

## Conflict Rule

If documents overlap:

- `SOUL.md` and `IDENTITY.md` control agent state, tone, and write permission
- `WECHAT.md` wins for WeChat entry, type detection, and skill routing
- `WECHAT-INIT.md` wins for initialization order, PASS/BLOCKED output, and initialization checks
- `MINIAPP.md` or `MINIGAME.md` wins for type-specific non-skill implementation
- selected skills win for their concrete workflow after routing has selected them
- direct Owner instructions win unless they conflict with higher-priority safety or state rules
