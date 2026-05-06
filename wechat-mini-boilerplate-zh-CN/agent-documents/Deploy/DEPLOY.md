# DEPLOY.md

## Build Command

当前 Mini Game Pixi4 基线使用 checked-in 本地 runtime 文件。

Pixi 初始化默认 build command：

```text
none
```

不要把 `npm run build:npm` 当作 Pixi 初始化要求。

如果未来项目添加独立 build 步骤，必须先在本节写明准确命令，agent 才能使用。

## Preview Command

```bash
cd wechat && npm run preview
```

Preview 自动化在本仓库中仍然有意保持门控。

## Upload Command

```bash
cd wechat && npm run upload
```

Upload 自动化在本仓库中仍然有意保持门控。

## Version Number

当前仓库尚未最终开放自动 upload 流程，因此准确的 version-number 写入位置仍然有意保持门控。

## Version Description

当前仓库尚未最终开放自动 upload 流程，因此准确的 version-description 写入位置仍然有意保持门控。

## Upload Target

Mini Game

## Post-Upload Website

WeChat Official Accounts Platform：

<https://mp.weixin.qq.com>

## 凭证边界

- 已提交说明文档是 `agent-documents/Deploy/CREDENTIAL.md`。
- Preview 和 upload 的本地专用值位于 `agent-documents/Deploy/credential.local.json`。
- `credential.local.json` 是每个项目的本地状态。如果 workspace 复用于其他项目，下次 full-init 前必须重写或重建该文件。

## 初始化边界

- 初始化 PASS 由 `agent-documents/WECHAT-INIT.md` 定义。
- Mini Game Pixi4 基线的 PASS 不要求 `npm install`、`npm run build:npm`、`miniprogram_npm/` 或 `wechat/js/vendor/pixi-runtime.js`。
- PASS 表示微信项目壳、类型文档、部署文档和必需 Pixi4 本地基线文件存在。
- `preview` 和 `upload` 脚本存在不表示 preview/upload 自动化已经打开。

## Runtime Baseline 顺序

- Mini Game Pixi runtime 必须使用 `WECHAT-INIT.md` 检查的本地基线。
- 不要把 npm Pixi、`@pixi/unsafe-eval` 或 `wechat/js/vendor/pixi-runtime.js` 引入为部署前提。
- 如果未来非 Pixi 依赖需要 build step，使用前必须先更新本文档。
- Preview/upload 只能在初始化报告 `PASS` 且下方 preview/upload gate 打开后继续。

## 当前仓库状态

- `preview.js` 和 `upload.js` 仍是受保护的壳。
- 仓库级 preview 参数、upload 参数、version 语义和最终凭证流程尚未完全打开。

## Submission Owner

Owner / 人类在 WeChat web console 中提审。

## Release Owner

Owner / 人类在 WeChat web console 中最终发布。

## 人工步骤

1. 确认初始化报告 `PASS`。
2. 只有仓库级 preview 参数明确打开后，才运行 `npm run preview`。
3. 只有仓库级 upload 参数明确打开后，才运行 `npm run upload`。
4. 打开 [WeChat Official Accounts Platform](https://mp.weixin.qq.com)。
5. 在 WeChat web console 中提交审核。
6. 审核通过后，在 WeChat web console 中发布。
