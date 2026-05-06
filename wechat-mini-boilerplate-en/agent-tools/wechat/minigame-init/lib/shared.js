'use strict';

const fs = require('node:fs');
const path = require('node:path');

const LOCAL_CREDENTIAL_FILE = path.join('agent-documents', 'Deploy', 'credential.local.json');
const LOCAL_CREDENTIAL_EXAMPLE_FILE = path.join('agent-documents', 'Deploy', 'credential.local.example.json');

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readJson(filePath) {
  return JSON.parse(readUtf8(filePath));
}

function writeUtf8(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function normalizeLineEndings(content) {
  return content.replace(/\r?\n/g, '\n');
}

function ensureTrailingNewline(content) {
  return content.endsWith('\n') ? content : `${content}\n`;
}

function writeTextIfChanged(filePath, content) {
  const normalizedContent = ensureTrailingNewline(normalizeLineEndings(content));
  const hasFile = fs.existsSync(filePath);
  const currentContent = hasFile ? readUtf8(filePath) : null;

  if (currentContent === normalizedContent) {
    return false;
  }

  ensureDir(path.dirname(filePath));
  writeUtf8(filePath, normalizedContent);
  return true;
}

function writeJsonIfChanged(filePath, value) {
  return writeTextIfChanged(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function fileBytesEqual(firstPath, secondPath) {
  if (!fs.existsSync(firstPath) || !fs.existsSync(secondPath)) {
    return false;
  }

  const firstStat = fs.statSync(firstPath);
  const secondStat = fs.statSync(secondPath);

  if (firstStat.size !== secondStat.size) {
    return false;
  }

  return fs.readFileSync(firstPath).equals(fs.readFileSync(secondPath));
}

function copyFileIfChanged(sourcePath, targetPath) {
  if (fileBytesEqual(sourcePath, targetPath)) {
    return false;
  }

  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
  return true;
}

function copyDirectoryIfChanged(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Missing source directory: ${sourceDir}`);
  }

  const changedFiles = [];

  function walk(currentSourceDir, currentTargetDir) {
    ensureDir(currentTargetDir);

    fs.readdirSync(currentSourceDir, { withFileTypes: true }).forEach((entry) => {
      const sourcePath = path.join(currentSourceDir, entry.name);
      const targetPath = path.join(currentTargetDir, entry.name);

      if (entry.isDirectory()) {
        walk(sourcePath, targetPath);
        return;
      }

      if (!entry.isFile()) {
        return;
      }

      if (copyFileIfChanged(sourcePath, targetPath)) {
        changedFiles.push(targetPath);
      }
    });
  }

  walk(sourceDir, targetDir);

  return changedFiles;
}

function loadVersions(repoRoot) {
  return readJson(path.join(repoRoot, 'agent-tools', 'wechat', 'minigame-init', 'versions.json'));
}

function getRepoRootFromProjectRoot(projectRoot) {
  return path.resolve(projectRoot, '..');
}

function ensureWechatProjectRoot(projectRoot, repoRoot) {
  const resolvedProjectRoot = path.resolve(projectRoot);

  if (repoRoot) {
    const expectedProjectRoot = path.resolve(repoRoot, 'wechat');

    if (resolvedProjectRoot !== expectedProjectRoot) {
      throw new Error(`BLOCKED Project root must be the repository /wechat directory: ${expectedProjectRoot}. Received: ${resolvedProjectRoot}`);
    }

    return;
  }

  if (path.basename(resolvedProjectRoot) !== 'wechat') {
    throw new Error(`BLOCKED Project root must be /wechat. Received: ${projectRoot}`);
  }
}

function getLocalCredentialPath(repoRoot) {
  return path.join(repoRoot, LOCAL_CREDENTIAL_FILE);
}

function getLocalCredentialExamplePath(repoRoot) {
  return path.join(repoRoot, LOCAL_CREDENTIAL_EXAMPLE_FILE);
}

function resolveRepoPath(filePath, repoRoot) {
  if (!filePath || typeof filePath !== 'string') {
    return '';
  }

  return path.isAbsolute(filePath) ? filePath : path.resolve(repoRoot, filePath);
}

function loadLocalCredential(repoRoot) {
  const credentialPath = getLocalCredentialPath(repoRoot);

  if (!fs.existsSync(credentialPath)) {
    const examplePath = getLocalCredentialExamplePath(repoRoot);
    throw new Error(`Missing local credential file: ${credentialPath}. Copy ${examplePath} to credential.local.json and fill in local-only values first.`);
  }

  try {
    return {
      credentialPath,
      credential: readJson(credentialPath)
    };
  } catch (error) {
    const detail = error && error.message ? ` Cause: ${error.message}` : '';
    throw new Error(`Failed to parse local credential file: ${credentialPath}.${detail}`);
  }
}

function resolveCredentialPrivateKeyPath(credential, repoRoot) {
  const privateKeyPath = credential && typeof credential.privateKeyPath === 'string'
    ? credential.privateKeyPath.trim()
    : '';

  return privateKeyPath ? resolveRepoPath(privateKeyPath, repoRoot) : '';
}

function ensureLines(existingContent, requiredLines) {
  const lines = normalizeLineEndings(existingContent).split('\n').filter((line) => line.length > 0);

  requiredLines.forEach((line) => {
    if (!lines.includes(line)) {
      lines.push(line);
    }
  });

  return `${lines.join('\n')}\n`;
}

function createPackageName(repoRoot) {
  const safeName = path.basename(repoRoot).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');

  return safeName || 'wechat-mini-game';
}

function toPosixPath(filePath) {
  return filePath.replace(/\\/g, '/');
}

module.exports = {
  createPackageName,
  copyDirectoryIfChanged,
  copyFileIfChanged,
  ensureDir,
  ensureLines,
  ensureWechatProjectRoot,
  getLocalCredentialExamplePath,
  getLocalCredentialPath,
  getRepoRootFromProjectRoot,
  loadLocalCredential,
  loadVersions,
  readJson,
  readUtf8,
  resolveCredentialPrivateKeyPath,
  resolveRepoPath,
  toPosixPath,
  writeJsonIfChanged,
  writeTextIfChanged
};
