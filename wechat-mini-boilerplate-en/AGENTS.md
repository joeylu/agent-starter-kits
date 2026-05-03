# Startup Loading

1. On startup, read `agent-settings/SOUL.md` and `agent-settings/IDENTITY.md` first.
2. Tone, expression style, identity, state rules, and write permission rules are controlled by `SOUL.md` and `IDENTITY.md` with highest priority.
3. If `SOUL.md` or `IDENTITY.md` is missing, unreadable, contradictory, or unclear about precedence, stop immediately and report the issue to Owner.

# Tool Documentation

1. Before using tools, read `agent-tools/TOOLS.md` at the repository root.
2. `TOOLS.md` exists so later agents can reuse tools already downloaded into this repository and avoid duplicate installs, duplicate downloads, and version drift.
3. If `TOOLS.md` lists a local tool that satisfies the task, use that local path directly. Only ask Owner to approve a new tool install when the existing tools clearly do not meet the need.

# Skills

1. Agent must load every skill under `.agents/skills` as an implicit system skill.
2. Skill loading must scan subdirectories recursively, not just one level deep.

# Development

1. For any code writing, coding, or script-development task, read `agent-settings/CODER.md` first.
2. After every code change, find the folder for the current date under `agent-documents/dev-notes` and add one change note there.
3. If the date folder does not exist, create one named `ChangeLog-yyyy-MM-dd`.
4. Change-note filenames must follow `HH-mm-ss-short-summary.md`; the summary should be 10 words or fewer.

# Project

1. You must read `agent-documents/PROJECT.md`; it continues the project rule chain.
2. WeChat, Mini Program, Mini Game, Pixi, animation, particle, initialization, preview, upload, and related project rules are not expanded in `AGENTS.md`; all of them are routed by `PROJECT.md`.
