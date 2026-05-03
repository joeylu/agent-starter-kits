# PixiJS 8 Website Shared SOP

本文件是动画和粒子特效的共用流程。专项 skill 必须先读本文件，再读对应官方 Pixi skill。

## 1. 先判断是否该用 Pixi

- 普通按钮 hover、简单 CSS transition、少量 DOM 动效：优先 CSS / React，不上 Pixi。
- DOM 按钮的 Q 弹、按压、回弹、颜色变化：默认用 CSS transition、CSS keyframes 或 Web Animations API；Pixi 只负责独立 canvas 特效层。
- 大量对象、Canvas/WebGL 画面、游戏场景、粒子、滤镜后期、持续运动：使用 PixiJS 8。
- Next.js 项目里 Pixi 只能放在 client-only 边界内，不能进入 Server Component / SSR 执行路径。
- 如果 Pixi 只是为了少量 UI 装饰，必须先说明为什么 CSS/DOM 不够；说不清就不上 Pixi。

## 2. 固定加载顺序

1. 读 `../../official/skills/pixijs/SKILL.md`。
2. 按任务读专项官方 skill：`pixijs-application`、`pixijs-assets`、`pixijs-ticker`、`pixijs-performance` 是常用基础。
3. 涉及后期滤镜时读 `pixijs-filters`；涉及混合模式时读 `pixijs-blend-modes`。
4. 涉及粒子时读 `pixijs-scene-particle-container`。

## 3. 架构边界

- 一个视觉区域默认只创建一个 `Application`。
- Pixi 初始化、canvas 挂载、resize、destroy 放在同一个生命周期边界内。
- `Application` 的 async `init`、`ticker.add`、`ticker.remove`、`destroy` 必须由同一个生命周期流程闭环管理；不得依赖另一个 effect 在 async init 后自动重跑。
- 场景对象、动画系统、粒子系统、资源清单分开写，不把所有逻辑塞进 React 组件主体。
- 不用 React state 驱动逐帧动画；逐帧数据放在 refs、Pixi 对象或专用系统对象里。
- 不允许用 `app.stage.children[index]` 取场景对象；必须用明确 ref 或命名变量保存容器和对象。

## 4. 资源规则

- 资源通过 `Assets` 管理，优先 spritesheet / atlas。
- 同类精灵和粒子尽量共享 base texture，减少 draw call 和 GPU 上传。
- 大资源显示前考虑 prepare/upload，避免首帧卡顿。
- 不在逐帧循环里加载资源、创建纹理、创建滤镜或创建大量对象。

## 5. Ticker 规则

- 所有逐帧更新走 `app.ticker` 或明确的 Pixi ticker。
- 更新逻辑必须可移除；组件卸载、场景切换、暂停时清理 ticker callback。
- 使用 delta 时间做帧率无关更新，不把运动速度绑死到固定 FPS。
- 页面不可见、效果离屏、用户开启 reduced motion 时，必须降级、暂停或使用静态替代。
- 不允许 ticker 因 async 初始化时序丢失；ticker 注册必须发生在 app 初始化成功之后。

## 6. 性能规则

- 频繁生成/销毁的对象必须走池化。
- 静态复杂内容可以 `cacheAsTexture`，但修改后要更新缓存，销毁前要关闭缓存。
- 滤镜尽量挂父容器，不给大量子对象分别挂滤镜；已知范围时设置 `filterArea`。
- 移动端默认保守：控制 resolution、antialias、粒子数量、滤镜数量。

## 7. 清理规则

- 卸载时移除 ticker callback、事件监听、resize 监听。
- 从父容器移除对象后再 destroy。
- 完整销毁 Application 时使用官方推荐 destroy 方式，避免全局资源泄漏。
- 不留下隐藏 canvas、孤儿 ticker、未释放纹理或持续运行的 requestAnimationFrame。

## 8. 本项目验收边界

涉及网页代码时，真实验收走项目部署脚本。看到 `deploy_result=success` 和 `upload_status=done` 才代表服务器 build 与线上 health 通过。

## 9. 依赖与上传边界

- 如果新增 `pixi.js`、`@pixi/react` 或 `pixi-filters`，必须同时更新 `package.json` 和 lock 文件。
- 本地存在 `node_modules` 不代表可上传；上传 SOP 必须跳过 `node_modules`、`.next`、`.turbo`、`.cache`、`coverage`、`dist`。
- 不得宣称“已构建通过”；最终以服务器 build、health 和 `upload_status=done` 为准。

## 10. 上传前静态自检

- 无未定义变量、无错误类型引用、无明显废弃 Pixi v7 写法。
- 无误导后续 agent 的 `npm install` 注释。
- Pixi import 必须在 client-only 边界内；SSR 路径不得执行 Pixi runtime。
- 生命周期必须包含初始化成功、ticker 注册、ticker 清理、Application destroy。
