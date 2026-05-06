import * as PIXI from '../libs/pixi.js';
import config from './config.js';

export default class App extends PIXI.Application {
  constructor() {
    super(config.GAME_WIDTH, config.GAME_HEIGHT, config.pixiOptions);

    this.stage.scale.set(config.dpr);
    this.createBaselineScene();
    this.bindWxEvents();
  }

  createBaselineScene() {
    const background = new PIXI.Graphics();
    background.beginFill(0x111827, 1);
    background.drawRect(0, 0, config.windowWidth, config.windowHeight);
    background.endFill();
    this.stage.addChild(background);

    const marker = new PIXI.Graphics();
    marker.beginFill(0x22c55e, 1);
    marker.drawCircle(config.windowWidth / 2, config.windowHeight / 2, Math.min(config.windowWidth, config.windowHeight) * 0.08);
    marker.endFill();
    this.stage.addChild(marker);
  }

  bindWxEvents() {
    wx.onShow(() => {
      this.ticker.start();
    });

    wx.onHide(() => {
      this.ticker.stop();
    });
  }
}
