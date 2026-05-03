# LOCAL_TROUBLESHOOT.md

## Node.js Unavailable
Check:

```powershell
node --version
npm --version
```

If either command is unavailable, stop and report that Node.js LTS is not installed correctly. Do not install it yourself.

## Dependency Install Failure
Use this fixed handling order:

1. Check `web/package.json`.
2. Fix clearly incorrect dependencies or scripts.
3. Run `npm install` again.
4. If it still fails, report the key error from npm output.

Do not switch to another package manager.

## Port Occupied
Default port: `3000`.

If it is occupied, the start script automatically tries `3001` through `3009`. Report only the actual URL from script output. Lower-capability models should not manually construct port commands.

## Page Does Not Open
First confirm that the development server is still running, then confirm the actual port.

Report only the localhost URL. Do not make the student interpret terminal logs.

If preview needs to be restarted, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Start-Website.ps1
```

If preview needs to be stopped, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Stop-Website.ps1
```

## Build Failure
Run:

```powershell
npm run build
```

Fix source code according to the error. Do not skip build failures, and do not treat a successful dev preview as build success.

Do not start local preview when the build has failed.

## Directories That May Be Cleaned
Allowed cleanup targets:

- `web/.next/`
- `web/node_modules/`

Do not delete source code, `package.json`, or `package-lock.json` without permission.
