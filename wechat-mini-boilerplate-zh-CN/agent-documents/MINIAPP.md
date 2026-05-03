# MINIAPP.md

## 目的

本文档是本仓库中 WeChat Mini Program 工作的硬规则集。

它只在 `/wechat/app.json` 存在，并且项目已由 `WECHAT.md` 检测为 **WeChat Mini Program** 时适用。

如果项目被检测为 **WeChat Mini Game**，不得把本文档作为实现标准。

---

## 硬入口规则

当 `WECHAT.md` 检测到 Mini Program 时，agent 必须在任何 Mini Program 设计、源码编辑、初始化、重构、测试、预览、上传或部署工作前读取本文档。

如果本文档缺失或不可读，停止。

---

## 项目边界

所有真实 Mini Program 项目文件都位于：

- `/wechat`

所有 agent 文档都位于：

- `/agent-documents`

不要在 `/wechat` 内创建备注、README、流程文档、总结或 agent 工作流文件。

---

## Mini Program 身份

Mini Program 是页面驱动的。

标准信号是：

- `/wechat/app.json`
- `app.json` 中声明的页面路由
- 使用 Mini Program 页面约定的页面文件
- WXML 负责结构
- WXSS 负责样式
- JavaScript 负责行为，除非现有项目已经使用其他源码层

不要把 Mini Program 当作 Mini Game。

除非 Owner 明确改变项目类型或要求类似游戏的功能，不要引入 game loop、canvas-first runtime、physics loop 或 asset-loader 架构。

---

## 文件结构规则

Mini Program 工作必须遵守这些边界：

- `app.json` 拥有全局 Mini Program 配置和页面路由注册。
- `app.js` 只拥有全局应用生命周期和全局启动。
- `app.wxss` 只拥有全局样式。
- 每个页面必须位于自己的页面目录。
- 页面目录应把相关 `.js`、`.json`、`.wxml`、`.wxss` 文件放在一起。
- 可复用 UI 放在 components，不要复制页面 markup。
- 可复用的非 UI 逻辑放在 utility 或 service modules，不要放在页面文件里。

不要把页面逻辑散落到无关文件夹。

不要把 agent 文档或部署备注放进页面文件夹。

---

## 运行时规则

Mini Program 代码必须使用 WeChat Mini Program 运行时模型：

- 在合适的位置使用 `App`、`Page`、`Component` 生命周期
- 使用 `wx.*` API 访问平台能力
- 不要假设存在 `window`、`document`、`localStorage` 或直接修改 DOM 等浏览器 DOM API
- 不要假设标准 Web routing
- 不要假设 npm packages 可在 runtime 使用，除非它们与 Mini Program 环境和 build 行为兼容

如果依赖需要浏览器 DOM、Node runtime API、native modules 或不受支持的 globals，不要添加它。

---

## 页面和组件规则

Pages 是路由级容器。

Components 是可复用 UI 和交互单元。

规则：

- Page files 可以协调数据加载、导航和页面级状态。
- Components 不应拥有路由决策，除非这正是它们的明确目的。
- Component public properties 必须明确。
- Component events 必须按用户意图命名，而不是按实现细节命名。
- 避免把网络、渲染、存储、校验、导航逻辑混在大型页面文件里。

当逻辑开始服务多个页面时，把它移出页面。

---

## 数据和状态规则

状态必须靠近其 owner。

规则：

- Page-local state 留在 page 中。
- Component-local state 留在 component 中。
- Cross-page state 必须明确，并在代码结构中可见。
- Persisted data 必须使用稳定 key 和项目专属前缀。
- 不要把 secrets 存入 client-side storage。
- 不要把 client-side storage 当作 server-owned data 的权威来源。

网络请求结果在用于渲染关键 UI 前应先校验。

---

## UI 规则

Mini Program UI 必须使用 WXML 和 WXSS 构建。

规则：

- 使用适合 Mini Program 屏幕的响应式布局单位
- 考虑安全区和常见移动屏幕尺寸
- 保持移动端 tap target 可用
- 明确页面 loading、empty、error、success 状态
- 避免按钮、tabs、cards 和紧凑 controls 中的文本溢出
- 不依赖 hover-only 交互

如果功能需要 canvas，把它隔离为具体 component 或 page feature，不要作为默认 app 架构。

---

## 导航规则

导航必须遵循 Mini Program routing behavior。

规则：

- 所有可路由页面必须在 `app.json` 中声明
- 导航必须使用支持的 WeChat navigation API
- tab pages 和普通 pages 不要随意混用
- route 参数使用前必须校验
- 每个新 user flow 都必须考虑返回行为

不要编造 client-side router。

---

## 网络和权限规则

网络和权限工作必须明确。

规则：

- 使用 `wx.request` 或现有项目批准的 request wrappers
- 当功能依赖网络访问时，记录必需 server domains
- 处理请求失败、超时和无效响应结构
- 只在需要时请求用户权限
- 平台要求时，在用户可见文案中说明为什么需要该权限

不要在 Mini Program 源文件中硬编码私有凭证。

---

## 测试和验证规则

对 Mini Program 改动，验证最小有用范围：

- 如果配置了 syntax 和 lint checks，运行它们
- 添加或移动页面时，检查页面路由注册
- 当行为或配置变更影响 runtime 时，运行 preview command
- 只有 Owner 要求 upload 时，才运行 upload command

不要声称已提审或最终发布。这些仍由人类在网页控制台操作。
