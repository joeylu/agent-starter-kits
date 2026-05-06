# WECHAT-INIT.md

## 目的

这是 WeChat 初始化 SOP。

它面向低能力 agent 编写，必须严格执行。

它负责：

- 项目壳检查
- 基于文件的项目类型检测
- 通用初始化检查
- Mini Program 初始化移交
- Mini Game 初始化移交
- Mini Game Pixi4 基线检查
- `PASS` 和 `BLOCKED` 输出

它不负责功能实现、动画逻辑、粒子逻辑、preview 发布策略、upload 发布策略或网页控制台提交流程。

## 入口规则

读取 `WECHAT.md` 后、操作 `/wechat` 前，读取本文档。

以下场景都必须运行本门控：

- 初始化
- 修复工作
- build-ready setup
- preview setup
- upload setup
- 任何 `/wechat` 下的功能开发

功能工作只有在本门控报告 `PASS` 后才能开始。

## 根目录规则

WeChat 项目根目录是：

```text
/wechat
```

如果 `/wechat` 缺失：

```text
BLOCKED
Missing: /wechat
Why: the human must create the WeChat DevTools project shell first.
Owner action: create the project shell in WeChat DevTools under /wechat.
```

不要伪造微信开发者工具项目壳。

## 项目类型检测

只从文件检测类型。

规则：

- `/wechat/game.json` 存在且 `/wechat/app.json` 不存在：WeChat Mini Game
- `/wechat/app.json` 存在且 `/wechat/game.json` 不存在：WeChat Mini Program
- 两者都存在：`BLOCKED`
- 两者都不存在：`BLOCKED`

冲突输出：

```text
BLOCKED
Missing: valid single project type signal
Why: /wechat/game.json and /wechat/app.json cannot both exist.
Owner action: keep only the file that matches the real WeChat project type.
```

缺少壳输出：

```text
BLOCKED
Missing: /wechat/game.json or /wechat/app.json
Why: the folder is not a recognizable WeChat DevTools project shell.
Owner action: create a Mini Game or Mini Program shell in WeChat DevTools.
```

不要从用户措辞猜项目类型。

## 通用必需检查

Mini Program 和 Mini Game 都必须有：

```text
/wechat/project.config.json
/agent-documents/Deploy/CREDENTIAL.md
/agent-documents/Deploy/DEPLOY.md
```

任一缺失或不可读，报告 `BLOCKED`。

不要编造凭证。
不要编造 AppID。
不要编造 private-key path。
不要暴露 private-key 内容。

## 通用清洁度检查

`/wechat` 内不得包含 agent 工作流文档。

禁止示例：

```text
/wechat/README.md
/wechat/agent-documents/
/wechat/AGENTS.md
process notes
summaries
workflow docs
```

如果发现，报告 `BLOCKED`，除非 Owner 明确说明该文件是真实运行时资产。

## 工具检查

运行 WeChat 工具前，读取：

```text
agent-tools/TOOLS.md
agent-tools/TOOLS_WECHAT.md
```

如果已登记本地工具覆盖任务，使用该工具。

如果已登记 Mini Game initializer 安装、生成、导入或要求 Pixi6、npm Pixi、`@pixi/unsafe-eval`、`miniprogram_npm` 或 `js/vendor/pixi-runtime.js` 作为运行时基线，不要把它用于 Pixi4 基线。报告 `BLOCKED`：initializer is not upgraded。

未经 Owner 批准，不要安装替代工具。

## Mini Program 路线

Mini Program：

1. 读取 `agent-documents/MINIAPP.md`
2. 不读取 Mini Game 规则
3. 不创建 `game.json`
4. 不引入 Mini Game runtime 架构
5. 完成通用必需检查
6. 报告 `PASS` 或 `BLOCKED`

Mini Program 初始化细节归 `MINIAPP.md`。

## Mini Game 路线

Mini Game：

1. 读取 `agent-documents/MINIGAME.md`
2. 不读取 Mini Program 规则
3. 不创建 `app.json`
4. 使用官方 Pixi4 本地文件基线
5. 完成通用必需检查
6. 对初始化或修复请求，运行登记的本地 initializer：

```bash
node scripts/init-wechat-minigame.js --project-root wechat
```

7. 功能开发时，不要重新同步已经有效的基线；若基线检查失败，报告 `BLOCKED` 并让 Owner 运行或修复 initializer
8. 完成 Mini Game 基线检查
9. 报告 `PASS` 或 `BLOCKED`

Pixi 功能开发必须经过 WeChat skill routing gate 选中的 Pixi skill。

## Mini Game Pixi4 基线

Mini Game 初始化必须使用官方 demo 风格的 Pixi4 本地文件路线：

```text
wechat/game.js
wechat/game.json
wechat/project.config.json
wechat/libs/weapp-adapter.js
wechat/libs/pixi.js
wechat/src/index.js
wechat/src/config.js
wechat/src/scenes/
wechat/src/base/
wechat/src/common/
wechat/images/
wechat/user-assets/
```

`wechat/user-assets/` 只作为兼容/暂存目录；Pixi runtime 图片必须使用 `wechat/images/` 和 `images/...` 路径。

启动路线：

```text
game.js
  -> import ./libs/weapp-adapter
  -> import ./src/index.js
  -> new App()
  -> App extends PIXI.Application
  -> import * as PIXI from ../libs/pixi.js
```

Pixi 基线：

```text
wechat/libs/pixi.js
PIXI.VERSION = 4.8.2
```

不要替换成 Pixi6、Pixi7、Pixi8、npm Pixi 或浏览器 DOM Pixi 教程。

## Mini Game 禁止 PASS 项

以下文件和包不是 Mini Game Pixi 初始化 PASS 必需项：

```text
wechat/miniprogram_npm
wechat/js/vendor/pixi-runtime.js
wechat/node_modules/@pixi/unsafe-eval
```

不要只因为缺少这些项就报告 `BLOCKED`。
不要把它们创建为 Pixi4 基线的一部分。

## Mini Game 禁止动作

不要：

- 安装 `pixi.js` 作为 Pixi runtime 基线
- 安装 `@pixi/unsafe-eval`
- 生成 `wechat/js/vendor/pixi-runtime.js`
- 要求 `wechat/miniprogram_npm` 作为 Pixi 初始化 PASS 条件
- 在运行时代码中从 npm 导入 Pixi
- 手工把 Pixi dist 文件复制到随机目录
- 引入官方 demo 的 lockstep、room、battle、invite、login 或 ad 业务逻辑

只能使用官方 demo 风格启动架构和本地 Pixi4 基线。

## Mini Game PASS Checklist

只有全部满足才能报告 `PASS`：

- `/wechat` 存在
- `/wechat/game.json` 和 `/wechat/app.json` 只存在一个
- 从 `/wechat/game.json` 检测为 Mini Game
- `/wechat/project.config.json` 存在
- `/wechat/project.config.json` 的 `compileType` 缺失或等于 `game`；如果存在其他值，报告 `BLOCKED`
- 已读取 `agent-documents/MINIGAME.md`
- `agent-documents/Deploy/CREDENTIAL.md` 可读
- `agent-documents/Deploy/DEPLOY.md` 可读
- `/wechat/game.js` 存在
- `/wechat/libs/weapp-adapter.js` 存在
- `/wechat/libs/pixi.js` 存在
- `/wechat/libs/pixi.js` 包含 Pixi version marker `4.8.2`
- `/wechat/src/index.js` 存在
- `/wechat/game.js` import `./libs/weapp-adapter`
- `/wechat/game.js` import `./src/index.js`
- `/wechat/game.js` 调用 `new App()`
- `/wechat/src/index.js` 从 `../libs/pixi.js` 导入 Pixi
- `/wechat/src/index.js` 定义 `App extends PIXI.Application`
- `/wechat/src/config.js` 存在
- `/wechat/src/scenes/` 存在
- `/wechat/src/base/` 存在
- `/wechat/src/common/` 存在
- `/wechat/images/` 存在
- `/wechat/user-assets/` 只作为兼容/暂存目录存在
- `/wechat` 不含禁止的 agent 工作流文档

任一失败，报告 `BLOCKED`。

## Mini Program PASS Checklist

只有全部满足才能报告 `PASS`：

- `/wechat` 存在
- `/wechat/game.json` 和 `/wechat/app.json` 只存在一个
- 从 `/wechat/app.json` 检测为 Mini Program
- `/wechat/project.config.json` 存在
- 已读取 `agent-documents/MINIAPP.md`
- `agent-documents/Deploy/CREDENTIAL.md` 可读
- `agent-documents/Deploy/DEPLOY.md` 可读
- `/wechat` 不含禁止的 agent 工作流文档

任一失败，报告 `BLOCKED`。

## PASS 输出

使用以下形状：

```text
PASS
Project type: WeChat Mini Game
Checked: project shell, project.config.json, deploy docs, type document, initialization baseline, /wechat cleanliness.
Next: feature work may start after WeChat skill routing.
```

或：

```text
PASS
Project type: WeChat Mini Program
Checked: project shell, project.config.json, deploy docs, type document, /wechat cleanliness.
Next: feature work may start after WeChat skill routing.
```

## BLOCKED 输出

使用以下形状：

```text
BLOCKED
Missing: <exact missing or conflicting item>
Why: <why this prevents initialization or feature work>
Owner action: <what the Owner must provide or decide>
```

报告 `BLOCKED` 后停止。

## 初始化完成规则

初始化 PASS 表示项目有有效壳、类型路线、必需文档和必需基线文件。

它不表示 preview 已打开。
它不表示 upload 已执行。
它不表示提审或最终发布已完成。

Preview 和 upload 必须遵守：

```text
agent-documents/Deploy/DEPLOY.md
```

提审和最终发布仍由人类在网页控制台完成。
