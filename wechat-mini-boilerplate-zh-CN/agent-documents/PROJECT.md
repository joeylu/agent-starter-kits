# PROJECT.md

## 目的

这是项目级启动文档。

它只负责把 agent 路由进 WeChat 规则链，不重复展开 WeChat、小程序、小游戏、Pixi、部署或技能细节。

## 文档归属

- `AGENTS.md`：身份加载、写入权限、工具索引入口、隐式技能加载、dev-note 规则。
- `PROJECT.md`：项目级入口、文档归属、仓库边界。
- `agent-documents/WECHAT.md`：WeChat 入口门控、项目类型检测、初始化移交、技能路由门控。
- `agent-documents/WECHAT-INIT.md`：WeChat 初始化 SOP、PASS/BLOCKED 检查、小程序/小游戏初始化路由。
- `agent-documents/MINIAPP.md`：小程序架构、运行时、UI、验证规则。
- `agent-documents/MINIGAME.md`：小游戏通用架构、运行时、资源、循环、验证规则。
- `.agents/skills/Wechat/`：WeChat 路由选中技能后的具体工作流。
- `agent-tools/`：只登记本仓库已有本地工具。

## 启动顺序

`AGENTS.md` 加载 `SOUL.md` 和 `IDENTITY.md` 后，agent 必须：

1. 读取本文档
2. 立即读取 `agent-documents/WECHAT.md`
3. 立即读取 `agent-documents/WECHAT-INIT.md`
4. 只根据 `/wechat/game.json` 或 `/wechat/app.json` 检测项目类型
5. 只读取一个匹配类型文档：`MINIAPP.md` 或 `MINIGAME.md`
6. 完成 `WECHAT-INIT.md` 要求的初始化门控
7. 门控报告 `PASS` 后才能继续；若报告 `BLOCKED`，立即停止

不得从目录名或用户措辞猜测项目类型。

## 仓库边界

真实 WeChat 项目根目录是：

```text
/wechat
```

Agent 文档目录是：

```text
/agent-documents
```

部署文档目录是：

```text
/agent-documents/Deploy
```

规则：

- 不要创建另一个 `agent-documents` 文件夹
- 不要创建 `/wechat/agent-documents`
- 不要在 `/wechat` 内创建 README、备注、流程文档、总结或 agent 工作流文件
- 不要编造凭证、AppID、AppSecret、private-key path、发布负责人或项目类型

## 工作模式

预期流程：

- 人类先在微信开发者工具里把项目壳创建到 `/wechat`
- 项目壳存在后，agent 在 VSCode 等工具中初始化和开发
- 初始化可以在项目壳存在且门控通过后自动执行
- preview 和 upload 遵守 `agent-documents/Deploy/DEPLOY.md`
- 提审和最终发布由人类在网页控制台完成

## 语言和运行时

除非现有项目证明并非如此：

- 主要源码语言使用 JavaScript
- 未经人类明确批准，不引入编译层
- 只使用 Node.js LTS

## 冲突规则

如果文档重叠：

- `SOUL.md` 和 `IDENTITY.md` 控制 agent 状态、语气和写入权限
- `WECHAT.md` 控制 WeChat 入口、类型检测、技能路由
- `WECHAT-INIT.md` 控制初始化顺序、PASS/BLOCKED 输出和初始化检查
- `MINIAPP.md` 或 `MINIGAME.md` 控制类型专属的非 skill 实现规则
- 被选中的 skill 控制其具体工作流
- Owner 直接指令优先，除非与更高优先级安全或状态规则冲突
