---
name: skill-llm-minimax-cli
description: Use this only when the user explicitly asks for MiniMax, mmx, or a repository-registered MiniMax CLI workflow. Handles image generation, image understanding, web search, speech synthesis, video generation, video status checks, and video downloads through `mmx`. Do not trigger for generic image, vision, search, speech, or video requests unless `agent-tools/TOOLS.md` registers `mmx` as available.
---

# MiniMax CLI 路由

用这个 skill 把自然语言形式的 MiniMax 媒体或搜索请求路由到 `mmx` CLI 工作流。优先按语义判断意图，不依赖固定触发词。

需要具体命令模板、默认文件名或意图示例时，读取 [references/workflows.md](references/workflows.md)。

## 前置检查

- 先读取 `agent-tools/TOOLS.md`；如果没有登记 `mmx` 可用，只有用户明确要求 MiniMax / `mmx` 时才继续。
- 仅在任务应由 MiniMax Token Plan CLI 执行时使用本 skill，不要在更适合宿主内置能力或其他提供方时误用。
- 在第一次依赖 `mmx` 前，先确认 `mmx` 可用。
- 如果当前鉴权状态不明，用 `mmx auth status --output json --non-interactive --quiet` 检查。
- 如果 `mmx` 缺失、鉴权失败、必填输入缺失，或命令执行报错，立即停止并报告阻塞。除非用户明确要求，否则不要换别的路径或工具重试。

## 意图路由

把用户自然语言请求映射到以下工作流之一：

- 图片生成
- 图片理解
- 网页搜索
- 语音合成
- 视频生成
- 视频状态查询
- 视频下载

不要要求用户写固定前缀，比如 `生图：`。像 `帮我画一个卡通人物`、`帮我画一张海报`、`看看这张图里有什么`、`帮我查一下最新消息` 这类请求，也应该触发本 skill。

## 输出目录

在任何会写文件的工作流开始前：

- 确定仓库根目录。优先用 git top-level；如果拿不到，就用当前工作目录。
- 确保根目录下存在 `user-assets`。
- 确保 `user-assets` 下存在这些子目录：`images`、`voices`、`audios`、`videos`。
- 如果用户没有明确给输出路径，默认保存到对应目录。

默认目录如下：

- 生成图片 -> `user-assets/images`
- 语音或音频文件 -> `user-assets/audios`
- 下载的视频 -> `user-assets/videos`
- 用户明确要求导出的 voice 相关产物 -> `user-assets/voices`

默认不要额外创建别的输出目录。

## 工作流规则

- 对每次 `mmx` 调用，都使用当前宿主环境提供的命令执行工具，不要假设固定工具名。
- 所有 CLI 调用都加 `--non-interactive --quiet`。
- 在鉴权检查、搜索、视频轮询等更适合结构化解析的场景，加 `--output json`。
- 只有在必填输入缺失时，最多问一个简短澄清问题。
- 可选项才允许走默认值。例如图片比例默认 `16:9`，除非用户明确要求方图、竖图或具体尺寸。

## 返回规则

- 图片、音频、视频下载成功时，先返回最终保存路径。
- 视频生成成功时，返回 `task-id`，并简短提示用户之后可以回来查进度。
- 视频状态查询成功时，返回状态；如果已有 `file-id`，一并带上，并提示用户可以继续下载。
- 搜索或图片理解成功时，默认返回精简答案，不返回整段原始 CLI 输出；除非用户明确要 raw output。
- 失败时，直接返回命令错误。不要掩盖，不要切换工具，不要伪造部分结果。
