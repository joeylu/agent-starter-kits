# TOOLS_WECHAT.md

## 范围

- 本分支覆盖本仓库已内置的 WeChat Mini Program 和 Mini Game 工具。
- 当任务提到 `wechat`、微信、小程序、小游戏、build、preview、upload、debug、assets 或 runtime adaptation 时，先检查本文档。

## 边界

- 本文档只登记仓库中已经存在的本地工具。
- 本文档不定义 AppID、AppSecret、private keys、upload versions、release workflow 或账号权限。
- 项目规则仍来自 `agent-documents/PROJECT.md`、`agent-documents/WECHAT.md`、`agent-documents/WECHAT-INIT.md`、`agent-documents/MINIAPP.md`、`agent-documents/MINIGAME.md`、`.agents/skills/Wechat/` 和 `agent-documents/Deploy/`。

## 选择规则

- 提出新安装前，先复用本文档登记的工具。
- 如果必需 WeChat 工具没有在这里登记，停止并询问 Owner，不要安装其他东西。
- 不要使用与 `WECHAT-INIT.md` 冲突的本地工具实现。

## 工具列表

## minigame init

### 工具类型

WeChat Mini Game Pixi4 初始化和基线同步工具。

### 安装状态

内置。

### 本地路径

- 工具目录：`agent-tools/wechat/minigame-init`
- 基线 manifest：`agent-tools/wechat/minigame-init/versions.json`
- 官方基线资产根目录：`agent-tools/wechat/minigame-init/assets/pixi4-baseline`
- 初始化核心：`agent-tools/wechat/minigame-init/lib/init-minigame-core.js`
- Preview 门控核心：`agent-tools/wechat/minigame-init/lib/preview-core.js`
- Upload 门控核心：`agent-tools/wechat/minigame-init/lib/upload-core.js`
- 初始化入口：`scripts/init-wechat-minigame.js`

### 使用场景

启动或重新同步真实项目根目录为 `/wechat` 的 WeChat Mini Game 项目时使用。

它保持官方 demo 风格的 Pixi4 本地文件基线一致：

- `wechat/game.js`
- `wechat/libs/weapp-adapter.js`
- `wechat/libs/pixi.js`
- `wechat/src/index.js`
- `wechat/src/config.js`
- `wechat/src/scenes/`
- `wechat/src/base/`
- `wechat/src/common/`
- `wechat/images/`
- `wechat/user-assets/` 只作为兼容/暂存目录；Pixi runtime images 必须使用 `wechat/images/`
- `wechat/scripts/preview.js`
- `wechat/scripts/upload.js`

它也会删除旧 Pixi6 生成物：

- `wechat/miniprogram_npm/`
- `wechat/js/vendor/pixi-runtime.js`
- `wechat/node_modules/pixi.js`
- `wechat/node_modules/@pixi/`
- 只有包含旧 Pixi6 marker 时才删除 `wechat/package-lock.json`
- `wechat/scripts/build-npm.js`

### 非目标

本工具不决定 AppID、AppSecret、private key owner、release owner、review workflow、动画实现或粒子实现。

它可以创建空的 `wechat/user-assets/` 兼容目录，但 Pixi runtime image assets 必须写入 `wechat/images/`。初始化时不准备粒子或动画 runtime assets。

这些属于：

- `agent-documents/Deploy/`
- `.agents/skills/Wechat/skill-wechat-minigame-pixi/`
- 被选中的 Pixi 子 skill

### 标准用法

默认 full-init：

```bash
node scripts/init-wechat-minigame.js --project-root wechat
```

兼容 flags 会被接受但无实际效果：

```bash
node scripts/init-wechat-minigame.js --project-root wechat --sync-only
node scripts/init-wechat-minigame.js --project-root wechat --skip-build
node scripts/init-wechat-minigame.js --project-root wechat --skip-install
```

Pixi4 initializer 不运行 dependency installation，也不运行 npm build。

### 必需本地基线

运行 initializer 前，以下文件必须存在：

```text
agent-tools/wechat/minigame-init/assets/pixi4-baseline/libs/weapp-adapter.js
agent-tools/wechat/minigame-init/assets/pixi4-baseline/libs/pixi.js
agent-tools/wechat/minigame-init/assets/pixi4-baseline/game.js
agent-tools/wechat/minigame-init/assets/pixi4-baseline/src/index.js
agent-tools/wechat/minigame-init/assets/pixi4-baseline/src/config.js
```

规则：

- `libs/pixi.js` 必须来自官方 demo 基线，并包含 Pixi version marker `4.8.2`。
- initializer 不得下载这些文件。
- 如果本地基线文件缺失，initializer 必须报告 `BLOCKED`。
- 如果未来改变 Pixi 基线，必须同时更新本地基线资产、`versions.json`、文档和 skills。

### 规则

- Mini Game 项目根目录必须保持 `/wechat`。
- 本 initializer 只适用于 Mini Game，不要用于 Mini Program 项目壳。
- 它需要已存在的 WeChat DevTools Mini Game 项目壳，包括 `/wechat/game.json` 和 `/wechat/project.config.json`。
- 如果 `/wechat` 已被清空，先在 WeChat DevTools 中重新创建 Mini Game 项目壳。
- 初始化或明确 Pixi4 基线修复时运行本工具；普通功能开发中不要重新同步已经有效的基线。
- 不要安装 npm Pixi 作为 runtime baseline。
- 不要安装 `@pixi/unsafe-eval`。
- 不要生成 `wechat/js/vendor/pixi-runtime.js`。
- 不要要求 `wechat/miniprogram_npm` 作为初始化 PASS 条件。
- 不要复制官方 demo 的 lockstep、room、battle、invite、login 或 ad 业务逻辑。

### 验证

Syntax checks：

```bash
node --check scripts/init-wechat-minigame.js
node --check agent-tools/wechat/minigame-init/lib/init-minigame-core.js
node --check agent-tools/wechat/particle-assets/lib/copy-particle-category-core.js
node --check scripts/copy-wechat-particle-category.js
node --check agent-tools/wechat/minigame-init/lib/preview-core.js
node --check agent-tools/wechat/minigame-init/lib/upload-core.js
```

本地官方基线资产缺失时的预期 blocker：

```bash
node scripts/init-wechat-minigame.js --project-root wechat
```

预期结果：

```text
BLOCKED Missing local official Pixi4 baseline assets
```

### 维护备注

- 保持本地基线资产根目录为 Pixi runtime files 的唯一来源。
- 不要用 npm Pixi 替换 checked-in Pixi4 local files。
- 未经 Owner 明确批准，不要添加 compile layer。

## particle category copy

### 工具类型

WeChat Mini Game 粒子 runtime asset materialization 工具。

### 安装状态

内置。

### 本地路径

- 源粒子库：`user-assets/particle-library`
- 复制核心：`agent-tools/wechat/particle-assets/lib/copy-particle-category-core.js`
- 复制入口：`scripts/copy-wechat-particle-category.js`

### 使用场景

只在 `skill-wechat-minigame-pixi-particles` 中用户选择 route A 后使用。

它只把一个被选中的粒子 category 从：

```text
user-assets/particle-library/{category}/
```

materialize 到 Pixi runtime image path：

```text
wechat/images/particle-library/{category}/
```

同时创建 runtime helper：

```text
wechat/src/assets/particles/{category}.js
```

helper 使用 `images/...` texture paths。

### 标准用法

```bash
node scripts/copy-wechat-particle-category.js --project-root wechat --category smoke
```

### 标准粒子资产规则

新的 Pixi 粒子工作遵守 `skill-wechat-minigame-pixi-particles`：

```text
source material: user-assets/particle-library/{category}/
runtime PNGs: wechat/images/particle-library/{category}/
runtime paths: images/particle-library/{category}/{fileName}.png
optional runtime data helper: wechat/src/assets/particles/{category}.js
```

不要把整套粒子库复制进 `/wechat`。

## sharp spritesheet cropper

### 工具类型

WeChat asset preprocessing tool。

### 安装状态

已安装。

### 本地路径

- 工具目录：`agent-tools/wechat/spritesheet-cropper`
- CLI 脚本：`agent-tools/wechat/spritesheet-cropper/scripts/spritesheet-cropper.js`
- 验证脚本：`agent-tools/wechat/spritesheet-cropper/scripts/validate-animation-assets.js`
- 依赖 manifest：`agent-tools/wechat/spritesheet-cropper/package.json`

### 使用场景

当选中的 skill 需要时，用于 WeChat Mini Game 图片预处理：

- 读取 PNG 尺寸
- crop rectangles
- trim edges
- 验证 grid alignment
- 输出 cropped PNGs

Pixi4 animation 默认 runtime image 输出：

```text
wechat/images/animations/{animationName}/frames/*.png
```

可选 runtime data helpers 放在：

```text
wechat/src/assets/animations/{animationName}.js
```

Runtime texture paths 必须使用 `images/...`，并解析到真实存在的 `wechat/{runtimePath}` 文件。不要输出 Pixi6 atlas/data-module runtime packages。

### 输出边界

被选中的 Pixi 子 skill 负责确切输出契约。

不要输出 generated runtime assets 到：

- `wechat/js`
- 随机平铺目录
- agent document 目录

### 验证

```bash
cd agent-tools/wechat/spritesheet-cropper
npm run check
```

## 默认决策

- WeChat 初始化，先检查 `agent-documents/WECHAT.md`、`agent-documents/WECHAT-INIT.md` 和本文档。
- WeChat build/preview/upload，先检查 `/wechat/package.json`、`agent-documents/WECHAT.md` 和 `agent-documents/Deploy/`。
- WeChat Mini Program 开发读取 `agent-documents/MINIAPP.md`。
- WeChat Mini Game 开发读取 `agent-documents/MINIGAME.md`。
- Pixi 工作先路由到 `skill-wechat-minigame-pixi`。
- 新 Mini Game 项目壳 setup 和 Pixi4 baseline sync 使用 `minigame init`。

## 不重复安装

- 如果本文档中的工具可以处理任务，不要安装重复工具。
- 如果必需工具缺失、未登记、损坏或未文档化，停止并询问 Owner，再安装新工具。
