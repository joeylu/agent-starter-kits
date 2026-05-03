# MINIAPP.md

## Purpose

This document is the hard rule set for WeChat Mini Program work in this repository.

It applies only when `/wechat/app.json` exists and the project has been detected as **WeChat Mini Program** by `WECHAT.md`.

If the project is detected as **WeChat Mini Game**, this document must not be used as the implementation standard.

---

## Hard Entry Rule

When `WECHAT.md` detects a Mini Program, the agent must read this file before any Mini Program design, source edit, initialization, refactor, test, preview, upload, or deployment work.

If this file is missing or unreadable, stop.

---

## Project Boundary

All real Mini Program project files live under:

- `/wechat`

All agent documents live under:

- `/agent-documents`

Do not create notes, README files, process documents, summaries, or agent workflow files inside `/wechat`.

---

## Mini Program Identity

A Mini Program is page-driven.

The canonical signals are:

- `/wechat/app.json`
- page routes declared in `app.json`
- page files using Mini Program page conventions
- WXML for structure
- WXSS for style
- JavaScript for behavior unless the existing project already uses another source layer

Do not treat a Mini Program as a Mini Game.

Do not introduce a game loop, canvas-first runtime, physics loop, or asset-loader architecture unless the Owner explicitly changes the project type or asks for a game-like feature.

---

## File Structure Rules

Mini Program work must respect these boundaries:

- `app.json` owns global Mini Program configuration and page route registration.
- `app.js` owns global application lifecycle and global bootstrapping only.
- `app.wxss` owns global style only.
- Each page must live in its own page directory.
- A page directory should keep its related `.js`, `.json`, `.wxml`, and `.wxss` files together.
- Reusable UI belongs in components, not copied page markup.
- Reusable non-UI logic belongs in utility or service modules, not page files.

Do not scatter page logic across unrelated folders.

Do not put agent documents or deployment notes in page folders.

---

## Runtime Rules

Mini Program code must use the WeChat Mini Program runtime model:

- use `App`, `Page`, and `Component` lifecycles where appropriate
- use `wx.*` APIs for platform capabilities
- do not assume browser DOM APIs such as `window`, `document`, `localStorage`, or direct DOM mutation
- do not assume standard web routing
- do not assume npm packages are usable in runtime unless they are compatible with the Mini Program environment and build behavior

If a dependency requires browser DOM, Node runtime APIs, native modules, or unsupported globals, do not add it.

---

## Page And Component Rules

Pages are route-level containers.

Components are reusable UI and interaction units.

Rules:

- Page files may coordinate data loading, navigation, and page-level state.
- Components must avoid owning route decisions unless that is their explicit purpose.
- Component public properties must be explicit.
- Component events must be named by user intent, not by implementation detail.
- Avoid large page files that mix network, rendering, storage, validation, and navigation logic.

When logic starts serving more than one page, move it out of the page.

---

## Data And State Rules

State must stay close to its owner.

Rules:

- Page-local state stays in the page.
- Component-local state stays in the component.
- Cross-page state must be explicit and documented in code structure.
- Persisted data must use stable keys and a project-specific prefix.
- Do not store secrets in client-side storage.
- Do not treat client-side storage as authoritative for server-owned data.

Network request results should be validated before they are used to render critical UI.

---

## UI Rules

Mini Program UI must be built with WXML and WXSS.

Rules:

- use responsive layout units appropriate for Mini Program screens
- account for safe areas and common mobile screen sizes
- keep tap targets usable on mobile
- keep page loading, empty, error, and success states explicit
- avoid text overflow in buttons, tabs, cards, and compact controls
- do not rely on hover-only interaction

If a feature needs a canvas, isolate it as a specific component or page feature, not as the default app architecture.

---

## Navigation Rules

Navigation must follow Mini Program routing behavior.

Rules:

- all routable pages must be declared in `app.json`
- navigation must use supported WeChat navigation APIs
- tab pages and normal pages must not be mixed casually
- route parameters must be validated before use
- back behavior must be considered for every new user flow

Do not invent a client-side router.

---

## Network And Permission Rules

Network and permission work must be explicit.

Rules:

- use `wx.request` or existing project-approved request wrappers
- document required server domains when a feature depends on network access
- handle request failure, timeout, and invalid response shapes
- request user permission only at the point of need
- explain why a permission is needed in user-facing copy when the platform requires it

Do not hard-code private credentials in Mini Program source files.

---

## Testing And Verification Rules

For Mini Program changes, verify the smallest useful surface:

- syntax and lint checks if configured
- page route registration when pages are added or moved
- preview command when behavior or configuration changes affect runtime
- upload command only when the Owner asks for upload

Do not claim review submission or final release. Those remain human web-console actions.

