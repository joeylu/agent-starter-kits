# DEPLOY.md

## npm Build Command

```bash
cd wechat && npm run build:npm
```

## Preview Command

```bash
cd wechat && npm run preview
```

Preview automation is intentionally still gated in this repository.

## Upload Command

```bash
cd wechat && npm run upload
```

Upload automation is intentionally still gated in this repository.

## Version Number

The current repository does not yet have a finalized automated upload flow, so the exact version-number write location is still intentionally gated.

## Version Description

The current repository does not yet have a finalized automated upload flow, so the exact version-description write location is still intentionally gated.

## Upload Target

Mini Game

## Post-Upload Website

WeChat Official Accounts Platform:

<https://mp.weixin.qq.com>

## Credential Boundary

- The committed guide is `agent-documents/Deploy/CREDENTIAL.md`.
- The local-only values for build, preview, and upload live in `agent-documents/Deploy/credential.local.json`.
- `credential.local.json` is per-project local state. If this workspace is reused for another project, rewrite or recreate that file before the next full-init.

## Initialization Boundary

- Initialization PASS in this repository means build-ready: dependencies installed, `npm run build:npm` succeeded, `miniprogram_npm/` exists, and `wechat/js/vendor/pixi-runtime.js` exists.
- `preview` and `upload` scripts existing does not mean preview/upload automation is currently open.

## Dependency Order

- When a Mini Game uses `pixi.js` or other runtime npm dependencies, run `npm run build:npm` first.
- When `pixi.js`, `@pixi/unsafe-eval`, the runtime npm dependency tree, `miniprogram-ci`, or the `less` override changes, run `npm run build:npm` again.
- After those changes, clear the WeChat DevTools compile/npm cache before trusting new runtime results.
- Only after `miniprogram_npm/` and `wechat/js/vendor/pixi-runtime.js` both exist may the project proceed to preview/upload steps.

## Current Repository Status

- `preview.js` and `upload.js` are still guarded shells.
- Repository-level preview parameters, upload parameters, version semantics, and the final credential flow are not fully opened yet.

## Submission Owner

Owner / human performs review submission in the WeChat web console.

## Release Owner

Owner / human performs final release in the WeChat web console.

## Human Steps

1. Run `npm run build:npm`.
2. If Pixi runtime dependencies or shared build pins changed, clear WeChat DevTools compile/npm cache.
3. Only run `npm run preview` after repository-level preview parameters are explicitly opened.
4. Only run `npm run upload` after repository-level upload parameters are explicitly opened.
5. Open [WeChat Official Accounts Platform](https://mp.weixin.qq.com).
6. Submit for review in the WeChat web console.
7. Release in the WeChat web console after review approval.
