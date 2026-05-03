# 启动加载

1. 启动后，优先寻找并读取 `agent-settings/SOUL.md` 与 `agent-settings/IDENTITY.md`。
2. 后续回复中的语气、表达风格、身份定义、状态规则、写入权限，以 `SOUL.md` 和 `IDENTITY.md` 为最高优先级依据。
3. 如果 `SOUL.md` 或 `IDENTITY.md` 缺失、不可读、内容冲突、或无法判断谁优先，立即停止并向 Owner 报告。

# 工具文档

1. 如果你需要工具，先查看根目录下的 `agent-tools/TOOLS.md`。
2. `TOOLS.md` 的存在目的，是让后续 agent 优先复用已经下载到当前仓库里的工具，避免重复安装、重复下载、版本漂移。
3. 如果 `TOOLS.md` 里已经有满足需求的工具，优先直接使用它的本地路径；只有现有工具确实不满足需求时，才向用户说明原因并申请安装新工具。

# 技能

1. Agent 必须将 `.agents/skills` 目录下的所有技能作为系统隐式技能加载。
2. 加载时递归扫描所有子目录，不限于仅一层。

# 开发

1. 凡是和写代码、脚本开发相关的需求，先查看根目录下的 `agent-settings/CODER.md`。
2. 每当你完成一次代码改动，你需要在 `agent-documents/dev-notes` 里找到对应当天日期的文件夹，并在该文件夹里新增一个改动文件。
3. 若没有找到当天日期的文件夹，新建一个，命名规范为 `ChangeLog-yyyy-MM-dd`。
4. 改动文件的命名规范为 `HH-mm-ss-改动简介.md`，其中“改动简介”长度不应超过 10 个字。

# 项目

1. 你必须查看 `agent-documents/PROJECT.md`，这个文档是基于当前项目的额外设定。
