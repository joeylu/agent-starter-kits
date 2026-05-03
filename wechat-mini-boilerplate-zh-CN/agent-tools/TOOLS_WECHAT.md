# TOOLS_WECHAT.md

## 范围

- 本分支覆盖本仓库已内置的 WeChat Mini Program 和 Mini Game 工具。
- 当任务提到 `wechat`、微信、小程序、小游戏、build、preview、upload、debug、assets 或运行时适配时，先检查本文档。

## 边界

- 本文档只登记仓库中已经存在的本地工具。
- 本文档不定义 AppID、AppSecret、private key、upload 版本、发布流程或账号权限。
- 项目规则仍来自 `agent-documents/PROJECT.md`、`agent-documents/WECHAT.md`、`agent-documents/MINIAPP.md`、`agent-documents/MINIGAME.md` 和 `agent-documents/Deploy/`。

## 选择规则

- 提出新安装前，先复用本文档登记的工具。
- 如果必需 WeChat 工具没有在这里登记，先停止并询问 Owner，不要安装其他东西。

## 工具列表

## minigame init

### 工具类型

WeChat Mini Game 初始化和共享 build baseline 工具。

### 安装状态

内置。

### 本地路径

- 工具目录：`agent-tools/wechat/minigame-init`
- 共享版本来源：`agent-tools/wechat/minigame-init/versions.json`
- 共享 build 核心：`agent-tools/wechat/minigame-init/lib/build-npm-core.js`
- 初始化入口：`scripts/init-wechat-minigame.js`

### 使用场景

启动或重新同步真实项目根目录为 `/wechat` 的 WeChat Mini Game 项目时，使用本工具。

它让以下项目本地入口文件在不同项目之间保持一致：

- `wechat/package.json`
- `wechat/project.config.json`
- `wechat/.gitignore`
- `wechat/scripts/build-npm.js`
- `wechat/scripts/preview.js`
- `wechat/scripts/upload.js`

### 非目标

本工具不决定 AppID、AppSecret、private key 所有人、发布负责人或审核流程。
这些属于 `agent-documents/Deploy/`。

### 标准用法

默认 full-init：

```bash
node scripts/init-wechat-minigame.js --project-root wechat
```

只同步项目壳：

```bash
node scripts/init-wechat-minigame.js --project-root wechat --sync-only
```

安装依赖但跳过 build：

```bash
node scripts/init-wechat-minigame.js --project-root wechat --skip-build
```

### 规则

- Mini Game 项目根目录必须保持为 `/wechat`。
- 本初始化器只适用于 Mini Game。不要用于 Mini Program 项目壳。
- PixiJS Mini Game wrapper 技能也只适用于 Mini Game，并假设存在 Mini Game 项目壳，不是假设 Mini Program 项目壳。
- 它需要已有 WeChat DevTools Mini Game 项目壳，包括 `/wechat/game.json` 和 `/wechat/project.config.json`。
- 如果 `/wechat` 已被清空，先在 WeChat DevTools 中重新创建 Mini Game 项目壳，再运行 full-init。
- `/wechat/scripts/*.js` 是项目本地薄入口；共享逻辑位于 `agent-tools/wechat/minigame-init/lib/`。
- 默认 full-init 会在 `/wechat` 中运行 `npm install`，安装固定的 Pixi/WeChat 工具链，然后运行 `build:npm`。
- 当前固定 Mini Game baseline 包含 `pixi.js`、`@pixi/unsafe-eval`、`miniprogram-ci`、`minigame-api-typings`，以及来自 `versions.json` 的 `less` 兼容性 override。
- Full-init 依赖 `agent-documents/Deploy/credential.local.json` 存在且有效，因为当前官方 `packNpm` 流程仍使用 `miniprogram-ci`。
- 本 workspace 支持的 DevTools npm mode 是 `project.config.json -> setting.packNpmManually=false` 和 `setting.packNpmRelationList=[]`。
- `build:npm` 必须生成 `wechat/js/vendor/pixi-runtime.js`；运行时代码应导入这个生成的本地 adapter，而不是从 `pixi.js` 做 bare runtime import。
- `--skip-build` 和 `--sync-only` 只用于凭证配置前的项目壳 setup，不算初始化 `PASS`。

### 验证

```bash
node --check scripts/init-wechat-minigame.js
node scripts/init-wechat-minigame.js --project-root wechat
node scripts/init-wechat-minigame.js --project-root wechat --skip-build
node scripts/init-wechat-minigame.js --project-root wechat --sync-only
```

### 维护备注

- 已验证的 Pixi baseline 变更时，先更新 `versions.json`。
- 然后一起更新共享 build/init script、冒烟检查和文档。
- 不要把单个项目改成 `latest`，却让共享初始化器停留在旧状态。

## sharp spritesheet cropper

### 工具类型

WeChat asset 预处理工具。

### 安装状态

已安装。

### 官方安装参考

Sharp 文档：

`https://sharp.pixelplumbing.com/install`

本地安装流程：

```bash
cd agent-tools/wechat/spritesheet-cropper
npm install sharp
```

### 本地路径

- 工具目录：`agent-tools/wechat/spritesheet-cropper`
- CLI 脚本：`agent-tools/wechat/spritesheet-cropper/scripts/spritesheet-cropper.js`
- 验证脚本：`agent-tools/wechat/spritesheet-cropper/scripts/validate-animation-assets.js`
- 依赖 manifest：`agent-tools/wechat/spritesheet-cropper/package.json`

### 使用场景

用于 WeChat Mini Game spritesheet 预处理：

- 读取 PNG 尺寸
- 裁剪矩形区域
- trim edges
- 验证 grid alignment
- 输出裁剪后的 PNG
- 生成 PixiJS spritesheet JSON
- 生成 CommonJS spritesheet 数据模块，供 Mini Game runtime 直接 `require`

### 非目标

本工具不用于 preview、upload、运行时渲染代码生成或手工美术编辑。

### 标准用法

```bash
node agent-tools/wechat/spritesheet-cropper/scripts/spritesheet-cropper.js ^
  --input user-assets/images/test.png ^
  --name jelly-cube ^
  --grid 3x3 ^
  --crop 0,0,2046,2046 ^
  --loop true ^
  --description "User-confirmed animation description between 100 and 2000 characters."
```

### 输出契约

默认输出：

```text
wechat/user-assets/animations/{animationName}/{animationName}.png
wechat/user-assets/animations/{animationName}/{animationName}.json
wechat/user-assets/animations/{animationName}/{animationName}-data.js
```

默认输出根目录从仓库根目录解析，不从调用者当前工作目录解析。

对于 `--name test`，输出必须是：

```text
wechat/user-assets/animations/test/test.png
wechat/user-assets/animations/test/test.json
wechat/user-assets/animations/test/test-data.js
```

不要把生成的帧动画 atlas 资源包输出到 `wechat/images`、`wechat/js` 或平铺的 `wechat/user-assets` 目录。
如果 `--output-root` 解析到 `wechat/user-assets/animations` 之外，cropper 应失败。

### 验证

```bash
cd agent-tools/wechat/spritesheet-cropper
npm run check
node scripts/spritesheet-cropper.js --input ../../../user-assets/images/test.png --name jelly-cube-check --grid 3x3 --crop 0,0,2046,2046 --loop true --description "Confirmed test description longer than 100 characters so the cropper can validate PNG loading, crop bounds, grid alignment, and PixiJS spritesheet JSON generation."
```

生成动画资源包后，验证资源契约：

```bash
node agent-tools/wechat/spritesheet-cropper/scripts/validate-animation-assets.js --name jelly-cube
```

当生成的 atlas 资源包被放进 `wechat/images` 等禁止位置时，该验证器必须失败。

## 默认决策

- WeChat build/preview/upload 工作，先检查 `/wechat/package.json`、`agent-documents/WECHAT.md` 和 `agent-documents/Deploy/`。
- WeChat Mini Program 开发读取 `agent-documents/MINIAPP.md`。
- WeChat Mini Game 开发读取 `agent-documents/MINIGAME.md`。
- 新 Mini Game 项目壳 setup 和 Pixi build baseline 同步使用 `minigame init`。
- spritesheet 裁剪、trim、grid 和 Pixi JSON 生成使用 `sharp spritesheet cropper`。

## 不重复安装

- 如果本文档中的工具可以处理任务，不要安装重复工具。
- 如果必需工具缺失、未登记、损坏或未文档化，停止并询问 Owner，再安装新工具。
