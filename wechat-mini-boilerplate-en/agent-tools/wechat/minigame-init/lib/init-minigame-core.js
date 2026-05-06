'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  copyFileIfChanged,
  createPackageName,
  ensureDir,
  ensureLines,
  ensureWechatProjectRoot,
  readJson,
  readUtf8,
  toPosixPath,
  writeJsonIfChanged,
  writeTextIfChanged
} = require('./shared');

const BASELINE_ROOT = path.join('agent-tools', 'wechat', 'minigame-init', 'assets', 'pixi4-baseline');

const REQUIRED_BASELINE_FILES = [
  'libs/weapp-adapter.js',
  'libs/pixi.js',
  'game.js',
  'src/index.js',
  'src/config.js'
];

const REQUIRED_PROJECT_DIRS = [
  'src/scenes',
  'src/base',
  'src/common',
  'images',
  'user-assets'
];

const PROJECT_GITIGNORE_LINES = [
  '*.key',
  'node_modules/',
  'preview/'
];

const REMOVED_GITIGNORE_LINES = [
  'miniprogram_npm/',
  'js/vendor/pixi-runtime.js'
];

const LEGACY_PIXI6_DIRECTORIES = [
  'miniprogram_npm',
  'node_modules/pixi.js',
  'node_modules/@pixi'
];

const LEGACY_PIXI6_FILES = [
  'js/vendor/pixi-runtime.js',
  'scripts/build-npm.js'
];

const LEGACY_PIXI6_LOCK_MARKERS = [
  '"pixi.js": "6',
  '"@pixi/unsafe-eval"',
  'node_modules/pixi.js',
  'node_modules/@pixi'
];

function parseArgs(argv) {
  const options = {
    projectRoot: 'wechat'
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--project-root') {
      options.projectRoot = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === '--skip-install' || token === '--skip-build' || token === '--sync-only') {
      continue;
    }

    throw new Error(`Unsupported argument: ${token}`);
  }

  if (!options.projectRoot) {
    throw new Error('Missing --project-root value.');
  }

  return options;
}

function block(message) {
  throw new Error(`BLOCKED ${message}`);
}

function ensureFileExists(filePath, message) {
  if (!fs.existsSync(filePath)) {
    block(message);
  }
}

function ensurePixiVersion(sourcePixiPath) {
  const pixiContent = readUtf8(sourcePixiPath);

  if (!pixiContent.includes('4.8.2')) {
    block(`Missing Pixi 4.8.2 marker in local baseline asset: ${sourcePixiPath}`);
  }
}

function ensureBaselineAssets(repoRoot) {
  const baselineRoot = path.join(repoRoot, BASELINE_ROOT);
  const missing = REQUIRED_BASELINE_FILES
    .map((relativePath) => path.join(baselineRoot, relativePath))
    .filter((filePath) => !fs.existsSync(filePath));

  if (missing.length > 0) {
    block(`Missing local official Pixi4 baseline assets: ${missing.map((filePath) => path.relative(repoRoot, filePath).replace(/\\/g, '/')).join(', ')}. Add official minigame-lockstep-demo baseline files under ${BASELINE_ROOT} before running initialization.`);
  }

  ensurePixiVersion(path.join(baselineRoot, 'libs', 'pixi.js'));

  return baselineRoot;
}

function mergePackageJson(existingPackageJson, repoRoot) {
  const packageJson = { ...existingPackageJson };

  packageJson.name = packageJson.name || createPackageName(repoRoot);
  packageJson.version = packageJson.version || '1.0.0';
  packageJson.private = true;
  packageJson.description = 'WeChat Mini Game Pixi4 project shell';
  packageJson.engines = {
    node: '>=20'
  };
  packageJson.scripts = {
    ...(packageJson.scripts || {}),
    preview: 'node scripts/preview.js',
    upload: 'node scripts/upload.js'
  };

  delete packageJson.wechatUpload;
  delete packageJson.scripts['build:npm'];

  if (packageJson.dependencies) {
    delete packageJson.dependencies['pixi.js'];
    if (Object.keys(packageJson.dependencies).length === 0) {
      delete packageJson.dependencies;
    }
  }

  if (packageJson.devDependencies) {
    delete packageJson.devDependencies['@pixi/unsafe-eval'];
    if (Object.keys(packageJson.devDependencies).length === 0) {
      delete packageJson.devDependencies;
    }
  }

  if (packageJson.overrides) {
    delete packageJson.overrides.less;
    if (Object.keys(packageJson.overrides).length === 0) {
      delete packageJson.overrides;
    }
  }

  return packageJson;
}

function mergeProjectConfig(existingProjectConfig) {
  const nextProjectConfig = { ...existingProjectConfig };
  const compileType = nextProjectConfig.compileType;

  if (compileType && compileType !== 'game') {
    block(`Invalid project.config.json compileType: ${compileType}. Mini Game initialization requires compileType=game.`);
  }

  nextProjectConfig.compileType = 'game';

  return nextProjectConfig;
}

function createWrapperContent(coreFileName, exportName, commandLabel) {
  const relativeCorePath = toPosixPath(path.join('..', '..', 'agent-tools', 'wechat', 'minigame-init', 'lib', coreFileName));

  return `'use strict';

const path = require('node:path');
const { ${exportName} } = require(path.resolve(__dirname, ${JSON.stringify(relativeCorePath)}));

${exportName}(path.resolve(__dirname, '..')).catch((error) => {
  console.error(\`[${commandLabel}] \${error && error.message ? error.message : String(error)}\`);
  process.exit(1);
});
`;
}

function reportSyncedFiles(results) {
  if (results.length === 0) {
    console.log('[init] Project shell already matches the shared Mini Game Pixi4 baseline.');
    return;
  }

  console.log('[init] Updated files:');
  results.forEach((item) => console.log(`[init] - ${item}`));
}

function removeLines(existingContent, removedLines) {
  const removed = new Set(removedLines);

  return existingContent
    .replace(/\r?\n/g, '\n')
    .split('\n')
    .filter((line) => !removed.has(line.trim()))
    .join('\n');
}

function removeLegacyPath(projectRoot, relativePath) {
  const targetPath = path.resolve(projectRoot, relativePath);
  const safeRoot = `${path.resolve(projectRoot)}${path.sep}`;

  if (targetPath !== path.resolve(projectRoot) && !targetPath.startsWith(safeRoot)) {
    block(`Refusing to remove legacy path outside /wechat: ${relativePath}`);
  }

  if (!fs.existsSync(targetPath)) {
    return false;
  }

  fs.rmSync(targetPath, { recursive: true, force: true });
  return true;
}

function removeEmptyDirectory(projectRoot, relativePath) {
  const targetPath = path.resolve(projectRoot, relativePath);
  const safeRoot = `${path.resolve(projectRoot)}${path.sep}`;

  if (targetPath !== path.resolve(projectRoot) && !targetPath.startsWith(safeRoot)) {
    block(`Refusing to remove directory outside /wechat: ${relativePath}`);
  }

  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
    return false;
  }

  if (fs.readdirSync(targetPath).length > 0) {
    return false;
  }

  fs.rmdirSync(targetPath);
  return true;
}

function removeLegacyPackageLock(projectRoot) {
  const packageLockPath = path.join(projectRoot, 'package-lock.json');

  if (!fs.existsSync(packageLockPath)) {
    return false;
  }

  const packageLockContent = readUtf8(packageLockPath);
  const hasLegacyPixi = LEGACY_PIXI6_LOCK_MARKERS.some((marker) => packageLockContent.includes(marker));

  if (!hasLegacyPixi) {
    return false;
  }

  return removeLegacyPath(projectRoot, 'package-lock.json');
}

function cleanupLegacyPixi6(projectRoot, repoRoot) {
  const removed = [];

  LEGACY_PIXI6_DIRECTORIES.concat(LEGACY_PIXI6_FILES).forEach((relativePath) => {
    if (removeLegacyPath(projectRoot, relativePath)) {
      removed.push(path.relative(repoRoot, path.join(projectRoot, relativePath)).replace(/\\/g, '/'));
    }
  });

  if (removeLegacyPackageLock(projectRoot)) {
    removed.push('wechat/package-lock.json');
  }

  ['js/vendor', 'js', 'node_modules'].forEach((relativePath) => {
    if (removeEmptyDirectory(projectRoot, relativePath)) {
      removed.push(path.relative(repoRoot, path.join(projectRoot, relativePath)).replace(/\\/g, '/'));
    }
  });

  return removed;
}

function verifyStartupRoute(projectRoot) {
  const gameJs = readUtf8(path.join(projectRoot, 'game.js'));
  const indexJs = readUtf8(path.join(projectRoot, 'src', 'index.js'));

  const checks = [
    {
      ok: gameJs.includes("import './libs/weapp-adapter'") || gameJs.includes('import "./libs/weapp-adapter"'),
      message: 'game.js must import ./libs/weapp-adapter'
    },
    {
      ok: gameJs.includes("import App from './src/index.js'") || gameJs.includes('import App from "./src/index.js"'),
      message: 'game.js must import ./src/index.js as App'
    },
    {
      ok: gameJs.includes('new App()') || gameJs.includes('new App('),
      message: 'game.js must instantiate new App()'
    },
    {
      ok: indexJs.includes("import * as PIXI from '../libs/pixi.js'") || indexJs.includes('import * as PIXI from "../libs/pixi.js"'),
      message: 'src/index.js must import Pixi from ../libs/pixi.js'
    },
    {
      ok: /class\s+App\s+extends\s+PIXI\.Application/.test(indexJs),
      message: 'src/index.js must define App extends PIXI.Application'
    }
  ];

  const failed = checks.find((check) => !check.ok);

  if (failed) {
    block(failed.message);
  }
}

async function runInit(repoRoot, options) {
  const resolvedRepoRoot = path.resolve(repoRoot);
  const projectRoot = path.resolve(resolvedRepoRoot, options.projectRoot);
  const scriptsDir = path.join(projectRoot, 'scripts');
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const projectConfigPath = path.join(projectRoot, 'project.config.json');
  const gitIgnorePath = path.join(projectRoot, '.gitignore');
  const gameJsonPath = path.join(projectRoot, 'game.json');
  const appJsonPath = path.join(projectRoot, 'app.json');
  const results = [];

  ensureWechatProjectRoot(projectRoot, resolvedRepoRoot);
  ensureFileExists(gameJsonPath, `Missing ${gameJsonPath}. This initializer is Mini Game-only and expects an existing WeChat DevTools Mini Game shell under /wechat.`);
  if (fs.existsSync(appJsonPath)) {
    block(`Project type conflict: ${appJsonPath} exists. Mini Game initialization requires /wechat/game.json without /wechat/app.json.`);
  }
  ensureFileExists(projectConfigPath, `Missing ${projectConfigPath}. Restore the WeChat DevTools Mini Game shell before initialization.`);

  const baselineRoot = ensureBaselineAssets(resolvedRepoRoot);

  results.push(...cleanupLegacyPixi6(projectRoot, resolvedRepoRoot));

  ensureDir(scriptsDir);

  REQUIRED_BASELINE_FILES.forEach((relativePath) => {
    const sourcePath = path.join(baselineRoot, relativePath);
    const targetPath = path.join(projectRoot, relativePath);

    if (copyFileIfChanged(sourcePath, targetPath)) {
      results.push(path.relative(resolvedRepoRoot, targetPath).replace(/\\/g, '/'));
    }
  });

  REQUIRED_PROJECT_DIRS.forEach((relativePath) => {
    const dirPath = path.join(projectRoot, relativePath);

    if (!fs.existsSync(dirPath)) {
      ensureDir(dirPath);
      results.push(path.relative(resolvedRepoRoot, dirPath).replace(/\\/g, '/'));
    }
  });

  const existingPackageJson = fs.existsSync(packageJsonPath) ? readJson(packageJsonPath) : {};
  const nextPackageJson = mergePackageJson(existingPackageJson, resolvedRepoRoot);

  if (writeJsonIfChanged(packageJsonPath, nextPackageJson)) {
    results.push('wechat/package.json');
  }

  const existingProjectConfig = readJson(projectConfigPath);
  const nextProjectConfig = mergeProjectConfig(existingProjectConfig);

  if (writeJsonIfChanged(projectConfigPath, nextProjectConfig)) {
    results.push('wechat/project.config.json');
  }

  const existingGitIgnore = fs.existsSync(gitIgnorePath) ? readUtf8(gitIgnorePath) : '';
  const cleanedGitIgnore = removeLines(existingGitIgnore, REMOVED_GITIGNORE_LINES);
  const nextGitIgnore = ensureLines(cleanedGitIgnore, PROJECT_GITIGNORE_LINES);

  if (writeTextIfChanged(gitIgnorePath, nextGitIgnore)) {
    results.push('wechat/.gitignore');
  }

  const wrapperFiles = [
    {
      filePath: path.join(scriptsDir, 'preview.js'),
      content: createWrapperContent('preview-core.js', 'runPreview', 'preview')
    },
    {
      filePath: path.join(scriptsDir, 'upload.js'),
      content: createWrapperContent('upload-core.js', 'runUpload', 'upload')
    }
  ];

  wrapperFiles.forEach((wrapperFile) => {
    if (writeTextIfChanged(wrapperFile.filePath, wrapperFile.content)) {
      results.push(path.relative(resolvedRepoRoot, wrapperFile.filePath).replace(/\\/g, '/'));
    }
  });

  verifyStartupRoute(projectRoot);

  reportSyncedFiles(results);
  console.log('[init] PASS /wechat Mini Game Pixi4 baseline is synced.');
}

async function runInitFromArgs(argv, repoRoot) {
  const options = parseArgs(argv);
  await runInit(repoRoot, options);
}

module.exports = {
  runInit,
  runInitFromArgs
};
