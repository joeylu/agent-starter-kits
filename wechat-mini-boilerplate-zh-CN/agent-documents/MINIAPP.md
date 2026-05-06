# MINIAPP.md

## 目的

这是本仓库 WeChat Mini Program 工作的硬规则。

仅当 `WECHAT.md` 检测到 `/wechat/app.json` 且项目类型为 **WeChat Mini Program** 时适用。

如果项目被检测为 **WeChat Mini Game**，不得用本文档作为实现标准。

## 硬入口规则

当 `WECHAT.md` 检测到 Mini Program 时，agent 在任何设计、源码编辑、初始化、重构、测试、preview、upload 或部署工作前，必须读取本文档。

如果本文档缺失或不可读，停止。

## 项目边界

真实 Mini Program 项目文件都在：

```text
/wechat
```

Agent 文档都在：

```text
/agent-documents
```

不要在 `/wechat` 中创建备注、README、流程文档、总结或 agent 工作流文件。

## Mini Program 身份

Mini Program 是页面驱动，不是游戏循环驱动。

标准信号：

- `/wechat/app.json`
- `app.json` 中声明的页面路由
- 页面文件使用小程序页面约定
- WXML 负责结构
- WXSS 负责样式
- 默认用 JavaScript 负责行为，除非现有项目已使用其他源码层

不要把 Mini Program 当作 Mini Game。

不要引入 game loop、canvas-first runtime、physics loop 或 asset-loader 架构，除非 Owner 明确改变项目类型或要求游戏化功能。

## 文件结构规则

Mini Program 工作必须遵守：

- `app.json` 负责全局配置和页面路由注册
- `app.js` 只负责全局应用生命周期和全局启动
- `app.wxss` 只负责全局样式
- 每个页面放在自己的页面目录
- 页面目录应放同一页面相关的 `.js`、`.json`、`.wxml`、`.wxss`
- 可复用 UI 放 components，不复制页面 markup
- 可复用非 UI 逻辑放 utility 或 service 模块，不堆在 page 文件里

不要把页面逻辑散落到无关目录。
不要把 agent 文档或部署备注放进页面目录。

## 运行时规则

Mini Program 代码必须使用微信小程序运行时模型：

- 适当使用 `App`、`Page`、`Component` 生命周期
- 使用 `wx.*` API 调用平台能力
- 不假设浏览器 DOM API，例如 `window`、`document`、`localStorage` 或直接 DOM mutation
- 不假设标准 Web routing
- 不假设 npm 包一定能在小程序运行时使用，除非确认兼容小程序环境和构建行为

如果依赖需要浏览器 DOM、Node runtime API、native module 或不支持的全局对象，不要添加。

## 页面和组件规则

页面是路由级容器。
组件是可复用 UI 和交互单元。

规则：

- Page 文件可以协调数据加载、导航和页面级状态
- Component 不应拥有路由决策，除非它的目的就是路由
- Component 公开 properties 必须明确
- Component events 按用户意图命名，不按实现细节命名
- 避免大页面文件混合网络、渲染、存储、校验和导航逻辑

当逻辑服务超过一个页面时，把它移出页面。

## 数据和状态规则

状态应靠近所有者。

规则：

- 页面本地状态留在页面
- 组件本地状态留在组件
- 跨页面状态必须在代码结构中明确
- 持久化数据使用稳定 key 和项目专属前缀
- 不要把 secret 存在客户端 storage
- 不要把客户端 storage 当作服务端数据权威来源

关键 UI 渲染前应验证网络响应形状。

## UI 规则

Mini Program UI 使用 WXML 和 WXSS。

规则：

- 使用适合小程序屏幕的响应式单位
- 考虑 safe area 和常见移动屏幕尺寸
- 移动端 tap target 必须可用
- 页面 loading、empty、error、success 状态必须明确
- 避免按钮、tabs、cards、紧凑控件文本溢出
- 不依赖 hover-only 交互

如果功能需要 canvas，把它隔离为具体组件或页面功能，不把它变成默认应用架构。

## 导航规则

导航必须遵守小程序路由行为。

规则：

- 所有可路由页面必须在 `app.json` 声明
- 导航必须使用微信支持的 navigation API
- tab 页面和普通页面不要随意混用
- 使用路由参数前必须验证
- 每个新流程都要考虑返回行为

不要发明客户端 router。

## 网络和权限规则

网络和权限必须明确。

规则：

- 使用 `wx.request` 或项目已批准 request wrapper
- 功能依赖网络时说明必需服务器域名
- 处理请求失败、超时、无效响应形状
- 只在需要时请求用户权限
- 平台要求时，用用户可见文案说明为什么需要权限

不要在 Mini Program 源码中硬编码私密凭证。

## 测试和验证规则

Mini Program 变更验证最小有效面：

- 已配置时运行 syntax / lint
- 新增或移动页面时验证页面路由注册
- 行为或配置影响运行时时运行 preview 命令
- 只有 Owner 要求 upload 时才运行 upload 命令

不要声称提审或最终发布完成；这些仍由人类在网页控制台完成。
