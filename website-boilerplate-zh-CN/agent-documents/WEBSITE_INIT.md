# WEBSITE_INIT.md

## 触发口令
用户说以下任一句：

```text
初始化当前网站
初始化这个网站
初始化当前的 web
初始化当前的web
初始化这个网站项目
初始化 web
初始化web
```

AI 必须直接初始化 `web/` 内的网站项目，不再追问确认。

## 初始化目标
生成一个最小可运行的本地教学网站：

- Next.js App Router
- React
- TypeScript
- PixiJS v8
- npm
- Windows 11 本地运行

## 执行顺序
1. 读取 `agent-tools/TOOLS.md`
2. 读取 `agent-documents/PROJECT.md`
3. 读取 `agent-settings/CODER.md`
4. 检查 `node --version`
5. 检查 `npm --version`
6. 检查 `web/`
7. 创建或修复固定文件清单
8. 运行 `agent-documents/Local/Start-Website.ps1`
9. 脚本自动执行 `npm install`
10. 脚本自动执行 `npm run build`
11. 脚本后台启动本地预览
12. 返回实际 localhost 地址

如果 Node.js 或 npm 不可用，立即停止并报告：Node.js LTS 未正确安装。

## 固定文件清单
空 `web/` 初始化时，必须创建：

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

已有文件时，不得整目录覆盖；只补齐缺失文件，或最小修改明显不符合本规范的文件。

## package.json
`web/package.json` 必须包含：

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

如果 npm registry 拒绝某个版本范围，只允许把被拒绝的包改为 `latest`，不得换技术栈或包管理器。

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
  title: "初始网站",
  description: "本地 Next.js 和 PixiJS v8 教学模板"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
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
          <p className="eyebrow">本地教学模板</p>
          <h1>初始网站</h1>
          <p className="summary">Next.js 正在本地运行，并带有 PixiJS v8 canvas。</p>
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

## PixiJS v8 硬规则
- 必须写 `'use client'`。
- Next.js 中 PixiJS 运行时代码必须在 `useEffect` 里动态导入。
- 必须 `new Application()`，再 `await app.init(...)`。
- 必须挂载 `app.canvas`。
- 必须在组件卸载时 `app.destroy(...)`。
- 禁止 `new Application({ ... })`。
- 禁止 `app.view`。
- 禁止 `beginFill` / `endFill`。

## 初始化后的命令
在项目根目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\agent-documents\Local\Start-Website.ps1
```

不要直接前台运行 `npm run dev`。启动脚本会先安装依赖和构建，再后台启动开发服务器，检测 localhost 可访问后输出最终地址。

## 成功回复口径
初始化成功后，回复必须包含：

- 已创建或修复的文件
- `npm install` 结果
- `npm run build` 结果
- 本地预览地址
- 后台服务 PID
- 编码检查结果
