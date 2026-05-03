#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) fail(`Unexpected argument: ${token}`);

    const key = token.slice(2);
    const next = argv[i + 1];

    if (next === undefined || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }

  return args;
}

function parsePair(value, label) {
  const match = /^(\d+)x(\d+)$/i.exec(value || "");
  if (!match) fail(`${label} must use WIDTHxHEIGHT format, got: ${value}`);

  return {
    width: Number(match[1]),
    height: Number(match[2]),
  };
}

function parseCrop(value) {
  const match = /^(\d+),(\d+),(\d+),(\d+)$/i.exec(value || "");
  if (!match) fail(`--crop must use LEFT,TOP,WIDTH,HEIGHT format, got: ${value}`);

  return {
    left: Number(match[1]),
    top: Number(match[2]),
    width: Number(match[3]),
    height: Number(match[4]),
  };
}

function parseLoop(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  fail("--loop must be true or false");
}

function sanitizeName(value) {
  const base = path.basename(value || "animation", path.extname(value || ""));
  const name = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return name || "animation";
}

function ensureDescription(value) {
  const description = (value || "").trim();
  if (description.length < 100 || description.length > 2000) {
    fail("--description must be between 100 and 2000 characters");
  }
  return description;
}

function normalizeResolvedPath(value) {
  return path.resolve(value).replace(/\\/g, "/").replace(/\/+$/g, "");
}

function getRepoRoot() {
  return path.resolve(__dirname, "../../../..");
}

function ensureAllowedOutputRoot(outputRoot) {
  const resolvedOutputRoot = normalizeResolvedPath(outputRoot);
  const allowedOutputRoot = normalizeResolvedPath(path.join(getRepoRoot(), "wechat/user-assets/animations"));

  if (resolvedOutputRoot !== allowedOutputRoot) {
    fail(
      `--output-root must resolve to wechat/user-assets/animations. Refusing generated animation package output outside the approved runtime asset root: ${outputRoot}`
    );
  }
}

function validateCrop(crop, metadata) {
  if (crop.left + crop.width > metadata.width || crop.top + crop.height > metadata.height) {
    fail(
      `Crop rectangle exceeds image bounds. image=${metadata.width}x${metadata.height}, crop=${crop.left},${crop.top},${crop.width},${crop.height}`
    );
  }
}

function buildJson({ animationName, imageSize, grid, frameWidth, frameHeight, loop, description }) {
  const frames = {};
  const animationFrames = [];
  const totalFrames = grid.width * grid.height;
  const pad = Math.max(4, String(totalFrames - 1).length);

  for (let row = 0; row < grid.height; row += 1) {
    for (let col = 0; col < grid.width; col += 1) {
      const index = row * grid.width + col;
      const frameName = `${animationName}_${String(index).padStart(pad, "0")}.png`;

      frames[frameName] = {
        frame: {
          x: col * frameWidth,
          y: row * frameHeight,
          w: frameWidth,
          h: frameHeight,
        },
        rotated: false,
        trimmed: false,
        sourceSize: {
          w: frameWidth,
          h: frameHeight,
        },
        spriteSourceSize: {
          x: 0,
          y: 0,
          w: frameWidth,
          h: frameHeight,
        },
      };

      animationFrames.push(frameName);
    }
  }

  return {
    frames,
    animations: {
      [animationName]: animationFrames,
    },
    meta: {
      image: `${animationName}.png`,
      size: {
        w: imageSize.width,
        h: imageSize.height,
      },
      scale: "1",
    },
    animationMeta: {
      name: animationName,
      loop,
      description,
      grid: `${grid.width}x${grid.height}`,
      frameSize: `${frameWidth}x${frameHeight}`,
      frameCount: totalFrames,
    },
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = args.input ? path.resolve(args.input) : null;

  if (!inputPath) fail("--input is required");
  if (!fs.existsSync(inputPath)) fail(`Input PNG does not exist: ${inputPath}`);
  if (!args.grid) fail("--grid is required");
  if (args.loop === undefined) fail("--loop is required");

  const grid = parsePair(args.grid, "--grid");
  const loop = parseLoop(args.loop);
  const description = ensureDescription(args.description);
  const animationName = sanitizeName(args.name || inputPath);
  const outputRoot = args["output-root"]
    ? path.resolve(args["output-root"])
    : path.join(getRepoRoot(), "wechat/user-assets/animations");
  ensureAllowedOutputRoot(outputRoot);
  const outputDir = path.join(outputRoot, animationName);
  const outputPng = path.join(outputDir, `${animationName}.png`);
  const outputJson = path.join(outputDir, `${animationName}.json`);
  const outputModule = path.join(outputDir, `${animationName}-data.js`);

  let image = sharp(inputPath, { failOn: "error" });
  const inputMetadata = await image.metadata();

  if (inputMetadata.format !== "png") {
    fail(`Input must be a PNG. Detected format: ${inputMetadata.format || "unknown"}`);
  }

  if (args.crop) {
    const crop = parseCrop(args.crop);
    validateCrop(crop, inputMetadata);
    image = image.extract(crop);
  }

  if (args.trim) {
    const threshold = args.trim === true ? 10 : Number(args.trim);
    if (!Number.isFinite(threshold) || threshold < 0) fail("--trim must be a non-negative number");
    image = image.trim({ threshold });
  }

  const processedBuffer = await image.png().toBuffer();
  const processedMetadata = await sharp(processedBuffer).metadata();
  const imageSize = {
    width: processedMetadata.width,
    height: processedMetadata.height,
  };

  let frameWidth;
  let frameHeight;

  if (args["frame-size"]) {
    const frameSize = parsePair(args["frame-size"], "--frame-size");
    frameWidth = frameSize.width;
    frameHeight = frameSize.height;
  } else {
    if (imageSize.width % grid.width !== 0 || imageSize.height % grid.height !== 0) {
      fail(
        `Grid does not divide processed image evenly. image=${imageSize.width}x${imageSize.height}, grid=${grid.width}x${grid.height}`
      );
    }

    frameWidth = imageSize.width / grid.width;
    frameHeight = imageSize.height / grid.height;

    if (frameWidth !== frameHeight) {
      fail(
        `Default square-cell rule failed. image=${imageSize.width}x${imageSize.height}, grid=${grid.width}x${grid.height}, computedFrame=${frameWidth}x${frameHeight}. Provide --frame-size WIDTHxHEIGHT for non-square frames.`
      );
    }
  }

  const expectedWidth = grid.width * frameWidth;
  const expectedHeight = grid.height * frameHeight;
  if (expectedWidth !== imageSize.width || expectedHeight !== imageSize.height) {
    fail(
      `Frame size does not align with processed image. image=${imageSize.width}x${imageSize.height}, grid=${grid.width}x${grid.height}, frame=${frameWidth}x${frameHeight}, expected=${expectedWidth}x${expectedHeight}`
    );
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPng, processedBuffer);

  const json = buildJson({
    animationName,
    imageSize,
    grid,
    frameWidth,
    frameHeight,
    loop,
    description,
  });

  fs.writeFileSync(outputJson, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  fs.writeFileSync(outputModule, `module.exports = ${JSON.stringify(json, null, 2)};\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        animationName,
        outputDir,
        png: outputPng,
        json: outputJson,
        module: outputModule,
        sourceImageSize: `${inputMetadata.width}x${inputMetadata.height}`,
        outputImageSize: `${imageSize.width}x${imageSize.height}`,
        grid: `${grid.width}x${grid.height}`,
        frameSize: `${frameWidth}x${frameHeight}`,
        frameCount: grid.width * grid.height,
        loop,
      },
      null,
      2
    )
  );
}

main().catch((error) => fail(error.message || String(error)));
