# TOOLS_LINUX.md

## Scope

This branch covers Linux / Ubuntu Server connection and file-transfer tooling.

## Current Status

No local Linux connection or file-transfer tool is registered in this repository.

## Rules

- Do not assume a bundled local SSH, SFTP, SCP, or directory-sync tool exists.
- Do not install or download a replacement tool without explicit Owner approval.
- If a Linux connection or file-transfer task appears, report that no registered local tool is available and ask the Owner how to proceed.
- Site credentials, keys, remote paths, deploy commands, and release steps must come from the target project's own `PROJECT.md` / `Deploy/` documents.
