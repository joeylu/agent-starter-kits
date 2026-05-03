'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  ensureDir,
  getLocalCredentialPath,
  getRepoRootFromProjectRoot,
  loadLocalCredential,
  loadVersions,
  readJson,
  readUtf8,
  resolveCredentialPrivateKeyPath,
  writeTextIfChanged
} = require('./shared');

const DEFAULT_FATAL_OUTPUT_PATTERNS = [
  'parse js file .* failed'
];

const DEFAULT_SMOKE_CHECKS = [
  'miniprogram_npm/pixi.js/index.js',
  'miniprogram_npm/@pixi/extensions/index.js',
  'js/vendor/pixi-runtime.js'
];

function buildRegexList(patterns) {
  return patterns.map((pattern) => new RegExp(pattern, 'i'));
}

function getBuildGuard(repoRoot) {
  const versions = loadVersions(repoRoot);
  const buildConfig = versions.build || {};
  const fatalOutputPatterns = Array.isArray(buildConfig.fatalOutputPatterns) && buildConfig.fatalOutputPatterns.length > 0
    ? buildConfig.fatalOutputPatterns
    : DEFAULT_FATAL_OUTPUT_PATTERNS;
  const smokeChecks = Array.isArray(buildConfig.smokeChecks) && buildConfig.smokeChecks.length > 0
    ? buildConfig.smokeChecks
    : DEFAULT_SMOKE_CHECKS;

  return {
    fatalOutputPatterns: buildRegexList(fatalOutputPatterns),
    smokeChecks
  };
}

function ensureFileExists(filePath, errorMessage) {
  if (!fs.existsSync(filePath)) {
    throw new Error(errorMessage);
  }
}

function removeOutputDir(outputPath) {
  if (!fs.existsSync(outputPath)) {
    return;
  }

  fs.rmSync(outputPath, { recursive: true, force: true });
  console.log(`[build:npm] Removed stale output: ${outputPath}`);
}

function chunkToText(chunk, encoding) {
  if (Buffer.isBuffer(chunk)) {
    return chunk.toString(typeof encoding === 'string' ? encoding : 'utf8');
  }

  return String(chunk);
}

async function captureProcessOutput(task) {
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);
  let buffer = '';

  function wrapWrite(originalWrite) {
    return function patchedWrite(chunk, encoding, callback) {
      let nextEncoding = encoding;
      let nextCallback = callback;

      if (typeof nextEncoding === 'function') {
        nextCallback = nextEncoding;
        nextEncoding = undefined;
      }

      buffer += chunkToText(chunk, nextEncoding);
      return originalWrite(chunk, nextEncoding, nextCallback);
    };
  }

  process.stdout.write = wrapWrite(originalStdoutWrite);
  process.stderr.write = wrapWrite(originalStderrWrite);

  try {
    await task();
    return buffer;
  } finally {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  }
}

function findFatalOutputLines(output, patterns) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => patterns.some((pattern) => pattern.test(line)));
}

function ensureSmokeOutputs(projectRoot, smokeChecks) {
  const missingOutputs = smokeChecks.filter((relativePath) => !fs.existsSync(path.join(projectRoot, relativePath)));

  if (missingOutputs.length > 0) {
    throw new Error(`packNpm returned, but required outputs are missing: ${missingOutputs.join(', ')}`);
  }
}

function ensureSharedBaseline(packageJson, versions) {
  const checks = [
    ['dependencies', 'pixi.js'],
    ['devDependencies', '@pixi/unsafe-eval'],
    ['devDependencies', 'minigame-api-typings'],
    ['devDependencies', 'miniprogram-ci'],
    ['overrides', 'less']
  ];

  checks.forEach(([section, key]) => {
    const expectedValue = versions[section] && versions[section][key];

    if (!expectedValue) {
      return;
    }

    const actualValue = packageJson[section] && packageJson[section][key];

    if (actualValue !== expectedValue) {
      throw new Error(`package.json ${section}.${key} must be ${expectedValue}. Rerun node scripts/init-wechat-minigame.js --project-root wechat to resync the shared baseline.`);
    }
  });
}

function ensureSupportedProjectConfig(projectConfig, versions) {
  const expectedSetting = versions.projectConfig && versions.projectConfig.setting
    ? versions.projectConfig.setting
    : {};
  const setting = projectConfig.setting || {};

  Object.entries(expectedSetting).forEach(([key, expectedValue]) => {
    const actualValue = Object.prototype.hasOwnProperty.call(setting, key) ? setting[key] : undefined;
    const sameValue = JSON.stringify(actualValue) === JSON.stringify(expectedValue);

    if (!sameValue) {
      throw new Error(`project.config.json setting.${key} must stay ${JSON.stringify(expectedValue)}. Rerun node scripts/init-wechat-minigame.js --project-root wechat to reset the supported DevTools npm mode.`);
    }
  });
}

function ensureInstalledVersion(packagePath, expectedVersion, packageLabel) {
  const installedPackage = readJson(packagePath);
  const installedVersion = installedPackage && typeof installedPackage.version === 'string'
    ? installedPackage.version.trim()
    : '';

  if (!installedVersion) {
    throw new Error(`Unable to read ${packageLabel} version from ${packagePath}.`);
  }

  if (installedVersion !== expectedVersion) {
    throw new Error(`${packageLabel} installed version ${installedVersion} does not match pinned baseline ${expectedVersion}. Run node scripts/init-wechat-minigame.js --project-root wechat to resync dependencies.`);
  }

  return installedVersion;
}

function verifyPixiRuntimeBundle(runtimeBundlePath, unsafeEvalVersion) {
  const runtimeBundle = readUtf8(runtimeBundlePath);
  const requiredMarkers = [
    `@pixi/unsafe-eval - v${unsafeEvalVersion}`,
    "do nothing, don't throw error",
    'module.exports = PIXI;'
  ];

  const missingMarkers = requiredMarkers.filter((marker) => !runtimeBundle.includes(marker));

  if (missingMarkers.length > 0) {
    throw new Error(`Pixi runtime bundle is missing required unsafe-eval markers: ${missingMarkers.join(', ')}`);
  }
}

function writePixiRuntimeBundle(projectRoot, nodeModulesPath, unsafeEvalVersion) {
  const browserBundlePath = path.join(nodeModulesPath, 'pixi.js', 'dist', 'browser', 'pixi.js');
  const unsafeEvalBundlePath = path.join(nodeModulesPath, '@pixi', 'unsafe-eval', 'dist', 'browser', 'unsafe-eval.js');
  const runtimeBundlePath = path.join(projectRoot, 'js', 'vendor', 'pixi-runtime.js');

  ensureFileExists(browserBundlePath, `Missing Pixi browser bundle: ${browserBundlePath}`);
  ensureFileExists(unsafeEvalBundlePath, `Missing @pixi/unsafe-eval browser bundle: ${unsafeEvalBundlePath}`);

  ensureDir(path.dirname(runtimeBundlePath));

  const browserBundle = readUtf8(browserBundlePath);
  const unsafeEvalBundle = readUtf8(unsafeEvalBundlePath);
  const runtimeBundle = `${browserBundle}

if (typeof globalThis !== 'undefined') {
  globalThis.PIXI = PIXI;
}

if (typeof GameGlobal !== 'undefined') {
  GameGlobal.PIXI = PIXI;
}

${unsafeEvalBundle}

if (typeof globalThis !== 'undefined') {
  globalThis.PIXI = PIXI;
}

if (typeof GameGlobal !== 'undefined') {
  GameGlobal.PIXI = PIXI;
}

module.exports = PIXI;
`;

  writeTextIfChanged(runtimeBundlePath, runtimeBundle);
  ensureFileExists(runtimeBundlePath, `Failed to generate Pixi runtime bundle: ${runtimeBundlePath}`);
  verifyPixiRuntimeBundle(runtimeBundlePath, unsafeEvalVersion);
  console.log(`[build:npm] Generated Pixi runtime bundle: ${runtimeBundlePath}`);
}

async function runBuildNpm(projectRoot) {
  const resolvedProjectRoot = path.resolve(projectRoot);
  const repoRoot = getRepoRootFromProjectRoot(resolvedProjectRoot);
  const versions = loadVersions(repoRoot);
  const packageJsonPath = path.join(resolvedProjectRoot, 'package.json');
  const projectConfigPath = path.join(resolvedProjectRoot, 'project.config.json');
  const credentialDocPath = path.join(repoRoot, 'agent-documents', 'Deploy', 'CREDENTIAL.md');
  const nodeModulesPath = path.join(resolvedProjectRoot, 'node_modules');
  const pixiPackagePath = path.join(nodeModulesPath, 'pixi.js', 'package.json');
  const unsafeEvalPackagePath = path.join(nodeModulesPath, '@pixi', 'unsafe-eval', 'package.json');
  const outputPath = path.join(resolvedProjectRoot, 'miniprogram_npm');
  const buildGuard = getBuildGuard(repoRoot);
  let ci;

  ensureFileExists(packageJsonPath, 'Missing package.json.');
  ensureFileExists(projectConfigPath, 'Missing project.config.json.');
  ensureFileExists(credentialDocPath, 'Missing agent-documents/Deploy/CREDENTIAL.md.');
  ensureFileExists(nodeModulesPath, 'Missing node_modules. Run npm install inside /wechat first.');
  ensureFileExists(pixiPackagePath, 'Missing pixi.js dependency. Install pixi.js first.');
  ensureFileExists(unsafeEvalPackagePath, 'Missing @pixi/unsafe-eval dependency. Install @pixi/unsafe-eval first.');

  try {
    ci = require(require.resolve('miniprogram-ci', { paths: [resolvedProjectRoot] }));
  } catch (error) {
    const detail = error && error.message ? ` Cause: ${error.message}` : '';
    throw new Error(`Failed to load miniprogram-ci. Run npm install inside /wechat first.${detail}`);
  }

  const packageJson = readJson(packageJsonPath);
  const projectConfig = readJson(projectConfigPath);
  const { credentialPath, credential } = loadLocalCredential(repoRoot);
  const appidFromCredential = credential && typeof credential.appid === 'string'
    ? credential.appid.trim()
    : '';
  const appidFromProject = projectConfig.appid ? String(projectConfig.appid).trim() : '';
  const privateKeyPath = resolveCredentialPrivateKeyPath(credential, repoRoot);
  const projectType = credential && typeof credential.projectType === 'string'
    ? credential.projectType.trim()
    : '';
  const expectedPixiVersion = versions.dependencies && versions.dependencies['pixi.js'];
  const expectedUnsafeEvalVersion = versions.devDependencies && versions.devDependencies['@pixi/unsafe-eval'];

  if (!expectedPixiVersion || !expectedUnsafeEvalVersion) {
    throw new Error('Shared versions.json is missing the pinned pixi.js or @pixi/unsafe-eval baseline.');
  }

  ensureSharedBaseline(packageJson, versions);
  ensureSupportedProjectConfig(projectConfig, versions);
  ensureInstalledVersion(pixiPackagePath, expectedPixiVersion, 'pixi.js');
  ensureInstalledVersion(unsafeEvalPackagePath, expectedUnsafeEvalVersion, '@pixi/unsafe-eval');

  if (projectType && !/mini game/i.test(projectType)) {
    throw new Error(`Local credential file ${credentialPath} must describe a Mini Game project. Received projectType=${projectType}`);
  }

  if (!appidFromCredential) {
    throw new Error(`Local credential file ${credentialPath} is missing appid.`);
  }

  if (!appidFromProject) {
    throw new Error('project.config.json is missing appid.');
  }

  if (appidFromCredential !== appidFromProject) {
    const localCredentialPath = getLocalCredentialPath(repoRoot);
    throw new Error(`AppID mismatch. ${localCredentialPath}=${appidFromCredential}, project.config.json=${appidFromProject}. Update the local credential file before rebuilding.`);
  }

  if (!privateKeyPath) {
    throw new Error(`Local credential file ${credentialPath} is missing privateKeyPath.`);
  }

  ensureFileExists(privateKeyPath, `Private key file does not exist: ${privateKeyPath}`);

  writePixiRuntimeBundle(resolvedProjectRoot, nodeModulesPath, expectedUnsafeEvalVersion);
  removeOutputDir(outputPath);

  const project = new ci.Project({
    appid: appidFromProject,
    type: 'miniGame',
    projectPath: resolvedProjectRoot,
    privateKeyPath
  });

  const capturedOutput = await captureProcessOutput(async () => {
    await ci.packNpm(project, {
      reporter(info) {
        if (typeof info === 'string') {
          console.log(`[build:npm] ${info}`);
          return;
        }

        console.log(`[build:npm] ${JSON.stringify(info)}`);
      }
    });
  });

  const fatalOutputLines = findFatalOutputLines(capturedOutput, buildGuard.fatalOutputPatterns);

  if (fatalOutputLines.length > 0) {
    throw new Error(`packNpm output contains incompatible parse errors: ${fatalOutputLines.slice(0, 3).join(' | ')}`);
  }

  ensureFileExists(outputPath, 'packNpm returned, but miniprogram_npm was not generated.');
  ensureSmokeOutputs(resolvedProjectRoot, buildGuard.smokeChecks);
  console.log(`[build:npm] PASS ${outputPath}`);
}

module.exports = {
  runBuildNpm
};
