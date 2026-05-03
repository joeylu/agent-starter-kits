# WeChat Mini Boilerplate Quickstart

这个模板用于快速搭建微信小程序 / 微信小游戏的 AI 工作区。

它的核心不是引入 Unity、Cocos 这类复杂游戏引擎，而是在微信项目中使用 Pixi 这类轻量 JS 渲染模块，处理动画、粒子特效、后期效果和轻量游戏画面。

## 1. 创建工作区

1. 复制 `wechat-mini-boilerplate-zh-CN`，作为新项目目录。
2. 用微信开发者工具在这个目录的 `/wechat` 下创建微信小程序或微信小游戏项目。
3. 用支持 AI agent 的开发工具打开整个项目目录，例如 VSCode、Claude、Codex、OpenCode 等。

`/wechat` 是真实微信项目目录。小程序通常有 `app.json`，小游戏通常有 `game.json`，AI 会按这些文件判断项目类型。

## 2. 初始化项目

告诉 AI：初始化这个微信小游戏，或初始化这个微信小程序。

AI 会检查 `/wechat` 项目壳、项目类型、`project.config.json` 和初始化条件。  
如果是小游戏，AI 会同步 Pixi Mini Game 工具链、安装依赖、执行 `build:npm`，让项目达到 build-ready。

`build-ready` 指项目已经完成本地 npm 构建准备；小游戏场景下还包括生成 `miniprogram_npm/` 和 Pixi runtime 文件。

## 3. 凭证配置

你可以自己填写本地凭证文件：

```text
agent-documents/Deploy/credential.local.json
```

也可以在初始化时或初始化后，把 AppID、Secret、上传 key 路径发给 AI，让 AI 帮你填。

如果缺少必要凭证，AI 会直接询问，不会猜测或伪造。

## 4. 用自然语言开发

后续可以直接描述需求，例如：

```text
做一个首页
加一个排行榜页面
做一个点击屏幕得分的小游戏
给角色加一个可拖拽控制
```

AI 会根据 `/wechat/app.json` 或 `/wechat/game.json` 自动走小程序规则或小游戏规则。

## 5. 动画、粒子和素材

如果是微信小游戏，提到 Pixi、帧动画、序列帧、粒子、烟雾、火焰、水花、拖尾、后期效果等，AI 会走 Pixi6 和 WeChat Mini Game 的专用规则。

示例：

```text
把这张 3x3 序列帧图做成循环动画
给角色移动时加拖尾粒子
做一个点击时爆开的火花效果
```

如果原始 PNG 网格需要裁切或打包，AI 会先确认描述，再使用内置 spritesheet 工具生成动画资源包。

## 6. 预览和排错

初始化和构建完成后，可以在微信开发者工具中预览项目。

如果微信开发者工具里出现报错，可以把错误信息复制给 AI，让 AI 根据报错继续修复。

## 7. 上传和发布

开发者需要先准备 AppID、Secret 和上传 key。

之后可以用自然语言告诉 AI：上传微信公众平台、上传部署、上传到微信，或类似表达。  
如果缺少版本号、版本描述或上传授权，AI 会先询问；补齐后，AI 会执行构建并上传到微信平台。

最终提审和发布仍然由人类在微信公众平台完成。
