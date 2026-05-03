# PROJECT.md

## 目的

这是项目级启动文档。

它的职责是把 agent 路由进入 WeChat 规则链，而不是重复展开 WeChat、Mini Game、Pixi、部署或技能细节。

## 文档所有权

- `AGENTS.md`：身份加载、写入权限、工具索引入口、隐式技能加载、dev-note 规则。
- `PROJECT.md`：项目级入口、文档所有权、仓库边界。
- `agent-documents/WECHAT.md`：WeChat 初始化、项目类型检测、技能路由门控、部署文档检查。
- `agent-documents/MINIAPP.md`：Mini Program 架构、运行时、UI、验证规则。
- `agent-documents/MINIGAME.md`：Mini Game 架构、运行时、资源、循环、验证规则。
- `agent-documents/bootstrap.pixi.md`：Mini Game Pixi6 初始化，以及动画和粒子工作的技能路由前置指引。
- `.agents/skills/Wechat/`：路由选中技能后的具体 WeChat 技能工作流。
- `agent-tools/`：只登记本地工具。

## 启动顺序

在 `AGENTS.md` 加载 `SOUL.md` 和 `IDENTITY.md` 后，agent 必须：

1. 读取本文件
2. 立即读取 `agent-documents/WECHAT.md`
3. 让 `WECHAT.md` 根据 `/wechat` 下的文件检测项目类型
4. 读取匹配的类型文档：`MINIAPP.md` 或 `MINIGAME.md`
5. 完成 `WECHAT.md` 要求的初始化门控
6. 只有门控报告 `PASS` 后才能继续；若报告 `BLOCKED`，必须停止

不要根据文件夹名或用户说法猜测项目类型。

## 仓库边界

真实 WeChat 项目根目录是：

- `/wechat`

Agent 文档目录是：

- `/agent-documents`

部署文档目录是：

- `/agent-documents/Deploy`

规则：

- 不要创建另一个 `agent-documents` 文件夹
- 不要创建 `/wechat/agent-documents`
- 不要在 `/wechat` 内创建 README、备注、流程文档、总结或 agent 工作流文件
- 不要编造凭证、AppID、AppSecret、private-key 路径、发布责任人或项目类型

## 工作模式

预期工作流是：

- 人类先在 WeChat DevTools 中创建 `/wechat` 项目壳
- 项目壳存在后，agent 从 VSCode 中初始化并开发
- 初始化通过后，可以自动化构建工作
- 预览和上传遵循 `agent-documents/Deploy/DEPLOY.md`
- 提审和最终发布仍由人类在网页控制台完成

## 语言和运行时

除非现有项目证明不是这样：

- 使用 JavaScript 作为主要源码语言
- 未经人类明确批准，不引入编译层
- 只使用 Node.js LTS

## 冲突规则

如果文档之间有重叠：

- `SOUL.md` 和 `IDENTITY.md` 控制 agent 状态、语气和写入权限
- `WECHAT.md` 在 WeChat 初始化和路由上优先
- `MINIAPP.md` 或 `MINIGAME.md` 在类型专属实现上优先
- 路由选中的技能在其具体工作流上优先
- Owner 的直接指令优先，除非它与更高优先级的安全或状态规则冲突
