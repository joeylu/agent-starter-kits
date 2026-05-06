# CREDENTIAL.md

## Purpose

This file is the committed, non-secret credential guide for this repository.

Live values must not be stored in this document.
Local-only values belong in `agent-documents/Deploy/credential.local.json`, which must stay gitignored.
A safe schema example is committed at `agent-documents/Deploy/credential.local.example.json`.

## Local Credential File

Path:

`agent-documents/Deploy/credential.local.json`

Rules:

- This file is local-only and must not be committed.
- When this workspace is copied to start a different WeChat project, delete or rewrite `credential.local.json` before the first full-init.
- `privateKeyPath` may be repo-relative or absolute.
- Prefer storing the private key outside the repository when practical.
- If the local credential file is copied from another project, its `appid` must be updated to match `/wechat/project.config.json` before initialization, preview, or upload.

## Minimum Fields For Build-Ready Initialization

```json
{
  "projectType": "WeChat Mini Game",
  "appid": "",
  "privateKeyPath": ""
}
```

`appid` and `privateKeyPath` are the only fields required for full initialization and guarded preview/upload tooling.

## Recommended Fields For Preview Upload And Human Operations

- `appSecret`
- `accountOwner`
- `ipWhitelist.enabled`
- `ipWhitelist.entries`
- `ipWhitelist.source`
- `submissionOperator`
- `releaseOperator`

These fields should exist before preview/upload automation is opened or before human submission/release work proceeds.

## Current Local Credential Schema

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
  "submissionOperator": "Owner / human",
  "releaseOperator": "Owner / human"
}
```
