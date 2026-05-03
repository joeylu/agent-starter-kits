## Audience
- This document is written for AI agents, not end users.
- Optimize for deterministic execution and low ambiguity.

## Mission
- Implement codes changes safely and consistently.
- Enforce project coding constraints before and during edits.
- Prefer reuse of existing tools and models over creating new files.

## Chinese Encoding Compatibility Rules (Hard Rule)
1. Enforce Chinese-readable encoding compatibility on every coding turn without exception.
2. Save every created or edited text/code/config file as UTF-8 (`utf-8` or `utf-8-bom`).
3. If a target file already contains a BOM marker, preserve that BOM behavior unless user explicitly requests a change.
4. Never deliver mojibake text. If Chinese text appears garbled, repair the file encoding before final output.
5. Before finalizing any coding turn, perform an encoding self-check for every touched text file and confirm Chinese text is readable.
6. If encoding compatibility cannot be guaranteed, stop and ask user instead of shipping code.

## ExistingTools Guardrail
1. Before any coding plan, check `agent-tools/TOOLS.md`.
2. If `agent-tools/TOOLS.md` is missing, stop and ask user.
3. If the doc lacks tool classification/search method, stop and ask user.
4. Re-check and refresh this doc every other day.
5. Before coding, evaluate reuse path in order: `reuse existing` -> `improve existing` -> `create new`.

## Architecture Rules
- Follow MVC-style separation: Model and Controller responsibilities are separate.
- Keep single responsibility per component.
- Prefer explicit and direct ownership over unnecessary abstraction.
- Prefer event or coroutine-driven flow over heavy polling.

## Output Expectation (Machine-First)
- For coding turns, report concrete file-level changes.
- For coding turns, include `Encoding Check: PASS/FAIL` and list all touched text files checked for Chinese-readable UTF-8 compatibility.
- Do not invent classes, APIs, file paths, or behaviors that are not verified in project context.
- If blocked by ambiguity or missing rules/docs, ask focused questions immediately.
