'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  getRepoRootFromProjectRoot
} = require('./shared');

async function runPreview(projectRoot) {
  const resolvedProjectRoot = path.resolve(projectRoot);
  const repoRoot = getRepoRootFromProjectRoot(resolvedProjectRoot);
  const credentialDocPath = path.join(repoRoot, 'agent-documents', 'Deploy', 'CREDENTIAL.md');
  const deployPath = path.join(repoRoot, 'agent-documents', 'Deploy', 'DEPLOY.md');
  const projectConfigPath = path.join(resolvedProjectRoot, 'project.config.json');
  const gameJsonPath = path.join(resolvedProjectRoot, 'game.json');
  const pixiPath = path.join(resolvedProjectRoot, 'libs', 'pixi.js');

  if (!fs.existsSync(projectConfigPath)) {
    throw new Error('Missing project.config.json.');
  }

  if (!fs.existsSync(gameJsonPath)) {
    throw new Error('Missing game.json. Preview entry is Mini Game-only.');
  }

  if (!fs.existsSync(deployPath)) {
    throw new Error('Missing agent-documents/Deploy/DEPLOY.md.');
  }

  if (!fs.existsSync(credentialDocPath)) {
    throw new Error('Missing agent-documents/Deploy/CREDENTIAL.md.');
  }

  if (!fs.existsSync(pixiPath) || !fs.readFileSync(pixiPath, 'utf8').includes('4.8.2')) {
    throw new Error('Missing Pixi4 baseline. Run node scripts/init-wechat-minigame.js --project-root wechat after official baseline assets are present.');
  }

  throw new Error('preview entry exists and Pixi4 baseline is present, but preview automation remains intentionally gated in this repository. Initialization PASS does not mean preview automation is open.');
}

module.exports = {
  runPreview
};
