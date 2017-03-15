import * as _ from 'lodash';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import Screen from '../screen';

export default class LoadingScreen extends Screen {
  constructor(loadingIsSlow, screensToLoad) {
    super();

    this._loadingIsSlow = loadingIsSlow;
    this._screensToLoad = screensToLoad;
    this._otherScreensAreGone = false;
    this._logMsgText = null;
  }

  static load(screenManager, loadingIsSlow, screensToLoad) {
    _.forEach(screenManager.getScreens(), screen => screen.exitScreen());

    screenManager.add(new LoadingScreen(loadingIsSlow, screensToLoad));
  }

  activate(entities) {
    super.activate(entities);

    const renderer = this.screenManager.renderer;

    this.scale.set(renderer.globalScale, renderer.globalScale);

    this._logMsgText = new Pixi.Text('Loading...', { font: "10px 'Press Start 2P'", fill: '#00ff00' });
    this._logMsgText.position.x = 0;
    this._logMsgText.position.y = 0;

    this.addChild(this._logMsgText);
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

    this._logMsgText.visible = !!this._loadingIsSlow;
  }
}
