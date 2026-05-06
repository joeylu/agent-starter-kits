# CREDENTIAL.md

## 目的

本文档是本仓库提交到版本库的非密钥凭证说明。

真实值不得存入本文档。
本地专用值放在 `agent-documents/Deploy/credential.local.json`，该文件必须保持 gitignored。
安全 schema 示例提交在 `agent-documents/Deploy/credential.local.example.json`。

## 本地凭证文件

路径：

```text
agent-documents/Deploy/credential.local.json
```

规则：

- 该文件只用于本地，不得提交。
- 当 workspace 被复制去启动另一个 WeChat 项目时，第一次 full-init 前先删除或重写 `credential.local.json`。
- `privateKeyPath` 可以是 repo-relative 或 absolute。
- 可行时，优先把 private key 存在仓库外。
- 如果本地凭证文件从另一个项目复制而来，初始化、preview 或 upload 前，里面的 `appid` 必须更新为匹配 `/wechat/project.config.json`。

## Build-Ready 初始化最小字段

```json
{
  "projectType": "WeChat Mini Game",
  "appid": "",
  "privateKeyPath": ""
}
```

`appid` 和 `privateKeyPath` 是 full initialization 以及受门控 preview/upload tooling 的最小字段。

## Preview Upload 和人工操作建议字段

- `appSecret`
- `accountOwner`
- `ipWhitelist.enabled`
- `ipWhitelist.entries`
- `ipWhitelist.source`
- `submissionOperator`
- `releaseOperator`

这些字段应在 preview/upload 自动化打开前，或人工提审/发布工作继续前存在。

## 当前本地凭证 Schema

```json
{
  "projectType": "WeChat Mini Game",
  "appid": "...",
  "appSecret": "...",
  "privateKeyPath": "...",
  "accountOwner": "...",
  "ipWhitelist": {
    "enabled": false,
    "entries": [],
    "source": ""
  },
  "submissionOperator": "Owner / 人类",
  "releaseOperator": "Owner / 人类"
}
```
