'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const { runBuildNpm } = require('./build-npm-core');

const {
  copyDirectoryIfChanged,
  createPackageName,
  ensureDir,
  ensureLines,
  ensureWechatProjectRoot,
  loadVersions,
  readJson,
  readUtf8,
  toPosixPath,
  writeJsonIfChanged,
  writeTextIfChanged
} = require('./shared');

const PROJECT_GITIGNORE_LINES = [
  '*.key',
  'node_modules/',
  'miniprogram_npm/',
  'preview/',
  'js/vendor/pixi-runtime.js'
];

function parseArgs(argv) {
  const options = {
    projectRoot: 'wechat',
    skipInstall: false,
    skipBuild: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--project-root') {
      options.projectRoot = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === '--skip-install') {
      options.skipInstall = true;
      continue;
    }

    if (token === '--skip-build') {
      options.skipBuild = true;
      continue;
    }

    if (token === '--sync-only') {
      options.skipInstall = true;
      options.skipBuild = true;
      continue;
    }

    throw new Error(`Unsupported argument: ${token}`);
  }

  if (!options.projectRoot) {
    throw new Error('Missing --project-root value.');
  }

  return options;
}

function installDependencies(projectRoot) {
  const result = process.platform === 'win32'
    ? childProcess.spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm install'], {
      cwd: projectRoot,
      stdio: 'inherit',
      windowsHide: true
    })
    : childProcess.spawnSync('npm', ['install'], {
      cwd: projectRoot,
      stdio: 'inherit'
    });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`npm install failed with exit code ${result.status}`);
  }
}

function mergePackageJson(existingPackageJson, versions, repoRoot) {
  const packageJson = { ...existingPackageJson };

  packageJson.name = packageJson.name || createPackageName(repoRoot);
  packageJson.version = packageJson.version || versions.defaults.version;
  packageJson.private = true;
  packageJson.description = packageJson.description || versions.defaults.description;
  packageJson.scripts = {
    ...(packageJson.scripts || {}),
    ...versions.scripts
  };
  packageJson.dependencies = {
    ...(packageJson.dependencies || {}),
    ...versions.dependencies
  };
  packageJson.devDependencies = {
    ...(packageJson.devDependencies || {}),
    ...versions.devDependencies
  };
  packageJson.overrides = {
    ...(packageJson.overrides || {}),
    ...(versions.overrides || {})
  };
  packageJson.engines = {
    ...(packageJson.engines || {}),
    ...versions.engines
  };

  return packageJson;
}

function mergeProjectConfig(existingProjectConfig, versions) {
  const nextProjectConfig = { ...existingProjectConfig };
  const expectedSetting = versions.projectConfig && versions.projectConfig.setting
    ? versions.projectConfig.setting
    : {};

  nextProjectConfig.compileType = nextProjectConfig.compileType || 'game';
  nextProjectConfig.setting = {
    ...(nextProjectConfig.setting || {}),
    ...expectedSetting
  };

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
    console.log('[init] Project shell already matches the shared Mini Game baseline.');
    return;
  }

  console.log('[init] Updated files:');
  results.forEach((item) => console.log(`[init] - ${item}`));
}

function syncParticleLibrary(resolvedRepoRoot, projectRoot) {
  const sourceLibraryRoot = path.join(resolvedRepoRoot, 'user-assets', 'particle-library');
  const targetLibraryRoot = path.join(projectRoot, 'user-assets', 'particle-library');
  const sourceIndexPath = path.join(sourceLibraryRoot, 'index.js');

  if (!fs.existsSync(sourceLibraryRoot)) {
    throw new Error(`Missing default particle library: ${sourceLibraryRoot}. Create user-assets/particle-library before running Mini Game initialization.`);
  }

  if (!fs.existsSync(sourceIndexPath)) {
    throw new Error(`Missing default particle library index: ${sourceIndexPath}.`);
  }

  return copyDirectoryIfChanged(sourceLibraryRoot, targetLibraryRoot)
    .map((filePath) => path.relative(resolvedRepoRoot, filePath).replace(/\\/g, '/'));
}

async function runInit(repoRoot, options) {
  const resolvedRepoRoot = path.resolve(repoRoot);
  const versions = loadVersions(resolvedRepoRoot);
  const projectRoot = path.resolve(resolvedRepoRoot, options.projectRoot);
  const scriptsDir = path.join(projectRoot, 'scripts');
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const projectConfigPath = path.join(projectRoot, 'project.config.json');
  const gitIgnorePath = path.join(projectRoot, '.gitignore');
  const gameJsonPath = path.join(projectRoot, 'game.json');
  const results = [];

  ensureWechatProjectRoot(projectRoot);

  if (!fs.existsSync(gameJsonPath)) {
    throw new Error(`Missing ${gameJsonPath}. This initializer is Mini Game-only and expects an existing WeChat DevTools Mini Game shell under /wechat. Recreate the shell first so game.json exists, then rerun node scripts/init-wechat-minigame.js --project-root wechat.`);
  }

  if (!fs.existsSync(projectConfigPath)) {
    throw new Error(`Missing ${projectConfigPath}. Recreate or restore the WeChat DevTools Mini Game shell under /wechat so project.config.json exists, then rerun node scripts/init-wechat-minigame.js --project-root wechat.`);
  }

  ensureDir(scriptsDir);

  results.push(...syncParticleLibrary(resolvedRepoRoot, projectRoot));

  const existingPackageJson = fs.existsSync(packageJsonPath) ? readJson(packageJsonPath) : {};
  const nextPackageJson = mergePackageJson(existingPackageJson, versions, resolvedRepoRoot);

  if (writeJsonIfChanged(packageJsonPath, nextPackageJson)) {
    results.push('wechat/package.json');
  }

  const existingProjectConfig = readJson(projectConfigPath);
  const nextProjectConfig = mergeProjectConfig(existingProjectConfig, versions);

  if (writeJsonIfChanged(projectConfigPath, nextProjectConfig)) {
    results.push('wechat/project.config.json');
  }

  const existingGitIgnore = fs.existsSync(gitIgnorePath) ? readUtf8(gitIgnorePath) : '';
  const nextGitIgnore = ensureLines(existingGitIgnore, PROJECT_GITIGNORE_LINES);

  if (writeTextIfChanged(gitIgnorePath, nextGitIgnore)) {
    results.push('wechat/.gitignore');
  }

  const wrapperFiles = [
    {
      filePath: path.join(scriptsDir, 'build-npm.js'),
      content: createWrapperContent('build-npm-core.js', 'runBuildNpm', 'build:npm')
    },
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

  reportSyncedFiles(results);

  if (!options.skipInstall) {
    console.log('[init] Running npm install inside /wechat to install the pinned Pixi and WeChat build toolchain.');
    installDependencies(projectRoot);
  } else {
    console.log('[init] Skipped npm install.');
  }

  if (!options.skipBuild) {
    console.log('[init] Running build:npm to validate the shared Pixi Mini Game runtime chain.');
    await runBuildNpm(projectRoot);
    console.log('[init] PASS /wechat Mini Game project is build-ready.');
  } else {
    console.log('[init] Skipped build:npm. The project shell is synced, but initialization is still PARTIAL until build:npm succeeds.');
    console.log('[init] PARTIAL /wechat Mini Game shell synced only.');
  }
}

async function runInitFromArgs(argv, repoRoot) {
  const options = parseArgs(argv);
  await runInit(repoRoot, options);
}

module.exports = {
  runInit,
  runInitFromArgs
};
