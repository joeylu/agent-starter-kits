'use strict';

const path = require('node:path');
const { runInitFromArgs } = require(path.resolve(__dirname, '../agent-tools/wechat/minigame-init/lib/init-minigame-core'));

runInitFromArgs(process.argv.slice(2), path.resolve(__dirname, '..')).catch((error) => {
  console.error(`[init] ${error && error.message ? error.message : String(error)}`);
  process.exit(1);
});
