# WEBSITE_INIT.md

## Trigger Phrases
When the user says any of:

```text
initialize current website
initialize this website
initialize current web
initialize this website project
initialize web
```

AI must directly initialize the website project under `web/` without asking for another confirmation.

## Initialization Goal
Generate a minimum runnable local teaching website:

- Next.js App Router
- React
- TypeScript
- PixiJS v8
- npm
- local Windows 11 runtime

## Execution Order
1. Read `agent-tools/TOOLS.md`.
2. Read `agent-documents/PROJECT.md`.
3. Read `agent-settings/CODER.md`.
4. Check `node --version`.
5. Check `npm --version`.
6. Check `web/`.
7. Create or repair the fixed file list.
8. Run `agent-documents/Local/Start-Website.ps1`.
9. The script automatically runs `npm install`.
10. The script automatically runs `npm run build`.
11. The script starts local preview in the background.
12. Return the actual localhost URL.

If Node.js or npm is unavailable, stop immediately and report: Node.js LTS is not installed correctly.

## Fixed File List
When initializing an empty `web/`, create:

```text
web/package.json
web/next.config.mjs
web/tsconfig.json
web/app/layout.tsx
web/app/page.tsx
web/app/globals.css
web/components/PixiStage.tsx
web/public/.gitkeep
```

For existing files, do not overwrite the whole directory. Only fill missing files or minimally fix files that clearly violate this specification.

## package.json
`web/package.json` must contain:

```json
{
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^16.0.0",
    "pixi.js": "^8.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "typescript": "latest"
  }
}
```

If npm registry rejects a version range, only the rejected package may be changed to `latest`. Do not change the stack or package manager.

## next.config.mjs
```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

## tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## app/layout.tsx
```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Initial Website",
  description: "Local Next.js and PixiJS v8 teaching template"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## app/page.tsx
```tsx
import PixiStage from "@/components/PixiStage";

export default function Home() {
  return (
    <main className="pageShell">
      <section className="hero">
        <div className="heroText">
          <p className="eyebrow">Local teaching template</p>
          <h1>Initial Website</h1>
          <p className="summary">Next.js is running locally with a PixiJS v8 canvas.</p>
        </div>
        <PixiStage />
      </section>
    </main>
  );
}
```

## app/globals.css
```css
* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  margin: 0;
}

body {
  font-family: Arial, "Microsoft YaHei", sans-serif;
  color: #f8fafc;
  background: #101820;
}

.pageShell {
  min-height: 100vh;
  padding: 32px;
  display: grid;
  place-items: center;
}

.hero {
  width: min(1080px, 100%);
  display: grid;
  grid-template-columns: minmax(260px, 0.85fr) minmax(320px, 1.15fr);
  gap: 28px;
  align-items: center;
}

.heroText {
  display: grid;
  gap: 14px;
}

.eyebrow {
  margin: 0;
  color: #7dd3fc;
  font-size: 14px;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 56px;
  line-height: 1;
}

.summary {
  margin: 0;
  color: #cbd5e1;
  font-size: 18px;
  line-height: 1.6;
}

.pixiStage {
  width: 100%;
  height: 420px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: #07111f;
}

.pixiStage canvas {
  display: block;
  width: 100%;
  height: 100%;
}

@media (max-width: 760px) {
  .pageShell {
    padding: 20px;
  }

  .hero {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 40px;
  }

  .pixiStage {
    height: 320px;
  }
}
```

## components/PixiStage.tsx
```tsx
"use client";

import { useEffect, useRef } from "react";
import type { Application as PixiApplication } from "pixi.js";

export default function PixiStage() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let app: PixiApplication | null = null;
    let isDisposed = false;

    async function boot() {
      const host = hostRef.current;
      if (!host) {
        return;
      }

      const { Application, Container, Graphics } = await import("pixi.js");

      app = new Application();
      await app.init({
        resizeTo: host,
        background: "#07111f",
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2)
      });

      if (isDisposed || !hostRef.current) {
        app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true });
        return;
      }

      host.appendChild(app.canvas);

      const scene = new Container();
      app.stage.addChild(scene);

      const orbit = new Graphics()
        .circle(0, 0, 84)
        .stroke({ color: 0x38bdf8, alpha: 0.28, width: 2 });

      const core = new Graphics()
        .circle(0, 0, 52)
        .fill(0x22d3ee)
        .stroke({ color: 0xffffff, alpha: 0.42, width: 2 });

      const satellite = new Graphics().circle(0, 0, 16).fill(0xfacc15);

      scene.addChild(orbit, core, satellite);

      let angle = 0;
      app.ticker.add((ticker) => {
        if (!app) {
          return;
        }

        angle += 0.025 * ticker.deltaTime;
        const centerX = app.screen.width / 2;
        const centerY = app.screen.height / 2;

        orbit.position.set(centerX, centerY);
        core.position.set(centerX, centerY);
        satellite.position.set(centerX + Math.cos(angle) * 84, centerY + Math.sin(angle) * 84);
        core.rotation += 0.01 * ticker.deltaTime;
      });
    }

    void boot();

    return () => {
      isDisposed = true;
      if (app) {
        app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true });
      }
    };
  }, []);

  return <div ref={hostRef} className="pixiStage" aria-label="PixiJS v8 canvas" />;
}
```

## PixiJS v8 Hard Rules
- Must include `'use client'`.
- In Next.js, PixiJS runtime code must be dynamically imported inside `useEffect`.
- Must use `new Application()`, then `await app.init(...)`.
- Must mount `app.canvas`.
- Must call `app.destroy(...)` when the component unmounts.
- Do not use `new Application({ ... })`.
- Do not use `app.view`.
- Do not use `beginFill` / `endFill`.

## Command After Initialization
Run from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Start-Website.ps1
```

Do not run `npm run dev` in the foreground. The start script installs dependencies, builds, starts the development server in the background, checks localhost accessibility, and outputs the final URL.

## Successful Reply Requirements
After successful initialization, the reply must include:

- created or repaired files
- `npm install` result
- `npm run build` result
- local preview URL
- background service PID
- Encoding Check result
