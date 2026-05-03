# TOOLS.md

## Purpose
This document is the tool index for the local teaching template.

This template does not include remote-connection tools, does not reuse external publishing tools, and does not install server tools by default.

## Current Tool Status
- Node.js LTS: expected to be installed before the teaching workflow starts
- npm: provided with Node.js
- extra tools in repository: none

## Lookup Method
1. Read `TOOLS.md` first.
2. When the user asks to initialize the website, read `agent-documents/WEBSITE_INIT.md`.
3. For website development, installation, running, and build tasks, work inside `web/`.
4. Prefer npm scripts from `web/package.json`.
5. If `node --version` or `npm --version` is unavailable, stop and report that Node.js LTS is not installed correctly.
6. If a new tool is needed, explain its purpose, impact, and maintenance cost first, then wait for explicit Owner approval.

## Fixed Commands
```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Start-Website.ps1
```

Stop local preview:

```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Stop-Website.ps1
```

## Forbidden
- do not install Docker, WSL, IIS, Nginx, or PM2
- do not use SSH, SFTP, SCP, or rsync
- do not use pnpm, yarn, or bun
- do not run `npx create-next-app`
- do not run `create-pixi`
- do not run `npm run dev` directly in the foreground
- do not install npm packages globally
- do not describe local preview as external publishing
