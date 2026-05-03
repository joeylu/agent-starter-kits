# LOCAL_DEPLOY.md

## Definition
Local deployment means installing dependencies, starting a preview, and running a build check on the local Windows 11 machine.

It does not connect to external environments, handle domains, handle certificates, or publish to the public internet.

## Single Entry Point
When the user says `install`, `start`, `run`, `preview`, `local deploy`, or `deploy`, run the following flow.

Deployment prerequisite: `web/package.json` must exist.

If `web/package.json` does not exist, stop immediately. Do not initialize automatically and do not continue installing dependencies. Reply:

```text
The current website has not been initialized yet. Please say: initialize current website
```

```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Start-Website.ps1
```

Preferred default URL, with the actual URL determined by script output:

```text
http://localhost:3000
```

## Build Check
Every local deployment runs `npm run build` through `Start-Website.ps1` first, then starts the preview in the background.

If only a standalone build check is needed, run:

```powershell
Set-Location .\web
npm run build
```

If the build fails, fix the source code under `web/` based on the error, then run the build check again. Do not start preview after a failed build, and do not tell the student to open the browser.

Do not run `npm run dev` in the foreground. Local preview must be started in the background through `agent-documents/Local/Start-Website.ps1`.

## Success Criteria
Local deployment counts as successful only when all of these are true:

- dependency installation succeeded
- build check succeeded
- local development server started successfully in the background
- an accessible localhost URL was returned

## Stop Preview
When local preview needs to be stopped, run only:

```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Stop-Website.ps1
```

## Failure Handling
If the port is occupied, switch ports in order from `3001` through `3009`.

If dependency installation fails, fix dependency declarations under `web/`. Do not switch package managers.

If the build fails, fix source code. Do not ask the student to edit files manually.

If a preview process occupies the terminal, it means `npm run dev` was incorrectly run in the foreground. Stop that foreground command, then use `Start-Website.ps1`.

If Node.js is unavailable, stop immediately. This template does not repair Node.js automatically.

## Forbidden Actions
- do not publish to the public internet
- do not upload files
- do not connect to external hosts
- do not install system services
- do not ask the student to run complex commands manually
