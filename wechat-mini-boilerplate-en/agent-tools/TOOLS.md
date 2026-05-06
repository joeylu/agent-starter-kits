# TOOLS.md

## Purpose
- This document is the main index for `agent-tools/`.
- It only explains which downloaded tools exist in this repository, what each tool does, and where the tool documentation lives.
- It does not define credentials, keys, remote directories, deployment commands, release flows, or site permission boundaries.

## Current Branches
- `TOOLS_LINUX.md`
  - Applies to Linux / Ubuntu Server connection, SSH, SFTP, SCP, file upload/download, and directory sync tooling.
  - No local Linux connection or transfer tool is currently registered.
- `TOOLS_WECHAT.md`
  - Applies to tool registration and usage rules for WeChat Mini Program, WeChat Mini Game, WeChat build, preview, upload, debugging, asset processing, and runtime adaptation.
- `.agents/skills/CLIs/`
  - May contain skills that reference external CLIs.
  - No `mmx` CLI is registered as a bundled repository tool in this template.

## Lookup Method
1. Read `TOOLS.md` first.
2. Match task keywords to branch documents.
3. When the task matches Linux / Ubuntu / SSH / SFTP / SCP / upload / download / sync / remote server, continue by reading `TOOLS_LINUX.md`.
4. When the task matches WeChat, Mini Program, Mini Game, WeChat build, WeChat preview, WeChat upload, WeChat debugging, WeChat asset processing, or WeChat runtime adaptation, continue by reading `TOOLS_WECHAT.md`.
5. If a branch document already lists a local tool that satisfies the need, reuse it directly. Do not install a duplicate.
6. Only when the existing tools clearly do not satisfy the need may the agent explain the gap to Owner and request approval for a new tool.

## Mandatory Rules
- For any WeChat Mini Program or WeChat Mini Game tooling task, `TOOLS_WECHAT.md` must be checked.
- For any Linux server connection or file-transfer task, `TOOLS_LINUX.md` must be checked.
- Do not assume system `ssh.exe`, `sftp.exe`, or `scp.exe` exists or is usable.
- Generic image, vision, search, speech, or video requests must not route to MiniMax unless the user explicitly requests MiniMax / `mmx`, or a future tools document registers `mmx` as available.
- If a usable tool already exists in the repository, reuse the local tool by default. Do not install a same-kind or duplicate tool yourself.
- If the agent is directed to use a tool but finds that the tool is unregistered, uninstalled, unavailable, missing by path, missing project dependencies, or missing installation/basic usage rules, stop immediately and ask Owner whether to approve installation, registration, or rule completion.
- Before Owner approval, the agent must not install, download, replace, register, bypass, or use an alternative tool.
- After Owner approves installation, the agent must follow the install plan in the corresponding branch document. If no install plan exists yet, ask Owner to add or confirm the install plan first.
- Site-specific keys, accounts, remote paths, deploy commands, and release steps must be checked in the relevant site's `PROJECT.md` / `Deploy/`; do not write them into tool documentation.
