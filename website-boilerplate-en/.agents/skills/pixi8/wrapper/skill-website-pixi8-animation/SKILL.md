---
name: skill-website-pixi8-animation
description: Use this skill when the user asks in natural language to create, refactor, fix, or optimize website/web-game animation involving PixiJS 8, canvas/WebGL, or existing Pixi animation code. Triggers include: 我想做一个动画, 做个动画, 页面动起来, 增加动效, 做转场, 重构动画, 修复动画, 优化动画, 动画不生效, 现有 Pixi 动画代码, 精灵动画, canvas 动画, WebGL 动画, 游戏动画, 后期滤镜动画, animate, motion, transition, sprite animation, Pixi animation.
---

# Website PixiJS 8 Animation SOP

用于网页和网页游戏里的 PixiJS 8 动画开发。先读 `../_shared/SOP.md`，再按任务读取官方 Pixi skills。

## 必读官方 skills

- `../../official/skills/pixijs/SKILL.md`
- `../../official/skills/pixijs-application/SKILL.md`
- `../../official/skills/pixijs-ticker/SKILL.md`
- `../../official/skills/pixijs-assets/SKILL.md`
- `../../official/skills/pixijs-performance/SKILL.md`

按需补读：

- 精灵或帧动画：`pixijs-scene-sprite`
- 容器和层级：`pixijs-scene-container`
- 图形动画：`pixijs-scene-graphics`
- 后期滤镜：`pixijs-filters`
- 混合模式：`pixijs-blend-modes`
- 指针交互：`pixijs-events`

## 动画 SOP

1. 判定技术：简单 UI 动效走 CSS / React；大量对象、游戏画面、canvas/WebGL、滤镜后期才走 Pixi。
2. DOM 按钮 Q 弹：默认用 CSS keyframes、CSS transition 或 Web Animations API；Pixi 不负责缩放 HTML 按钮，除非按钮本体就是 Pixi 场景对象。
3. 定义效果：明确对象、起止状态、持续时间、循环方式、触发条件、暂停条件、reduced-motion 降级。
4. 分层建模：把背景层、主体层、特效层、UI/DOM 层分开；不要把所有对象塞在一个无语义容器里。
5. 初始化：在 client-only 边界创建 `Application`，挂载 canvas，绑定 resize，准备资源。
6. 生命周期：async `app.init()` 成功后立刻注册 ticker；同一个流程负责 ticker 清理和 `app.destroy()`。
7. 更新：用 ticker 推进 Pixi 场景动画；使用 delta 时间；不要在逐帧循环里触发 React render。
8. 后期：滤镜优先挂容器；动画只更新 uniform 或少量属性；已知范围必须设置 `filterArea`。
9. 性能：复用 Sprite、Texture、Filter；静态复杂内容考虑缓存；移动端限制 resolution、antialias 和滤镜数量。
10. 清理：卸载时移除 ticker callback、事件、resize；移除对象后 destroy；销毁 app 时释放全局资源。

## 重构 SOP

当用户只说“重构动画”“修复动画”“优化动画”“动画不生效”时：

1. 先定位现有动画实现和调用入口。
2. 对照 `../_shared/SOP.md` 检查是否违反 client-only、async init、ticker 生命周期、DOM/Pixi 边界、静态自检规则。
3. 保留用户可见行为目标，优先修正结构和生命周期，不重新发明无关方案。
4. 如果动画对象是 HTML/DOM，直接改 CSS/WAAPI/React 交互；不要把它搬进 Pixi。
5. 如果动画对象是 Pixi 场景对象，再按官方 Pixi skills 重构。
6. 完成后说明：修复了哪些 SOP 违规点，哪些部分仍需服务器 build 或线上验收确认。

## 禁止项

- 不为简单按钮或卡片 hover 引入 Pixi。
- 不用 Pixi 空容器伪装成 HTML 按钮动画；HTML 元素动画必须直接作用于 HTML 元素。
- 不在 Server Component、SSR、模块顶层直接创建 Pixi `Application`。
- 不用 React state 做每帧位置、旋转、透明度更新。
- 不在 ticker 里创建纹理、滤镜、大量 Sprite 或发起资源加载。
- 不在每个子对象上重复挂同一个昂贵滤镜。
- 不用 `app.stage.children[index]` 获取动画对象。
- 不留下未定义变量、错误类型引用、误导性安装命令注释。

## 交付自检

- 说明使用了哪些官方 Pixi skills。
- 说明动画为什么需要 Pixi，而不是 CSS。
- 说明 ticker、资源、滤镜和 destroy 的处理方式。
- 说明 reduced-motion 或低性能设备的降级策略。
- 说明无法本地 build 时，只完成源码级检查，最终以服务器 build 为准。
