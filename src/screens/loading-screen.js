import * as Const from '../const';
import * as Pixi from 'pixi.js';
import Screen from '../screen';

export default class LoadingScreen extends Screen {
  constructor(loadingIsSlow, screensToLoad, loadingMsg = 'Loading...') {
    super();

    this._loadingIsSlow = loadingIsSlow;
    this._screensToLoad = screensToLoad;
    this._otherScreensAreGone = false;
    this.sprite = new Pixi.extras.BitmapText(loadingMsg, Const.LoadingScreenTextStyle);
  }

  static load(screenManager, loadingIsSlow, screensToLoad, loadingMsg) {
    const screens = screenManager.getScreens();
    for (let i = 0; i < screens.length; ++i) {
      screens[i].exitScreen();
    }
    screenManager.add(new LoadingScreen(loadingIsSlow, screensToLoad, loadingMsg));
  }

  activate(entities) {
    super.activate(entities);

    const renderer = this.screenManager.renderer;

    this.scale.set(renderer.globalScale, renderer.globalScale);

    this.sprite.position.x = 0;
    this.sprite.position.y = 0;

    this.addChild(this.sprite);
  }

  update(gameTime, otherScreenHasFocus, coveredByOtherScreen) {
    super.update(gameTime, otherScreenHasFocus, coveredByOtherScreen);

    if (!this._otherScreensAreGone) {
      return;
    }

    this.screenManager.remove(this);

    for (let i = 0; i < this._screensToLoad.length; ++i) {
      const screen = this._screensToLoad[i];
      screen && this.screenManager.add(screen);
    }
  }

  draw(gameTime) {
    if (this.screenState === Const.ScreenState.Active && this.screenManager.screenCount === 1) {
      this._otherScreensAreGone = true;
    }

    this.sprite.visible = !!this._loadingIsSlow;
  }
}
