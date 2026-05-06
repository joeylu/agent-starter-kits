'use strict';

const path = require('node:path');
const { runCopyFromArgs } = require(path.resolve(__dirname, '../agent-tools/wechat/particle-assets/lib/copy-particle-category-core'));

runCopyFromArgs(process.argv.slice(2), path.resolve(__dirname, '..')).catch((error) => {
  console.error(`[particle-assets] ${error && error.message ? error.message : String(error)}`);
  process.exit(1);
});
