# CODER.md

## Audience
- This document is written for AI agents, not end users.
- Optimize for deterministic execution and low ambiguity.

## Mission
- Implement local Next.js website projects safely inside `web/`.
- The default initialization target is Next.js + React + TypeScript + PixiJS v8.
- Keep the workflow simple enough for non-technical students: AI performs file creation, dependency install, build checks, and local preview.

## Mandatory Read Order
Before coding, read:

1. `agent-tools/TOOLS.md`
2. `agent-documents/PROJECT.md`
3. `agent-documents/WEBSITE_INIT.md`
4. `agent-documents/LOCAL_DEPLOY.md`
5. `agent-documents/LOCAL_TROUBLESHOOT.md`

If the task touches PixiJS, use the PixiJS v8 skills under `.agents/skills/pixi8/`.

## Encoding Compatibility Rules
1. Save every created or edited text/code/config file as UTF-8.
2. Never deliver mojibake text.
3. Before final output, perform an encoding self-check for every touched text file.
4. If text appears garbled, repair encoding before final output.

## Scope
Allowed write scope:

- `web/`
- `agent-documents/dev-notes/`

Documentation/rule edits outside those paths require explicit Owner approval.

## Fixed Stack
- Next.js
- React
- TypeScript
- PixiJS v8 through direct `pixi.js` usage
- npm only

Do not use `npx create-next-app`, `create-pixi`, pnpm, yarn, bun, Docker, WSL, IIS, Nginx, PM2, SSH, SFTP, SCP, or rsync.

## Initialization Rule
When Owner asks to initialize the website, including `initialize current website`, `initialize this website`, `initialize current web`, `initialize this website project`, or `initialize web`, create or repair the minimal project described in `agent-documents/WEBSITE_INIT.md`.

Do not ask follow-up questions unless Node.js/npm is unavailable or a required file cannot be written.

## Next.js Rules
- Use the App Router under `web/app/`.
- Keep browser-only logic in Client Components.
- `app/page.tsx` should be a Server Component unless interactivity is required directly there.
- Put PixiJS code in `web/components/PixiStage.tsx` with `'use client'`.
- Import global CSS only from `app/layout.tsx`.
- Do not create extra root folders such as `api/`, `www/`, or `content/`.

## PixiJS v8 Rules
- Install `pixi.js`.
- In Next.js, use type-only imports at the top of Client Components and dynamically import `pixi.js` inside `useEffect`.
- Use `const app = new Application();` followed by `await app.init(...)`.
- Append `app.canvas`, not `app.view`.
- Do not pass options to `new Application(...)`.
- Do not touch `app.canvas`, `app.renderer`, or `app.screen` before `app.init(...)` resolves.
- Destroy the Pixi application on React component unmount with `app.destroy(...)`.
- Avoid v7 APIs such as `beginFill`, `endFill`, `drawCircle` chains, `BaseTexture`, and `DisplayObject`.

## Local Run Rules
- Use `npm install` for dependencies.
- Use `npm run build` for build validation.
- Do not run `npm run dev` in the foreground.
- Use `agent-documents/Local/Start-Website.ps1` to install, build, start the dev server in the background, probe localhost, and report the final URL.
- Use `agent-documents/Local/Stop-Website.ps1` to stop the recorded local dev server.
- If port `3000` is busy, the start script tries `3001` through `3009`.

## Output Expectation
For coding turns:

- Report concrete file-level changes.
- Report whether `Start-Website.ps1`, `npm install`, `npm run build`, and local preview were attempted.
- Include `Encoding Check: PASS/FAIL` and list touched text files checked.
