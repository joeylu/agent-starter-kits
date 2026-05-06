# MINIGAME.md

## 目的

这是 WeChat Mini Game 工作的类型专属规则。

仅当 `WECHAT.md` 检测到以下文件时适用：

```text
/wechat/game.json
```

如果 `WECHAT.md` 检测到 Mini Program，不要使用本文档。

## 硬入口规则

当 `WECHAT.md` 检测到 Mini Game 时，在任何设计、源码编辑、初始化、重构、测试、preview、upload 或部署工作前，必须读取本文档。

如果本文档缺失或不可读，停止并报告 `BLOCKED`。

## 文档边界

本文档负责 Mini Game 通用架构和运行时约束。

它不负责：

- 项目类型检测；使用 `WECHAT.md`
- 初始化 SOP；使用 `WECHAT-INIT.md`
- Pixi 启动、Pixi API、Pixi 动画、Pixi 粒子、Pixi UI 或 Pixi 场景实现
- 本地工具细节；使用 `agent-tools/TOOLS_WECHAT.md`
- 部署凭证和发布步骤；使用 `agent-documents/Deploy/`

Pixi 相关开发必须进入 Pixi 主 skill：

```text
.agents/skills/Wechat/skill-wechat-minigame-pixi/
```

如果该 skill 不存在或不可读，报告 `BLOCKED`，不要自由实现 Pixi 行为。

## 项目边界

真实 Mini Game 项目文件都在：

```text
/wechat
```

Agent 文档都在：

```text
/agent-documents
```

不要在 `/wechat` 中创建备注、README、流程文档、总结、agent instruction 或工作流文档。

不要创建：

```text
/wechat/agent-documents
```

## Mini Game 身份

Mini Game 是运行时驱动，不是页面驱动。

标准信号：

- `/wechat/game.json`
- `/wechat/game.js`
- canvas 或 WebGL 渲染
- 游戏生命周期
- 资源加载
- 输入处理
- update / render flow

除非 Owner 明确改变项目类型，不要引入 Mini Program 架构。

Mini Game 中禁止：

- `app.json`
- WXML pages
- WXSS page layout
- `Page`
- `Component`
- Mini Program route architecture

## 入口规则

`game.js` 只负责启动。

规则：

- 保持 `game.js` 小
- 从 `game.js` 初始化 runtime
- 不要把 gameplay logic 堆进 `game.js`
- 不要把 scene、entity、asset manifest、save、large UI logic 放进 `game.js`
- 除非现有项目已有模式，不要创建第二入口文件

## 推荐结构

已有清晰结构时，沿用现有结构。

新建或修复 Mini Game 结构时，优先使用：

```text
wechat/src/index.js
wechat/src/config.js
wechat/src/scenes/
wechat/src/base/
wechat/src/common/
wechat/src/systems/
wechat/src/entities/
wechat/src/assets/
wechat/src/storage/
wechat/images/
wechat/audio/
wechat/libs/
```

职责：

- `src/index.js` 负责 `game.js` 之后的 runtime 启动
- `src/config.js` 负责 device、canvas、runtime 配置
- `src/scenes/` 负责场景级流程
- `src/base/` 负责可复用基类
- `src/common/` 负责共享工具和常量
- `src/systems/` 负责输入、碰撞、音频、动画协调等 update systems
- `src/entities/` 负责 gameplay objects
- `src/assets/` 负责 manifests 和 loading helpers
- `src/storage/` 负责存档和设置
- `images/` 负责 runtime image assets
- `audio/` 负责 runtime audio assets
- `libs/` 负责项目规则批准的 checked-in runtime libraries

## 运行时规则

Mini Game 代码必须使用微信小游戏运行时模型。

规则：

- 使用 `wx.*` API 调用平台能力
- 不假设浏览器 DOM API
- 不假设 HTML elements
- 不假设 CSS layout
- 不假设 browser routing
- 不假设 Mini Program page lifecycles
- 不假设 client code 中存在 Node.js runtime API
- 不添加依赖 DOM layout、Node runtime API、native modules 或不支持 globals 的包

非 Pixi 开发不得引入其他 engine 或 framework，除非 Owner 明确批准或现有项目已经使用。

## Game Loop 规则

只能有一个主 update/render loop。

规则：

- loop ownership 必须明确
- 区分逻辑更新和渲染工作
- frame-dependent simulation 使用 delta time
- 不要创建多个不协调的 `setInterval`
- 不要创建多个不协调的 `requestAnimationFrame`
- 游戏隐藏时暂停或降低昂贵工作
- 回到前台时安全恢复

Frame hot path 避免不必要 allocation、重复 asset lookup、重复 path resolution 和重复 object construction。

## 渲染规则

渲染必须适配移动微信运行时限制。

规则：

- 明确处理 device pixel ratio
- 明确处理 canvas size 变化
- draw order 必须确定
- 首次使用前 preload 必需 visual assets
- 必需资源加载失败时提供 blocking state 或 fallback
- 不依赖 CSS 定位游戏内容

Renderer-specific API 规则属于选中的 rendering skill 或实现文档。

## 输入规则

输入必须先规范化，再交给 gameplay systems。

规则：

- 集中注册 touch input
- 在一个地方把 raw touch data 转成 game-space coordinates
- 避免同一 scene 或 system 重复监听
- scene 销毁或 inactive 时移除/禁用监听
- 不让 input handler 直接修改无关 game state

多个系统需要输入时，通过 owning input system 或 scene 路由。

## 资源规则

Assets 必须作为 runtime resources 管理。

规则：

- image、audio、font、data 路径稳定明确
- 不在 runtime 猜路径
- preload 当前 scene 必需 assets
- 避免在 frame-sensitive gameplay 中加载大资源
- 添加图片、音频、字体或大数据时暴露包体影响
- 不添加 runtime code 未使用的装饰资源
- 不把 agent workflow docs 存进 `/wechat`

生成或用户提供的 runtime assets 应放在项目拥有的路径，例如：

```text
wechat/images/
wechat/audio/
```

Pixi 视觉工作中，runtime image files 必须使用 `wechat/images/`，代码使用 `images/...` 路径。仓库根目录 `user-assets/` 只是源素材。`wechat/user-assets/` 不是默认 Pixi runtime image path。

Pixi 动画或粒子的确切资产契约归选中的 Pixi 子 skill。

## 状态和存档规则

游戏状态和持久化存档必须分开。

规则：

- transient runtime state 留在内存
- persisted data 使用明确 schema
- schema 可能变化时使用 versioning
- persisted keys 使用项目专属前缀
- save writes 必须有意图，不要每帧写
- corrupted 或 missing save data 必须安全处理
- 不要在客户端 storage 存 secrets

可行时，gameplay rules 应可不依赖 rendering 测试。

## 音频规则

音频必须感知生命周期。

规则：

- 常用音频尽量 preload
- 游戏隐藏时按需 stop 或 pause audio
- 不创建无限 audio instances
- music、ambient sound、short effects 分开
- audio failure 不应让核心 gameplay 崩溃

## 性能规则

Mini Game 性能优先关注 frame stability。

规则：

- frame loop 保持小
- 避免每帧 JSON parsing
- 避免每帧 path resolution
- 避免每帧大量 object creation
- 高频系统中对象复用能明显降低 churn 时才引入
- 避免 input response 中同步重活
- 添加复杂优化层前先测量

不要添加 framework、rendering engine、physics engine、ECS layer 或 state library，除非 Owner 明确批准或项目已经使用。

## Pixi 边界

Pixi 只允许通过项目批准的 Pixi 主 skill。

Pixi work 包括：

- Pixi startup
- Pixi version selection
- Pixi library path
- Pixi scene setup
- Pixi UI
- Pixi text effects
- frame animation
- spritesheets
- particle effects
- 用 Pixi objects 实现的 visual effects

必需路线：

```text
WECHAT.md
  -> MINIGAME.md
  -> .agents/skills/Wechat/skill-wechat-minigame-pixi/
  -> selected Pixi child skill when needed
```

不要凭记忆实现 Pixi 行为。
不要把浏览器 Pixi 教程当项目规则。
不要替换项目批准的 Pixi baseline。

## 测试和验证规则

Mini Game 变更验证最小有效面。

按变更选择检查：

- changed JavaScript files 的 syntax checks
- 已配置时运行 lint checks
- runtime wiring 变化时做 startup check
- 添加或移动 assets 时做 asset path checks
- touch handling 变化时做 input checks
- pause、resume、audio、storage、networking 变化时做 lifecycle checks
- 只有需要或被要求时才运行 preview command
- 只有 Owner 要求 upload 时才运行 upload command

不要声称提审或最终发布完成。

提审和最终发布仍由人类在网页控制台完成。

## 部署边界

Preview 和 upload 规则位于：

```text
agent-documents/Deploy/DEPLOY.md
```

Preview 或 upload 前：

- 读取 `agent-documents/Deploy/DEPLOY.md`
- 读取 `agent-documents/Deploy/CREDENTIAL.md`
- 不要编造 version numbers
- 不要编造 version descriptions
- 不要编造 release ownership
- 不要暴露 private-key 内容

人类负责：

- 提审
- 最终发布
- 网页控制台账号动作
