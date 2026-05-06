# WECHAT.md

## 目的

这是本仓库的 WeChat 入口门控。

它只负责：

- `/wechat` 根目录边界
- 初始化触发
- 基于文件的项目类型检测
- 移交到 `WECHAT-INIT.md`
- 只移交到一个类型文档
- 初始化通过后的 WeChat 技能路由

它不负责小游戏运行时架构、Pixi 实现细节、动画细节、粒子细节、部署凭证或本地工具内部逻辑。

## 根目录边界

真实 WeChat 项目根目录是：

```text
/wechat
```

部署文档位于：

```text
/agent-documents/Deploy
```

规则：

- 不要猜测其他 WeChat 根目录
- 不要创建另一个 `agent-documents` 文件夹
- 不要创建 `/wechat/agent-documents`
- 不要把 agent 备注、README、流程文档、总结或工作流文档放进 `/wechat`
- 不要编造 AppID、AppSecret、private-key path、发布负责人或项目类型

## 硬停止规则

如果必需门控失败：

1. 停止工作
2. 报告准确缺失项或冲突项
3. 报告 `BLOCKED`
4. blocker 解决后才能继续

不得静默兜底。
不得部分开发。
不得绕过。

## 初始化触发

当用户要求以下内容时，运行本门控：

- `wechat init`
- `初始化`
- `初始化小程序`
- `初始化小游戏`
- `full-init`
- 项目 setup
- build-ready setup
- preview setup
- upload setup
- 任何 `/wechat` 下的功能开发

启动路线是：

```text
PROJECT.md
  -> WECHAT.md
  -> WECHAT-INIT.md
  -> detect project type
  -> MINIAPP.md or MINIGAME.md
```

在 `/wechat` 下做初始化、修复、功能、preview 或 upload 前，先读取 `agent-documents/WECHAT-INIT.md`。

## 项目类型检测

检测只基于文件。

不要从目录名、用户措辞、依赖或代码风格猜测项目类型。

规则：

- 如果 `/wechat/game.json` 和 `/wechat/app.json` 同时存在，停止并报告 `BLOCKED`：项目类型冲突
- 如果 `/wechat/game.json` 存在，项目类型是 **WeChat Mini Game**
- 如果 `/wechat/app.json` 存在，项目类型是 **WeChat Mini Program**
- 如果两者都不存在，停止并报告 `BLOCKED`：缺少微信开发者工具项目壳

必需伴随文件：

```text
/wechat/project.config.json
```

如果 `project.config.json` 缺失，停止并报告 `BLOCKED`。

## 类型文档移交

检测后，只读取一个类型文档：

- Mini Program：`agent-documents/MINIAPP.md`
- Mini Game：`agent-documents/MINIGAME.md`

不要混用 Mini Program 和 Mini Game 规则。

Mini Program 工作不得使用 Mini Game 运行时规则。
Mini Game 工作不得引入 Mini Program 页面架构。

## 初始化移交

`WECHAT-INIT.md` 负责：

- 初始化顺序
- 必需初始化检查
- `PASS` 输出
- `BLOCKED` 输出
- 通用部署文档检查
- Mini Program / Mini Game 初始化路由

只有初始化门控报告 `PASS` 后，功能开发才能继续。

## WeChat 技能路由门控

初始化通过后，WeChat 开发工作要检查本地 WeChat skills：

```text
.agents/skills/Wechat/
```

在选择实现路径、提出技术方案、编辑文件或开始功能工作前：

1. 检查 `.agents/skills/Wechat/` 下每个 `SKILL.md`
2. 先只读取 YAML frontmatter 的 `name` 和 `description`
3. 选择匹配用户顶层可见意图的 skill
4. 遵守选中的 skill
5. 只有没有 skill 匹配时，才不走 WeChat skill

路由规则：

- 按产品意图选择，不按底层实现细节选择
- 窄意图优先于宽泛辅助
- 不要求人类命名 skill
- 不要把 Mini Program 工作路由到 Mini Game-only skill
- 如果没有 skill 匹配，先说明这一点，再普通编码

Mini Game Pixi 路由规则：

- 如果 Mini Game 请求可能涉及 Pixi、视觉效果、sprites、精灵、scenes、场景、canvas rendering、UI、HUD、buttons、文字、文字动效、animation、逐帧动画、序列帧、spritesheets、particles、粒子、烟雾、火焰、水花、溅水、火花、拖尾、雪、雨、灰尘、碎屑、光点或类似可见 Pixi 渲染请求，先加载 `skill-wechat-minigame-pixi`
- 由 `skill-wechat-minigame-pixi` 决定是否进入 `skill-wechat-minigame-pixi-animation` 或 `skill-wechat-minigame-pixi-particles`
- 除非用户明确命名子 skill，或技能系统已经直接调用子 skill，否则不要把 Pixi 子 skill 作为第一路由结果
- 如果 Pixi 子 skill 被直接调用，它第一步仍必须验证 `skill-wechat-minigame-pixi` 基线

回复审计要求：

- 报告 WeChat 技能路由门控已完成
- 报告扫描了哪些 WeChat skills
- 报告选中了哪个 skill，或没有 skill 匹配
- 报告选择原因

一旦选中 WeChat skill，具体工作流由该 skill 负责。

## 最终门控

只有满足以下条件才继续：

- `WECHAT-INIT.md` 报告 `PASS`
- 已读取且只读取一个类型文档
- 功能工作已完成技能路由

否则报告 `BLOCKED` 并停止。
