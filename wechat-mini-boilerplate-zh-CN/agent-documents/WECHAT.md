# WECHAT.md

## 目的

这是本仓库的 WeChat 门控。

它负责：

- `/wechat` 目录和 DevTools 项目壳检查
- Mini Program 与 Mini Game 检测
- 初始化顺序
- WeChat 技能路由
- 移交到 `MINIAPP.md`、`MINIGAME.md`、`bootstrap.pixi.md` 和部署文档

它不负责 Mini Game 运行时架构、Pixi 实现细节、动画实现、粒子实现或本地工具内部逻辑。

## 根目录边界

所有 WeChat 项目检查都使用：

- `/wechat`

部署文档使用：

- `/agent-documents/Deploy`

规则：

- 不要猜测其他项目根目录
- 不要创建另一个 `agent-documents` 文件夹
- 不要创建 `/wechat/agent-documents`
- 不要把 agent 备注、README、流程文档、总结或工作流文档放进 `/wechat`

## 硬停止规则

如果必需门控失败：

1. 停止功能工作
2. 报告准确缺失项
3. 报告 `BLOCKED`
4. 只有 blocker 解决后才能继续

不得静默兜底。
不得部分开发。
不得绕过。

## 初始化触发

当用户要求 `wechat init`、`初始化`、`full-init`、项目初始化、build-ready 初始化、preview 初始化、upload 初始化，或任何 `/wechat` 下的功能开发时，先运行本门控。

如果 `/wechat` 缺失，报告 `BLOCKED`：WeChat 项目根目录不存在。

如果 `/wechat` 存在但没有 DevTools 项目信号文件，报告 `BLOCKED`：缺少 `/wechat/game.json` 或 `/wechat/app.json`。

Agent 不得凭空伪造 DevTools 项目壳。

## 第 1 步：检测项目类型

检测只基于文件：

- 如果 `/wechat/game.json` 和 `/wechat/app.json` 同时存在，停止并报告项目类型冲突
- 如果 `/wechat/game.json` 存在，将项目视为 **WeChat Mini Game**
- 如果 `/wechat/app.json` 存在，将项目视为 **WeChat Mini Program**
- 如果两者都不存在，停止并报告 `BLOCKED`

必需伴随文件：

- `/wechat/project.config.json`

如果 `project.config.json` 缺失，停止并报告 `BLOCKED`。

检测后，只读取一个类型文档：

- Mini Program：`agent-documents/MINIAPP.md`
- Mini Game：`agent-documents/MINIGAME.md`

不要混用 Mini Program 和 Mini Game 规则。

## 第 2 步：WeChat 技能路由门控

WeChat 开发工作的本地 WeChat 技能路由来源是：

- `.agents/skills/Wechat/`

这个门控独立于项目类型检测。

在选择实现路径、提出技术方案、编辑文件或开始功能工作前，agent 必须：

1. 检查 `.agents/skills/Wechat/` 下每个 `SKILL.md`
2. 先只读取 YAML frontmatter 中的 `name` 和 `description`
3. 如果请求涉及 Mini Game Pixi6、帧动画、粒子效果、spritesheets、原始 PNG 网格或模糊视觉效果，在最终选择技能前读取 `agent-documents/bootstrap.pixi.md`
4. 选择与用户顶层可见意图匹配的技能
5. 遵循选中的技能
6. 只有没有技能匹配时，才在不使用 WeChat 技能的情况下继续

路由规则：

- 按产品意图选择，不按底层实现细节选择
- 窄意图匹配优先于宽泛辅助技能
- 不要求人类命名技能
- 不要把 Mini Program 工作路由到仅适用于 Mini Game 的技能
- 如果没有技能匹配，先说明这一点，再进行普通编码

回复审计要求：

- 报告 WeChat 技能路由门控已完成
- 报告扫描了哪些 WeChat 技能
- 报告选中了哪个技能，或没有技能匹配
- 报告选择原因

### Pixi6 技能前置指引

对于涉及 Pixi6 初始化、帧动画、粒子效果、spritesheets、原始 PNG 网格或模糊视觉效果的 Mini Game 请求，读取：

- `agent-documents/bootstrap.pixi.md`

`bootstrap.pixi.md` 帮助 agent 正确初始化 Pixi6，并命中正确的动画或粒子技能。
它在 WeChat 技能 frontmatter 扫描后、最终技能选择前读取。

一旦选中 WeChat 技能，选中技能拥有具体工作流。

## 第 3 步：初始化检查清单

初始化 `PASS` 表示 build-ready。

它不会自动打开 preview 或 upload 自动化。

### 必需文件

Mini Program 和 Mini Game 都需要：

- `/wechat/project.config.json`
- `/wechat/package.json`
- `/agent-documents/Deploy/CREDENTIAL.md`
- `/agent-documents/Deploy/DEPLOY.md`

Mini Game 还需要：

- `/wechat/scripts/build-npm.js`

preview 和 upload 入口需要：

- `/wechat/scripts/preview.js`
- `/wechat/scripts/upload.js`

如果任何必需文件缺失，先初始化或修复，再进入功能工作。

### 工具复用

运行 WeChat 工具前，读取：

- `agent-tools/TOOLS.md`
- `agent-tools/TOOLS_WECHAT.md`

如果已登记的本地工具覆盖该任务，使用它。

Mini Game 初始化时，在确认 DevTools Mini Game 项目壳存在后，优先使用已登记的共享初始化器：

```bash
node scripts/init-wechat-minigame.js --project-root wechat
```

共享初始化器只适用于 Mini Game。

`--skip-build` 或 `--sync-only` 等缩减模式可以准备文件，但不算 Pixi runtime 工作所需的初始化 `PASS`。

### 必需依赖

始终需要：

- `miniprogram-ci`

Mini Program 需要：

- `miniprogram-api-typings`
- `miniprogram-simulate`

Mini Game 需要：

- `minigame-api-typings`
- `pixi.js`
- `@pixi/unsafe-eval`

Mini Game Pixi6 版本、npm build 行为、runtime adapter 要求，使用：

- `agent-documents/bootstrap.pixi.md`
- `agent-tools/wechat/minigame-init/versions.json`
- `agent-tools/TOOLS_WECHAT.md`

不要安装 `pixi`。
使用 `pixi.js`。
不要把固定版本替换成 `latest`。

### 必需 package scripts

`/wechat/package.json` 必须提供：

- `preview`
- `upload`

Mini Game 还必须提供：

- `build:npm`

标准 Mini Game script 形状：

```json
{
  "scripts": {
    "build:npm": "node scripts/build-npm.js",
    "preview": "node scripts/preview.js",
    "upload": "node scripts/upload.js"
  }
}
```

初始化要求 script 存在。
script 存在不代表 preview 或 upload 已经打开。

### Mini Game NPM 构建

对于使用 Pixi6 或其他 runtime npm dependency 的 Mini Game 项目，初始化通过前必须满足：

- dependencies 已安装
- `npm run build:npm` 成功
- `/wechat/miniprogram_npm` 存在
- `/wechat/js/vendor/pixi-runtime.js` 存在

如果 npm build 中出现 `parse js file ... failed`，视为失败。

runtime dependency 或 build pin 变更后，重新运行 `npm run build:npm`，并清理 WeChat DevTools compile/npm 缓存，再信任运行时行为。

### 凭证文档

`agent-documents/Deploy/CREDENTIAL.md` 必须可读，且不得包含真实密钥。

full-init 和 build-ready 工作需要本地专用文件存在：

- `agent-documents/Deploy/credential.local.json`

它至少必须提供：

- `appid`
- `privateKeyPath`

`appid` 必须匹配 `/wechat/project.config.json`。
private key 路径必须解析到存在的本地文件。

不要猜测凭证。
不要伪造路径。
不要暴露 private key 内容。

### 密钥保护

根 `.gitignore` 必须保护：

```gitignore
agent-documents/Deploy/*.key
agent-documents/Deploy/credential.local.json
```

Mini Game 生成的 runtime artifact 也必须在对应项目 ignore 文件中忽略：

```gitignore
js/vendor/pixi-runtime.js
```

如果缺少保护，先添加再继续。

### 部署 SOP

`agent-documents/Deploy/DEPLOY.md` 必须可读。

它必须包含：

- 准确 build 命令（适用时）
- 准确 preview 命令或明确 preview 门控
- 准确 upload 命令或明确 upload 门控
- version-number 策略或明确 upload 门控
- version-description 策略或明确 upload 门控
- upload 目标类型
- upload 后的网站
- 提审负责人
- 发布负责人

不要凭记忆编造部署步骤。

### `/wechat` 清洁度

`/wechat` 内不得包含 agent 工作流文档。

禁止示例：

- `README.md`
- 流程备注
- 总结
- 嵌套的 `agent-documents`
- agent instruction files

如果存在这类文件，停止并报告违规，除非人类明确说明它们是真实项目资产。

## 第 4 步：初始化顺序

当请求或需要初始化时，按以下顺序执行：

1. 确认 `/wechat` 存在
2. 根据 `app.json` / `game.json` 检测 Mini Program 或 Mini Game
3. 确认 `/wechat/project.config.json`
4. 读取 `MINIAPP.md` 或 `MINIGAME.md`
5. 运行工具前读取 WeChat 工具文档
6. 如果是 Mini Game Pixi6 初始化，读取 `bootstrap.pixi.md`
7. 创建或修复 `/wechat/package.json`
8. 安装或同步必需依赖
9. 创建或修复必需 script 文件和 package scripts
10. 验证凭证文档和本地凭证文件
11. 对 Mini Game runtime npm 依赖，运行 `npm run build:npm`
12. 验证 build outputs
13. 验证 secret guards
14. 验证部署 SOP
15. 验证 `/wechat` 清洁度
16. 报告 `PASS` 或 `BLOCKED`

只有 `PASS` 后才能开始功能开发。
