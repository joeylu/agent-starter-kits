# MINIGAME.md

## 目的

这是 WeChat Mini Game 工作的类型专属规则集。

它只在 `WECHAT.md` 检测到 `/wechat/game.json` 后适用。
如果 `WECHAT.md` 检测到 Mini Program，不要把本文档作为实现标准。

## 硬入口规则

当 `WECHAT.md` 检测到 Mini Game 时，必须在 Mini Game 设计、源码编辑、初始化、重构、测试、预览、上传或部署工作前读取本文档。

如果本文档缺失或不可读，停止。

## 文档边界

本文档拥有 Mini Game 架构和运行时约束。

它不负责：

- 项目类型检测；使用 `WECHAT.md`
- Pixi6 初始化和技能前置路由；使用 `bootstrap.pixi.md`
- 具体动画工作流；使用选中的动画技能
- 具体粒子工作流；使用选中的粒子技能
- 本地工具使用细节；使用 `agent-tools/TOOLS_WECHAT.md`
- 部署凭证和发布步骤；使用 `agent-documents/Deploy/`

## 项目边界

所有真实 Mini Game 项目文件都位于：

- `/wechat`

所有 agent 文档都位于：

- `/agent-documents`

不要在 `/wechat` 内创建备注、README、流程文档、总结或 agent 工作流文件。

## Mini Game 身份

Mini Game 是运行时驱动，不是页面驱动。

标准信号：

- `/wechat/game.json`
- `/wechat/game.js`
- canvas 或 WebGL 渲染
- 游戏生命周期
- 资源加载
- 输入处理
- update 和 render 流程

除非 Owner 明确改变项目类型，否则不要引入 `app.json`、WXML pages、WXSS page layouts、`Page`、`Component` 或 Mini Program 路由架构。

## 文件结构规则

Mini Game 工作必须保持所有权明确：

- `game.json` 拥有 Mini Game 配置。
- `game.js` 只拥有入口启动。
- 玩法逻辑不得堆进 `game.js`。
- 可行时，渲染代码应与游戏状态规则分离。
- 当多个功能消费输入时，输入处理必须集中管理。
- 资源加载必须有一个明确 owner。
- 存档数据和设置必须有一个明确 owner。

推荐源码所有权：

- `src/core`：boot、loop、lifecycle、共享运行时协调
- `src/scenes`：scene 层流程
- `src/systems`：input、collision、audio、animation 和其他 update 系统
- `src/entities`：游戏对象
- `src/rendering`：canvas 或 WebGL 渲染
- `src/assets`：manifest 和加载 helper
- `src/storage`：存档数据和设置

已有结构时，使用现有结构。

## 运行时规则

Mini Game 代码必须使用 WeChat Mini Game 运行时模型：

- 使用 `game.js` 作为入口点
- 使用 `wx.*` API 访问平台能力
- 不要假设浏览器 DOM API、HTML element、CSS layout 或浏览器路由
- 不要假设 Mini Program 页面生命周期
- 在 WeChat npm build path 验证前，不要假设 npm packages 可在运行时使用

不要添加需要 DOM layout、Node runtime API、native module 或不受支持 global 的依赖。

## Pixi6 规则

Pixi6 只允许在 `WECHAT.md` 初始化门控通过后使用。

Pixi6 setup 读取：

- `agent-documents/bootstrap.pixi.md`

Pixi runtime 规则：

- 安装 `pixi.js`，永远不要安装 `pixi`
- 通过 `/wechat/js/vendor/pixi-runtime.js` 导入 Pixi
- 不要从 `pixi.js` 做 bare runtime imports
- 不要手工复制 Pixi dist files 到 `/wechat/js`
- 除非共享 baseline 被有意升级，否则不要使用 Pixi 7/8-only APIs
- runtime dependency 或 build pin 变更后重新运行 `npm run build:npm`
- 把 `parse js file ... failed` 当作 build 失败
- runtime dependency 变更后，清理 WeChat DevTools compile/npm 缓存，再信任模拟器结果

如果 runtime 报告 module resolution、unsafe-eval、WebGL 或 local image shape 错误，先检查 Pixi 初始化路径，再改动画、粒子或场景逻辑。

## 游戏循环规则

必须只有一个主 update 和 render loop。

规则：

- 保持 loop ownership 明确
- 对 frame-dependent simulation 使用 delta time
- 分离 update 和 render 职责
- 不要创建多个未协调的 timer 或 animation loop
- game hidden 时暂停或降低昂贵工作
- game 回到前台时安全恢复

每帧热路径必须避免不必要分配、重复资源查找和重复对象创建。

## Canvas 和渲染规则

渲染必须按移动端 WeChat runtime 约束设计。

规则：

- 明确处理 device pixel ratio
- 明确处理 canvas size changes
- 保持 draw order 确定
- 首次使用前 preload 必需 assets
- 必需 assets 加载失败时，提供 blocking state 或 fallback

不要依赖 CSS 定位游戏内容。

## 输入规则

Input 必须先 normalized，再被 gameplay systems 消费。

规则：

- 集中注册 touch input
- 在一个地方把 raw touch data 转为 game-space coordinates
- 避免同一 scene 或 system 的重复 listener
- scene 销毁或 inactive 时移除或禁用 listener

输入代码不得绕过所属 system 或 scene 直接修改无关 game state。

## 资源规则

Assets 必须作为 runtime resources 管理。

规则：

- 保持 asset paths 稳定且明确
- preload 当前 scene 所需 assets
- 避免在 frame-sensitive gameplay 中加载大型 assets
- 添加 image、audio、font 或大型 data file 时，让 package size 影响可见
- 不要添加 runtime code 未使用的 decorative assets

### 帧动画包契约

生成的 Pixi 帧动画资源包必须位于：

```text
/wechat/user-assets/animations/{animationName}/
```

每个 package 必须包含：

```text
/wechat/user-assets/animations/{animationName}/{animationName}.png
/wechat/user-assets/animations/{animationName}/{animationName}.json
/wechat/user-assets/animations/{animationName}/{animationName}-data.js
```

禁止输出位置：

- `/wechat/images`
- `/wechat/js`
- 没有 `/animations/{animationName}/` 的 `/wechat/user-assets`
- 任何把无关 atlas PNG、JSON、`*-data.js` 混在一起的平铺文件夹

生成或修改帧动画资源包后运行：

```bash
node agent-tools/wechat/spritesheet-cropper/scripts/validate-animation-assets.js --name {animationName}
```

## 状态和存档规则

Game state 和 persisted save data 必须分开。

规则：

- transient runtime state 留在 memory 中
- persisted data 使用明确 schema 和 versioning
- persisted keys 必须使用项目专属前缀
- save writes 必须有明确意图，不要每帧写入
- corrupted 或 missing save data 必须安全 fallback
- 永远不要把 secrets 存在 client-side storage

可行时，gameplay rules 应能在不依赖 rendering 的情况下测试。

## 音频规则

Audio 必须感知 lifecycle。

规则：

- 可行时 preload 常用 audio
- game hidden 时按需 stop 或 pause audio
- 不要创建无限 audio instances
- 区分 music、ambient sound 和 short effects

Audio failure 不得导致 core gameplay 崩溃。

## 性能规则

Mini Game performance 工作从 frame stability 开始。

规则：

- 保持 frame loop 小
- 避免每帧 JSON 解析、路径解析和大型对象创建
- 高频 systems 中，在能实质减少 churn 时复用 objects
- input response 期间避免同步重活
- 添加复杂 optimization layers 前先测量

除非 Owner 明确批准，或项目已经使用，否则不要添加 framework 或 engine。

## 测试和验证规则

对 Mini Game 改动，验证最小有用范围：

- 如果配置了 syntax 和 lint checks，运行它们
- Pixi 或 runtime npm 依赖变更时，在 preview 前运行 `npm run build:npm`
- runtime wiring 变更时，通过 preview 验证 game startup
- 添加或移动 assets 时，验证 asset load paths
- pause、resume、audio、storage 或 networking 变更时，验证生命周期行为
- 只有 Owner 要求 upload 时，才运行 upload command

不要声称已提审或最终发布。这些仍由人类在网页控制台操作。
