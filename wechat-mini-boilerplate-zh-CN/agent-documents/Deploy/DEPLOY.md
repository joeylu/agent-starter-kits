# DEPLOY.md

## npm build 命令

```bash
cd wechat && npm run build:npm
```

## preview 命令

```bash
cd wechat && npm run preview
```

`preview` 自动化在本仓库中仍然有意保持门控。

## upload 命令

```bash
cd wechat && npm run upload
```

`upload` 自动化在本仓库中仍然有意保持门控。

## 版本号

当前仓库尚未最终开放自动 upload 流程，因此准确的版本号写入位置仍然有意保持门控。

## 版本描述

当前仓库尚未最终开放自动 upload 流程，因此准确的版本描述写入位置仍然有意保持门控。

## 上传目标

Mini Game

## 上传后网站

WeChat Official Accounts Platform：

<https://mp.weixin.qq.com>

## 凭证边界

- 已提交的说明文档是 `agent-documents/Deploy/CREDENTIAL.md`。
- build、preview、upload 的本地专用值位于 `agent-documents/Deploy/credential.local.json`。
- `credential.local.json` 是每个项目的本地状态。如果这个 workspace 复用于另一个项目，下次 full-init 前必须重写或重建该文件。

## 初始化边界

- 本仓库的初始化 `PASS` 表示 build-ready：依赖已安装、`npm run build:npm` 成功、`miniprogram_npm/` 存在、`wechat/js/vendor/pixi-runtime.js` 存在。
- `preview` 和 `upload` 脚本存在不表示 preview/upload 自动化已经打开。

## 依赖顺序

- 当 Mini Game 使用 `pixi.js` 或其他 runtime npm 依赖时，先运行 `npm run build:npm`。
- 当 `pixi.js`、`@pixi/unsafe-eval`、runtime npm 依赖树、`miniprogram-ci` 或 `less` override 发生变化时，再次运行 `npm run build:npm`。
- 这些变更后，先清理 WeChat DevTools compile/npm 缓存，再信任新的运行时结果。
- 只有 `miniprogram_npm/` 和 `wechat/js/vendor/pixi-runtime.js` 都存在后，项目才能进入 preview/upload 步骤。

## 当前仓库状态

- `preview.js` 和 `upload.js` 仍是带门控的壳脚本。
- 仓库级 preview 参数、upload 参数、版本语义和最终凭证流程尚未完全打开。

## 提审负责人

Owner / 人类在 WeChat web console 中执行提审。

## 发布负责人

Owner / 人类在 WeChat web console 中执行最终发布。

## 人工步骤

1. 运行 `npm run build:npm`。
2. 如果 Pixi runtime 依赖或共享 build pin 变更，清理 WeChat DevTools compile/npm 缓存。
3. 只有仓库级 preview 参数明确打开后，才运行 `npm run preview`。
4. 只有仓库级 upload 参数明确打开后，才运行 `npm run upload`。
5. 打开 [WeChat Official Accounts Platform](https://mp.weixin.qq.com)。
6. 在 WeChat web console 中提交审核。
7. 审核通过后，在 WeChat web console 中发布。
