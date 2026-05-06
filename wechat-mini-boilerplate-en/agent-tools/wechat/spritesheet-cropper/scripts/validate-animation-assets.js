#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      fail(`Unexpected argument: ${token}`);
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (next === undefined || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }

  return args;
}

function getRepoRoot() {
  return path.resolve(__dirname, "../../../..");
}

function toDisplayPath(filePath) {
  return path.relative(getRepoRoot(), filePath).replace(/\\/g, "/");
}

function sanitizeName(value) {
  const name = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return name || null;
}

function walkFiles(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function isAtlasJson(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    return Boolean(data && data.frames && data.animations && data.meta);
  } catch (error) {
    return false;
  }
}

function looksLikeAtlasModule(filePath) {
  if (!filePath.endsWith("-data.js")) {
    return false;
  }

  try {
    const text = fs.readFileSync(filePath, "utf8");

    return text.includes("module.exports") && text.includes('"frames"') && text.includes('"animations"');
  } catch (error) {
    return true;
  }
}

function hasSiblingAtlasData(filePath) {
  const directory = path.dirname(filePath);
  const stem = path.basename(filePath, path.extname(filePath));
  const dataModule = path.join(directory, `${stem}-data.js`);
  const atlasJson = path.join(directory, `${stem}.json`);

  return fs.existsSync(dataModule) || (fs.existsSync(atlasJson) && isAtlasJson(atlasJson));
}

function collectForbiddenFiles(animationName) {
  const repoRoot = getRepoRoot();
  const allowedRoot = path.join(repoRoot, "wechat/images/animations");
  const forbiddenRoots = [
    path.join(repoRoot, "wechat/images"),
    path.join(repoRoot, "wechat/js"),
    path.join(repoRoot, "wechat/user-assets")
  ];
  const violations = [];

  for (const forbiddenRoot of forbiddenRoots) {
    for (const filePath of walkFiles(forbiddenRoot)) {
      const ext = path.extname(filePath).toLowerCase();
      const basename = path.basename(filePath);
      const stem = path.basename(filePath, ext);
      const animationNameMatch = animationName
        && (stem === animationName || stem === `${animationName}-data`);

      if (filePath.startsWith(allowedRoot + path.sep)) {
        if (looksLikeAtlasModule(filePath)) {
          violations.push(`${toDisplayPath(filePath)}: Pixi6 atlas data module is not allowed; use frames/ plus an ESM data helper`);
        }

        if (ext === ".json" && isAtlasJson(filePath)) {
          violations.push(`${toDisplayPath(filePath)}: Pixi6 atlas JSON is not allowed; use frames/ plus an ESM data helper`);
        }

        continue;
      }

      if (looksLikeAtlasModule(filePath)) {
        violations.push(`${toDisplayPath(filePath)}: atlas data module is outside wechat/images/animations/{name}/`);
        continue;
      }

      if (ext === ".json" && isAtlasJson(filePath)) {
        violations.push(`${toDisplayPath(filePath)}: atlas JSON is outside wechat/images/animations/{name}/`);
        continue;
      }

      if (ext === ".png" && (animationNameMatch || hasSiblingAtlasData(filePath))) {
        violations.push(`${toDisplayPath(filePath)}: atlas PNG is outside wechat/images/animations/{name}/`);
        continue;
      }

      if (animationName && basename === `${animationName}-data.js`) {
        violations.push(`${toDisplayPath(filePath)}: named atlas data module is outside wechat/images/animations/${animationName}/`);
      }
    }
  }

  return violations;
}

function validateNamedPackage(animationName) {
  const repoRoot = getRepoRoot();
  const packageDir = path.join(repoRoot, "wechat/images/animations", animationName);
  const framesDir = path.join(packageDir, "frames");
  const manifestPath = path.join(repoRoot, "wechat/src/assets/animations", `${animationName}.js`);
  const requiredFiles = [manifestPath];
  const missing = requiredFiles.filter((filePath) => !fs.existsSync(filePath));

  if (!fs.existsSync(packageDir)) {
    return [`wechat/images/animations/${animationName}: required animation package directory is missing`];
  }

  const violations = missing.map((filePath) => `${toDisplayPath(filePath)}: required animation package file is missing`);

  if (fs.existsSync(manifestPath)) {
    const manifestText = fs.readFileSync(manifestPath, "utf8");

    if (manifestText.includes("user-assets/")) {
      violations.push(`${toDisplayPath(manifestPath)}: runtime animation paths must use images/... instead of user-assets/...`);
    }

    if (!manifestText.includes(`images/animations/${animationName}/frames/`)) {
      violations.push(`${toDisplayPath(manifestPath)}: runtime animation paths must point at images/animations/${animationName}/frames/`);
    }
  }

  if (!fs.existsSync(framesDir)) {
    violations.push(`wechat/images/animations/${animationName}/frames: required frame directory is missing`);
    return violations;
  }

  const frameFiles = walkFiles(framesDir).filter((filePath) => path.extname(filePath).toLowerCase() === ".png");

  if (frameFiles.length === 0) {
    violations.push(`wechat/images/animations/${animationName}/frames: at least one PNG frame is required`);
  }

  return violations;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const animationName = args.name ? sanitizeName(args.name) : null;
  const violations = [];

  if (args.name && !animationName) {
    fail("--name must contain at least one ASCII letter or digit after sanitizing");
  }

  violations.push(...collectForbiddenFiles(animationName));

  if (animationName) {
    violations.push(...validateNamedPackage(animationName));
  }

  if (violations.length > 0) {
    fail(`Animation asset validation failed:\n- ${violations.join("\n- ")}`);
  }

  console.log(JSON.stringify({
    ok: true,
    animationName: animationName || null,
    checkedForbiddenRoots: [
      "wechat/images",
      "wechat/js",
      "wechat/user-assets",
      "Pixi6 atlas data inside wechat/images/animations"
    ],
    requiredPackageRoot: animationName ? `wechat/images/animations/${animationName}` : null
  }, null, 2));
}

main();
