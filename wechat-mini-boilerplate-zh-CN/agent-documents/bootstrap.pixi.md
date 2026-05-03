# bootstrap.pixi.md

## 目的

本文档是 Mini Game Pixi6 启动和技能路由前置指引。

它在选择具体动画或粒子技能前读取。
技能选中后，具体工作流归该技能所有，不得再路由回本文档。

## 何时读取

当 `WECHAT.md` 检测到 Mini Game，且请求涉及以下内容时读取本文档：

- Pixi6 初始化
- Pixi runtime 的 `build:npm`
- `pixi.js` 或 `@pixi/unsafe-eval`
- 帧动画
- spritesheets 或原始 PNG 网格
- 粒子效果
- 可能是动画或粒子的模糊视觉效果

不要把本文档用于 Mini Program 工作。

## Pixi6 初始化契约

Pixi6 初始化必须先有有效的 Mini Game DevTools 项目壳：

- `/wechat/game.json`
- `/wechat/project.config.json`

如果这些文件缺失，停止并返回 `WECHAT.md`。
不要伪造 DevTools 项目壳。

运行工具前，读取：

- `agent-tools/TOOLS.md`
- `agent-tools/TOOLS_WECHAT.md`

Mini Game full-init 优先使用已登记初始化器：

```bash
node scripts/init-wechat-minigame.js --project-root wechat
```

Full-init 必须让项目达到 build-ready：

- `/wechat/package.json` 声明 Pixi6 dependencies
- `/wechat/node_modules/pixi.js/package.json` 存在
- `/wechat/node_modules/@pixi/unsafe-eval/package.json` 存在
- `/wechat/package.json` 包含 `scripts.build:npm`
- `/wechat/scripts/build-npm.js` 存在
- `npm run build:npm` 成功
- `/wechat/miniprogram_npm` 存在
- `/wechat/js/vendor/pixi-runtime.js` 存在

版本来源是：

- `agent-tools/wechat/minigame-init/versions.json`

不要安装 `pixi`。
安装 `pixi.js`。
不要把固定版本替换成 `latest`。

## 运行时适配器契约

运行时代码必须通过以下文件导入 Pixi：

```text
/wechat/js/vendor/pixi-runtime.js
```

规则：

- 不要从 `pixi.js` 做 bare runtime import
- 不要把 Pixi dist file 手工复制到 `/wechat/js`
- 不要在同一个项目中混用 Pixi adapter path
- 除非共享 baseline 升级，否则不要使用 Pixi 7/8 启动模式

如果 `pixi.js`、`@pixi/unsafe-eval`、`miniprogram-ci`、`less` 或运行时依赖树变更，运行：

```bash
cd wechat && npm run build:npm
```

然后清理 WeChat DevTools compile/npm 缓存，再信任运行时结果。

## 启动所有权

Pixi Mini Game 启动路径必须保持所有权明确：

- `game.js` 在 Pixi 场景代码加载前初始化 Mini Game 入口和 root canvas。
- 如果项目有 `js/render.js` 层，它拥有 root canvas 注册和 canvas 辅助方法。
- 如果项目有 `js/main.js` 层，它拥有 Pixi 应用创建、root canvas 解析、安全 runtime stub 和场景启动。

创建 `new PIXI.Application(...)` 前，验证：

- root canvas 存在
- root canvas 可以返回 `webgl` 或 `experimental-webgl`，或项目有已明确验证的等价方案
- 任何 `PIXI.settings.ADAPTER.createCanvas()` override 都能为 Pixi 探测返回支持 WebGL 的 canvas
- adapter code 没有锁死为 2D-only canvas shape
- 运行时代码没有直接把 `clientWidth` 或 `clientHeight` 赋值到真实 host canvas 上
- 当原生 `document.createElement` 或 `document.createElementNS` 已存在时，运行时代码不会覆盖它们

如果 WebGL 启动失败，先修 Pixi 启动路径，再处理动画、粒子或场景逻辑。

## 本地图片和 Atlas 契约

Mini Game 中的本地 Pixi 素材应使用已验证的 Mini Game 图片路径：

- 使用 `wx.createImage()` 加载本地图片
- 在 `BaseTexture.from(image)` 前应用 image shim
- 使用同级 `*-data.js` CommonJS atlas module，而不是由运行时直接加载 `.json`
- 用 `BaseTexture` 加 `new PIXI.Spritesheet(...)` 组装 atlas
- 不要默认使用浏览器 Pixi loader 处理本地 atlas package

Image shim 必须覆盖：

- `globalThis.HTMLImageElement`
- `globalThis.Image`
- `GameGlobal.HTMLImageElement`（如果 `GameGlobal` 存在）
- `GameGlobal.Image`（如果 `GameGlobal` 存在）
- image `complete`
- image `naturalWidth`
- image `naturalHeight`

## 技能路由提示

本节只用于选择正确技能。
技能选中后，不要在本文档中继续实现。

当可见目标是以下内容时，选择 `skill-wechat-minigame-pixi6-animation`：

- 帧动画
- 循环动画
- spritesheet 动画
- 吉祥物、角色、道具、物体、图标或 UI 元素的帧变化
- 为动画打包原始 PNG 网格

当可见目标是以下内容时，选择 `skill-wechat-minigame-pixi6-particles`：

- 粒子
- 烟雾
- 火焰
- 水花
- 火花
- 拖尾
- 雪
- 雨
- 尘土
- 碎片
- 发光微粒
- 光环类发射效果

如果用户提供原始 PNG 网格、spritesheet、sequence frame、`3x3`、`{cols}x{rows}`，或要求从原始素材生成 loop，选中的技能必须先运行自身的 raw PNG 描述和 `CONFIRM_DESCRIPTION` 流程，再接运行时接入。

如果请求模糊，按可见目标判断：

- 主体自身换帧是动画
- 主体周围、身后、身前或拖尾发射出的痕迹是粒子

如果仍然模糊，编辑前问一个聚焦问题。

## 停止条件

出现以下情况时停止并报告 `BLOCKED`：

- Mini Game DevTools 项目壳文件缺失
- Pixi runtime 工作所需 Pixi 依赖或 build output 缺失
- `npm run build:npm` 失败
- WebGL root-canvas probing 失败
- 本地 atlas package 位于禁止位置
- 原始 PNG 网格需要描述确认，且最新用户消息不包含 `CONFIRM_DESCRIPTION`
