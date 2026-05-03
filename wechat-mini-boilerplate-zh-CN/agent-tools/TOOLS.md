# TOOLS.md

## 目的
- 本文档是 `agent-tools/` 的总索引。
- 本文档只负责说明：仓库里有哪些已下载工具、这些工具分别做什么、工具文档在哪。
- 本文档不负责说明：凭证、key、远端目录、部署命令、上线流程、站点权限边界。

## 当前分支
- `TOOLS_WECHAT.md`
  - 适用于 WeChat Mini Program、WeChat Mini Game、WeChat build、WeChat preview、WeChat upload、WeChat debug、WeChat asset 处理、WeChat 运行时适配相关工具登记与使用规范。

## 检索方法
1. 先读取 `TOOLS.md`
2. 根据任务关键词匹配分支文档
3. 命中 WeChat、Mini Program、Mini Game、WeChat build、WeChat preview、WeChat upload、WeChat debug、WeChat asset 处理、WeChat 运行时适配时，继续读取 `TOOLS_WECHAT.md`
4. 若分支文档中已有满足需求的本地工具，直接复用，不得重复安装
5. 只有当现有工具明确不满足需求时，才允许向 Owner 说明缺口并申请新工具

## 强制规则
- 凡是微信小程序或微信小游戏相关工具任务，`TOOLS_WECHAT.md` 是必查分支。
- 只要仓库内已有可用工具，默认优先复用本地工具，不得自行安装同类或相同工具。
- 当 agent 被指引使用某个工具，但发现该工具未登记、未安装、不可用、路径不存在、项目依赖缺失，或缺少安装方案/基础使用规范时，必须立即中断并询问 Owner 是否批准安装、登记或补充规范。
- Owner 未批准前，agent 不得自行安装、下载、替换、登记、绕过或使用替代工具。
- Owner 批准安装后，agent 必须按照对应分支文档中该工具的安装方案执行；如果安装方案尚不存在，必须先向 Owner 请求补充或确认安装方案。
- 站点自己的 key、账号、远端路径、deploy 命令、上线步骤，必须去对应站点的 `PROJECT.md` / `Deploy/` 查，不得写入工具文档。
