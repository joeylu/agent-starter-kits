'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  getLocalCredentialPath,
  getRepoRootFromProjectRoot
} = require('./shared');

async function runUpload(projectRoot) {
  const resolvedProjectRoot = path.resolve(projectRoot);
  const repoRoot = getRepoRootFromProjectRoot(resolvedProjectRoot);
  const credentialDocPath = path.join(repoRoot, 'agent-documents', 'Deploy', 'CREDENTIAL.md');
  const localCredentialPath = getLocalCredentialPath(repoRoot);
  const deployPath = path.join(repoRoot, 'agent-documents', 'Deploy', 'DEPLOY.md');
  const projectConfigPath = path.join(resolvedProjectRoot, 'project.config.json');
  const miniprogramNpmPath = path.join(resolvedProjectRoot, 'miniprogram_npm');

  if (!fs.existsSync(projectConfigPath)) {
    throw new Error('Missing project.config.json.');
  }

  if (!fs.existsSync(credentialDocPath)) {
    throw new Error('Missing agent-documents/Deploy/CREDENTIAL.md.');
  }

  if (!fs.existsSync(localCredentialPath)) {
    throw new Error('Missing agent-documents/Deploy/credential.local.json. Copy credential.local.example.json and fill in local-only values first.');
  }

  if (!fs.existsSync(deployPath)) {
    throw new Error('Missing agent-documents/Deploy/DEPLOY.md.');
  }

  try {
    require.resolve('miniprogram-ci', { paths: [resolvedProjectRoot] });
  } catch (error) {
    throw new Error('Missing devDependency miniprogram-ci. Run npm install inside /wechat first.');
  }

  if (!fs.existsSync(miniprogramNpmPath)) {
    throw new Error('Missing miniprogram_npm. Run npm run build:npm first.');
  }

  throw new Error('upload entry exists and build:npm has passed, but upload automation remains intentionally gated in this repository. Build-ready does not mean upload automation is open.');
}

module.exports = {
  runUpload
};
