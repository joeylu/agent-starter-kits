# MiniMax CLI 工作流

当 skill 已经触发，且你需要具体工作流形态时，读取本文件。

## 通用准备

在任何会写文件的工作流前，先确定仓库根目录，并确保存在：

- `user-assets/images`
- `user-assets/voices`
- `user-assets/audios`
- `user-assets/videos`

如果用户没有指定输出路径，默认保存到这些目录。

当需要自动生成文件名时，使用简短、可预测的时间戳命名，例如：

- `image-20260423-153000`
- `audio-20260423-153000.mp3`
- `video-176844028768320.mp4`

## 意图映射

| 意图 | 常见用户说法 | 必填输入 | 可选输入 | 命令形态 | 成功返回 |
| --- | --- | --- | --- | --- | --- |
| 图片生成 | `帮我画一个卡通人物`, `帮我画一张...`, `生成一张图`, `做个封面图`, `出一张海报` | prompt | aspect ratio, width, height, image count | `mmx image generate --prompt "<prompt>" --aspect-ratio <ratio> --out-dir "<images-dir>" --out-prefix "<prefix>" --non-interactive --quiet` | 返回保存后的图片路径。 |
| 图片理解 | `看下这张图`, `这图里有什么`, `识别图片文字`, `描述这张图片` | image path or URL | question/prompt | `mmx vision describe --image "<path-or-url>" --prompt "<question>" --non-interactive --quiet` | 返回精简答案。 |
| 网页搜索 | `搜一下...`, `查一下...`, `看看网上有没有...`, `查最新消息` | query | none | `mmx search query --q "<query>" --output json --non-interactive --quiet` | 返回精简搜索结果。 |
| 语音合成 | `把这段话读出来`, `生成语音`, `做个旁白`, `转成 mp3` | text | output path, voice | `mmx speech synthesize --text "<text>" --out "<audio-path>" --voice "<voice>" --non-interactive --quiet` | 返回保存后的音频路径。 |
| 视频生成 | `生成一个视频`, `做个短视频`, `把这个创意做成视频` | prompt | first frame, last frame, subject image | `mmx video generate --prompt "<prompt>" --async --output json --non-interactive --quiet` | 返回 `task-id`，并提醒用户之后可以回来查进度。 |
| 视频状态查询 | `查下视频进度`, `这个任务好了没`, `看看视频状态` | task-id | none | `mmx video task get --task-id "<task-id>" --output json --non-interactive --quiet` | 返回状态；若已完成且存在 `file-id`，一并返回。 |
| 视频下载 | `下载这个视频`, `把视频保存到...` | file-id | output path | `mmx video download --file-id "<file-id>" --out "<video-path>" --non-interactive --quiet` | 返回保存后的视频路径。 |

## 缺参规则

- 图片生成：如果请求模糊到无法执行，只补问 prompt。除非用户在意，否则不要追问图片比例。
- 图片理解：只在缺少图片路径或 URL 时补问。
- 网页搜索：只在缺少搜索词时补问。
- 语音合成：只在缺少文本时补问。若用户没给输出路径，直接使用默认路径。
- 视频生成：只在缺少 prompt 时补问。
- 视频状态查询：只在缺少 `task-id` 时补问。
- 视频下载：只在缺少 `file-id` 时补问。若用户没给输出路径，直接使用默认路径。

## 默认行为

- 默认图片比例：`16:9`
- 默认音频格式：`.mp3`
- 用户明确给了输出路径时，优先使用用户路径。
- 如果用户明确要 raw JSON 或原始命令输出，就原样返回；否则做摘要。
- 搜索和图片理解默认简短回答，除非用户明确要求详细内容。

## 备注

- `voices` 是保留目录，仅在用户明确要求保存 voice 相关导出物时使用。
- `speech voices` 虽然可用，但只有在用户明确要看 voice 选项或导出 voice 列表时才路由过去。
- 不要把普通文字闲聊路由到 `mmx text chat`；常规文本对话应由宿主助手直接处理。
