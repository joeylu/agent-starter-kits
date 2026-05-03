# PROJECT.md

## Project Identity
This project is a Windows 11 local teaching website template. It is not bound to any real site, domain, remote host, or external runtime environment.

After a student opens this directory, the AI is responsible for turning the website under `web/` into a concrete local project, then installing, running, previewing, and build-checking it on the local machine.

Default student entry phrases include:

```text
initialize current website
initialize this website
initialize current web
initialize this website project
initialize web
```

When any of these phrases appears, the AI must initialize a Next.js + PixiJS v8 project according to `agent-documents/WEBSITE_INIT.md`.

## Fixed Base Environment
- operating system: Windows 11
- editor: VSCode
- runtime: Node.js LTS is already installed
- package manager: npm only
- website root: `web/` only
- default website stack: Next.js + React + TypeScript + PixiJS v8

If `node --version` or `npm --version` is unavailable, stop immediately and report: Node.js LTS is not installed correctly. Do not install Node.js yourself.

## Local Deployment Definition
In this template, deployment only means local deployment:

1. install dependencies in `web/`
2. run a build check
3. start local preview in the background
4. open the local machine URL

Local deployment does not mean going online, connecting to external hosts, handling domains, handling certificates, or publishing remotely.

## Fixed Command Chain
All commands are run from the project root by default.

```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Start-Website.ps1
```

Preferred default preview URL, with the actual URL determined by script output:

```text
http://localhost:3000
```

Build check runs only:

```powershell
Set-Location .\web
npm run build
```

Do not run `npm run dev` in the foreground. Local preview must be started in the background through `agent-documents/Local/Start-Website.ps1`.

## Trigger Rules
When the user says `initialize current website`, `initialize this website`, `initialize current web`, `initialize this website project`, or `initialize web`, the AI must directly enter the website initialization flow:

1. check Node.js and npm
2. create or repair the fixed file list under `web/`
3. write the minimum runnable Next.js + PixiJS v8 project
4. run the local start script
5. let the script run `npm install`
6. let the script run `npm run build`
7. let the script start local preview in the background
8. return the actual localhost URL

Do not ask the user to confirm `approve changes` again.

When the user says `install`, `start`, `run`, `preview`, `local deploy`, or `deploy`, run only the local command chain. Before running it, confirm that `web/package.json` exists. If it does not exist, stop immediately and ask the user to say `initialize current website` first.

When the user says `go online`, `upload`, `server`, or `remote publish`, the AI must explain that this template does not include external publishing ability and only supports local running and build checks.

## Subproject Structure
`web/` is the only website root. Do not create extra wrapper folders such as `api/`, `www/`, or `content/`.

`web/` should contain at least:

- `package.json`
- `app/`
- `app/page.*`
- `app/layout.*`
- `next.config.*`
- `components/PixiStage.*`

If these files are missing, the AI should fill in the minimum Next.js + PixiJS v8 project structure under `web/` according to `agent-documents/WEBSITE_INIT.md`. Do not run `npx create-next-app`.

## Fixed Technical Boundary
Allowed:

- Next.js
- React
- TypeScript or JavaScript
- PixiJS v8
- CSS Modules / global CSS / Tailwind, based on the existing project
- static assets under `public/`

Forbidden:

- Docker
- WSL
- IIS
- Nginx
- PM2
- SSH / SFTP / SCP / rsync
- pnpm / yarn / bun
- `npx create-next-app`
- `create-pixi`
- global npm package installation
- automatic stack replacement

## Dependency Rules
The only default install command is:

```powershell
npm install
```

The AI must not switch package managers because installation failed. First fix the current `web/` `package.json`, lockfile, or dependency conflict.

Allowed cleanup targets:

- `web/.next/`
- `web/node_modules/`

Without explicit Owner approval, do not delete `package.json`, `package-lock.json`, or source directories.

## Port Rules
The default port is `3000`.

If the port is occupied, the AI directly uses `3001`, then tries sequentially through `3009`. The final reply must include the actual accessible URL.

## Acceptance Criteria
Successful local deployment must satisfy all of these:

- `npm install` succeeded
- `npm run build` succeeded
- the local development server started successfully in the background
- the browser URL is accessible

Do not treat "the command has run" as success.

## Document Entry Points
Specific local deployment SOP:

- `agent-documents/WEBSITE_INIT.md`
- `agent-documents/LOCAL_DEPLOY.md`
- `agent-documents/LOCAL_TROUBLESHOOT.md`
- `agent-documents/Local/Start-Website.ps1`
- `agent-documents/Local/Stop-Website.ps1`

## Current Boundary Conclusion
The AI is authorized to develop and maintain the local Next.js website under `web/`.

The AI is not authorized to perform external publishing, remote connections, server configuration, or system-level installation.
