function getWindowInfo() {
  if (wx.getWindowInfo) {
    return wx.getWindowInfo();
  }

  return wx.getSystemInfoSync();
}

const windowInfo = getWindowInfo();
const dpr = windowInfo.pixelRatio || 1;
const width = windowInfo.windowWidth || windowInfo.screenWidth || 375;
const height = windowInfo.windowHeight || windowInfo.screenHeight || 667;
const rootCanvas = typeof canvas !== 'undefined'
  ? canvas
  : (typeof GameGlobal !== 'undefined' && GameGlobal.canvas)
    ? GameGlobal.canvas
    : wx.createCanvas();

export default {
  dpr,
  windowWidth: width,
  windowHeight: height,
  GAME_WIDTH: width * dpr,
  GAME_HEIGHT: height * dpr,
  pixiOptions: {
    view: rootCanvas,
    backgroundColor: 0x111827,
    antialias: false,
    transparent: false,
    resolution: dpr
  }
};
