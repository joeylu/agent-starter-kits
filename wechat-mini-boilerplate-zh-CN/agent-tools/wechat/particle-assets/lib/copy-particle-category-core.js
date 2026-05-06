'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  copyFileIfChanged,
  ensureDir,
  ensureWechatProjectRoot,
  writeTextIfChanged
} = require('../../minigame-init/lib/shared');

const SOURCE_LIBRARY_ROOT = path.join('user-assets', 'particle-library');
const RUNTIME_PARTICLE_ROOT = path.join('images', 'particle-library');

function parseArgs(argv) {
  const options = {
    projectRoot: 'wechat',
    category: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--project-root') {
      options.projectRoot = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === '--category') {
      options.category = argv[index + 1];
      index += 1;
      continue;
    }

    throw new Error(`Unsupported argument: ${token}`);
  }

  if (!options.category) {
    throw new Error('Missing --category value.');
  }

  if (!/^[a-z0-9_-]+$/i.test(options.category)) {
    throw new Error(`Invalid category: ${options.category}`);
  }

  return options;
}

function loadManifest(modulePath) {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}

function ensureInside(childPath, parentPath, label) {
  const resolvedChild = path.resolve(childPath);
  const resolvedParent = path.resolve(parentPath);
  const safeParent = `${resolvedParent}${path.sep}`;

  if (resolvedChild !== resolvedParent && !resolvedChild.startsWith(safeParent)) {
    throw new Error(`BLOCKED ${label} resolves outside the allowed directory: ${resolvedChild}`);
  }

  return resolvedChild;
}

function buildRuntimeManifest(category, sourceManifest) {
  const runtimeManifest = {
    name: sourceManifest.name || category,
    description: sourceManifest.description || '',
    textures: {},
    presets: sourceManifest.presets || {}
  };

  Object.entries(sourceManifest.textures || {}).forEach(([key, texture]) => {
    const fileName = path.basename(texture.path || '');

    runtimeManifest.textures[key] = {
      ...texture,
      path: `${RUNTIME_PARTICLE_ROOT.replace(/\\/g, '/')}/${category}/${fileName}`
    };
  });

  return runtimeManifest;
}

function materializeRuntimeCategory(repoRoot, projectRoot, category, sourceDir, sourceManifest) {
  const textures = sourceManifest && sourceManifest.textures && typeof sourceManifest.textures === 'object'
    ? Object.entries(sourceManifest.textures)
    : [];

  if (textures.length === 0) {
    throw new Error(`BLOCKED Particle category has no textures: ${category}`);
  }

  const targetDir = path.join(projectRoot, RUNTIME_PARTICLE_ROOT, category);
  const helperDir = path.join(projectRoot, 'src', 'assets', 'particles');
  const helperPath = path.join(helperDir, `${category}.js`);
  const changedFiles = [];

  ensureDir(targetDir);
  ensureDir(helperDir);

  textures.forEach(([key, texture]) => {
    if (!texture || typeof texture.path !== 'string' || texture.path.length === 0) {
      throw new Error(`BLOCKED Particle texture ${key} is missing a source path.`);
    }

    const sourceTexturePath = ensureInside(path.resolve(repoRoot, texture.path), sourceDir, `Particle texture ${key}`);

    if (!fs.existsSync(sourceTexturePath)) {
      throw new Error(`BLOCKED Missing particle source texture: ${path.relative(repoRoot, sourceTexturePath).replace(/\\/g, '/')}`);
    }

    const targetTexturePath = path.join(targetDir, path.basename(sourceTexturePath));

    if (copyFileIfChanged(sourceTexturePath, targetTexturePath)) {
      changedFiles.push(targetTexturePath);
    }
  });

  const runtimeManifest = buildRuntimeManifest(category, sourceManifest);
  const helperContent = `export default ${JSON.stringify(runtimeManifest, null, 2)};\n`;

  if (writeTextIfChanged(helperPath, helperContent)) {
    changedFiles.push(helperPath);
  }

  return {
    targetDir,
    helperPath,
    changedFiles,
    runtimeManifest
  };
}

function validateCategory(repoRoot, projectRoot, category) {
  const indexPath = path.join(repoRoot, SOURCE_LIBRARY_ROOT, 'index.js');

  if (!fs.existsSync(indexPath)) {
    throw new Error(`BLOCKED Missing particle library index: ${path.relative(repoRoot, indexPath).replace(/\\/g, '/')}`);
  }

  const library = loadManifest(indexPath);
  const categories = Object.keys(library).sort();

  if (!categories.includes(category)) {
    throw new Error(`BLOCKED Unknown particle category: ${category}. Available: ${categories.join(', ')}`);
  }

  const sourceDir = path.join(repoRoot, SOURCE_LIBRARY_ROOT, category);
  const sourceManifestPath = path.join(sourceDir, 'manifest.js');

  if (!fs.existsSync(sourceManifestPath)) {
    throw new Error(`BLOCKED Missing particle category manifest: ${path.relative(repoRoot, sourceManifestPath).replace(/\\/g, '/')}`);
  }

  const manifest = loadManifest(sourceManifestPath);
  const result = materializeRuntimeCategory(repoRoot, projectRoot, category, sourceDir, manifest);
  const textures = Object.values(result.runtimeManifest.textures);

  const missingTexturePaths = textures
    .map((texture) => texture && texture.path)
    .filter((texturePath) => typeof texturePath === 'string' && texturePath.length > 0)
    .map((texturePath) => path.join(projectRoot, texturePath))
    .filter((texturePath) => !fs.existsSync(texturePath));

  if (missingTexturePaths.length > 0) {
    throw new Error(`BLOCKED Missing copied particle textures: ${missingTexturePaths.map((filePath) => path.relative(repoRoot, filePath).replace(/\\/g, '/')).join(', ')}`);
  }

  return {
    category,
    sourceDir,
    targetDir: result.targetDir,
    helperPath: result.helperPath,
    changedFiles: result.changedFiles
  };
}

async function runCopy(repoRoot, options) {
  const resolvedRepoRoot = path.resolve(repoRoot);
  const projectRoot = path.resolve(resolvedRepoRoot, options.projectRoot);

  ensureWechatProjectRoot(projectRoot, resolvedRepoRoot);

  if (!fs.existsSync(projectRoot)) {
    throw new Error(`BLOCKED Missing project root: ${path.relative(resolvedRepoRoot, projectRoot).replace(/\\/g, '/')}`);
  }

  ['game.json', 'project.config.json'].forEach((fileName) => {
    const requiredFile = path.join(projectRoot, fileName);

    if (!fs.existsSync(requiredFile)) {
      throw new Error(`BLOCKED Missing initialized Mini Game shell file: ${path.relative(resolvedRepoRoot, requiredFile).replace(/\\/g, '/')}`);
    }
  });

  const result = validateCategory(resolvedRepoRoot, projectRoot, options.category);
  const targetDisplay = path.relative(resolvedRepoRoot, result.targetDir).replace(/\\/g, '/');

  if (result.changedFiles.length === 0) {
    console.log(`[particle-assets] Category already synced: ${targetDisplay}`);
  } else {
    console.log('[particle-assets] Copied files:');
    result.changedFiles.forEach((filePath) => {
      console.log(`[particle-assets] - ${path.relative(resolvedRepoRoot, filePath).replace(/\\/g, '/')}`);
    });
  }

  console.log(`[particle-assets] PASS category ${result.category} runtime assets are available at ${targetDisplay}`);
  console.log(`[particle-assets] Runtime helper: ${path.relative(resolvedRepoRoot, result.helperPath).replace(/\\/g, '/')}`);
}

async function runCopyFromArgs(argv, repoRoot) {
  const options = parseArgs(argv);
  await runCopy(repoRoot, options);
}

module.exports = {
  runCopy,
  runCopyFromArgs
};
