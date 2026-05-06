# DEPLOY.md

## Build Command

The current Mini Game Pixi4 baseline uses checked-in local runtime files.

Default build command for Pixi initialization:

```text
none
```

Do not run `npm run build:npm` as a Pixi initialization requirement.

If a future project adds a separate build step, this section must be updated with the exact command before agents use it.

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
- The local-only values for preview and upload live in `agent-documents/Deploy/credential.local.json`.
- `credential.local.json` is per-project local state. If this workspace is reused for another project, rewrite or recreate that file before the next full-init.

## Initialization Boundary

- Initialization PASS is defined by `agent-documents/WECHAT-INIT.md`.
- For the Mini Game Pixi4 baseline, PASS does not require `npm install`, `npm run build:npm`, `miniprogram_npm/`, or `wechat/js/vendor/pixi-runtime.js`.
- PASS means the WeChat shell, type document, deploy docs, and required Pixi4 local baseline files are present.
- `preview` and `upload` scripts existing does not mean preview/upload automation is currently open.

## Runtime Baseline Order

- Mini Game Pixi runtime must use the local baseline checked by `WECHAT-INIT.md`.
- Do not introduce npm Pixi, `@pixi/unsafe-eval`, or `wechat/js/vendor/pixi-runtime.js` as deployment prerequisites.
- If a future non-Pixi dependency requires a build step, update this document before using that step.
- Preview/upload may proceed only after initialization reports `PASS` and the preview/upload gates below are open.

## Current Repository Status

- `preview.js` and `upload.js` are still guarded shells.
- Repository-level preview parameters, upload parameters, version semantics, and the final credential flow are not fully opened yet.

## Submission Owner

Owner / human performs review submission in the WeChat web console.

## Release Owner

Owner / human performs final release in the WeChat web console.

## Human Steps

1. Confirm initialization reports `PASS`.
2. Only run `npm run preview` after repository-level preview parameters are explicitly opened.
3. Only run `npm run upload` after repository-level upload parameters are explicitly opened.
4. Open [WeChat Official Accounts Platform](https://mp.weixin.qq.com).
5. Submit for review in the WeChat web console.
6. Release in the WeChat web console after review approval.
