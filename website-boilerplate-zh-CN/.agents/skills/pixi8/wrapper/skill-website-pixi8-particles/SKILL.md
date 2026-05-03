---
name: skill-website-pixi8-particles
description: Use this skill when the user asks in natural language to create, refactor, fix, or optimize particle effects for a website or web game with PixiJS 8, canvas/WebGL, or existing Pixi particle code. Triggers include: 增加粒子特效, 做粒子, 粒子动画, 重构粒子, 修复粒子, 优化粒子, 粒子不生效, 现有 Pixi 粒子代码, 火花, 烟雾, 雪花, 星光, 爆炸, 拖尾, 能量光点, 点击粒子, 背景粒子, particle effect, particles, emitter, sparkle, smoke, burst, trail.
---

# Website PixiJS 8 Particles SOP

用于网页和网页游戏里的 PixiJS 8 粒子特效。先读 `../_shared/SOP.md`，再读官方粒子与性能 skills。

## 必读官方 skills

- `../../official/skills/pixijs/SKILL.md`
- `../../official/skills/pixijs-scene-particle-container/SKILL.md`
- `../../official/skills/pixijs-assets/SKILL.md`
- `../../official/skills/pixijs-ticker/SKILL.md`
- `../../official/skills/pixijs-performance/SKILL.md`

按需补读：

- 发光、模糊、扰动：`pixijs-filters`
- 加色、屏幕、叠加：`pixijs-blend-modes`
- 点击/拖拽触发：`pixijs-events`
- 少量复杂粒子对象：`pixijs-scene-sprite`

## 粒子 SOP

1. 定义效果规格：粒子数量、发射位置、发射速率、生命周期、速度、加速度、重力、尺寸、旋转、颜色、透明度、纹理、混合模式。
2. 选择实现：
   - 少量复杂粒子、每个粒子需要事件/滤镜/独立层级：用 Sprite 池。
   - 大量同质粒子：用 `ParticleContainer + Particle`。
3. 资源准备：优先单张小纹理或 atlas；同一个 `ParticleContainer` 内粒子必须共享 base texture。
4. 容器创建：设置 `boundsArea`；只把真正逐帧变化的字段放进 `dynamicProperties`。
5. 发射更新：ticker 中只更新已有粒子数据；新增粒子来自对象池；过期粒子回收，不逐帧大量 new/destroy。
6. 生命周期：粒子 ticker 必须在 Pixi app 初始化成功后注册，并在组件卸载或场景退出时移除。
7. 批量操作：大量增删时操作 `particleChildren` 后统一 `update()`；不要把 `ParticleContainer` 当普通 Container。
8. 性能预算：设置最大粒子数、最大每帧发射量、移动端降级数量、离屏暂停策略。
9. 清理：停止发射，移除 ticker，清空池，移除容器，按资源所有权释放纹理。

## 重构 SOP

当用户只说“重构粒子”“修复粒子”“优化粒子”“粒子不生效”时：

1. 先定位现有粒子实现、触发入口、资源创建位置和 ticker 注册位置。
2. 对照 `../_shared/SOP.md` 检查是否违反 client-only、async init、ticker 生命周期、对象池、最大粒子数、reduced-motion、清理规则。
3. 保留用户可见效果目标，优先修正生命周期、池化、边界和类型错误，不重新发明无关方案。
4. 少量 DOM 装饰粒子可以降级为 CSS/DOM；需要 canvas/WebGL 统一渲染时保留 Pixi。
5. 如果使用 `ParticleContainer`，必须按官方 `pixijs-scene-particle-container` 规则处理 `Particle`、`particleChildren`、`boundsArea` 和 `dynamicProperties`。
6. 完成后说明：修复了哪些 SOP 违规点，最大粒子预算是什么，哪些部分仍需服务器 build 或线上验收确认。

## 禁止项

- 不在 `ParticleContainer` 里 `addChild(Sprite)`；必须 `addParticle(Particle)`。
- 不读取 `children` 管理粒子；必须用 `particleChildren`。
- 不给每个粒子单独挂滤镜、mask、事件。
- 不在每帧创建纹理、创建滤镜、加载资源或无限增长粒子数组。
- 不默认使用旧版粒子 emitter 插件；先按 PixiJS 8 内建粒子路线评估。
- 不把少量 DOM 装饰粒子强行做成 Pixi；只有需要 canvas/WebGL 统一渲染、持续运动或可扩展粒子系统时才上 Pixi。
- 不遗漏最大粒子数和 reduced-motion 降级。

## 交付自检

- 说明选择 Sprite 池还是 `ParticleContainer`，以及原因。
- 说明最大粒子数、发射速率、生命周期和移动端降级。
- 说明 `boundsArea`、`dynamicProperties`、对象池、ticker 清理。
- 说明 reduced-motion 开启时的替代方案。
- 说明无法本地 build 时，只完成源码级检查，最终以服务器 build 为准。
