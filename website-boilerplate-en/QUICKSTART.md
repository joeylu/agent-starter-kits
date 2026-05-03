# Website Boilerplate Quickstart

This template helps you create a local website workspace that an AI coding agent can work on directly.

Start from this boilerplate, open the project in any AI-agent-capable development tool, and describe what you want in natural language. The agent follows the template rules to initialize, develop, build, and preview the site inside `web/`.

## 1. Create A Workspace

Copy `website-boilerplate-en` and use the copy as your new website project folder.

Open that folder in a tool that supports AI agents, such as VSCode, Claude, Codex, OpenCode, or a similar environment.

## 2. Initialize The Website

Ask the agent to initialize the current website, or use similar natural language.

The agent initializes a local website project under `web/`. The default stack is:

```text
Next.js + React + TypeScript + PixiJS v8
```

After initialization, the agent installs dependencies, runs a build check, and starts a local preview.

## 3. Local Deploy And Preview

After the website has been initialized, ask the agent to deploy, preview, start, or use similar natural language.

In this template, deployment means local deployment: the agent builds the current website and starts a localhost preview that you can open in a browser.

The default URL is usually:

```text
http://localhost:3000
```

If that port is busy, the agent uses another local port.

## 4. Develop With Natural Language

You can describe the feature or experience you want directly, for example:

```text
Turn the home page into a product showcase.
Add an expandable intro section after clicking a button.
Build a small browser game where I can drag a ball around.
Build a clicker game that creates coins when I tap the screen.
```

The agent works in the real website files under `web/`.

## 5. Animation And Particles

When you mention animation, frame sequences, particles, smoke, fire, splashes, trails, or similar visual effects, the agent will try to build them with PixiJS.

For example:

```text
Turn this frame-sequence image into a looping animation.
Add a particle burst when the button is clicked.
Create a slow drifting smoke layer.
Add glowing particles around this icon.
```

A frame-sequence image is one image that contains multiple animation frames arranged in a grid, such as a 3x3 character motion sheet.

## 6. Boundary

This template is for local website development and local preview.

It does not publish the site online, manage servers, handle domains, configure certificates, or deploy to the public internet.
