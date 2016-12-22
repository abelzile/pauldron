import * as Const from '../const';
import _ from 'lodash';
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

    const screens = screenManager.getScreens();

    for (let i = 0; i < screens.length; ++i) {
      screens[i].exitScreen();
    }

    screenManager.add(new LoadingScreen(loadingIsSlow, screensToLoad));

  }

  activate(entities) {

    super.activate(entities);

    const renderer = this.screenManager.renderer;

    this.scale.set(renderer.globalScale, renderer.globalScale);

    this._logMsgText = new Pixi.Text('Loading...', {font: '10px \'Press Start 2P\'', fill: '#00ff00'});
    this._logMsgText.position.x = 0;
    this._logMsgText.position.y = 0;

    this.addChild(this._logMsgText);

  }

  update(gameTime, otherScreenHasFocus, coveredByOtherScreen) {

    super.update(gameTime, otherScreenHasFocus, coveredByOtherScreen);

    // If all the previous screens have finished transitioning
    // off, it is time to actually perform the load.
    if (!this._otherScreensAreGone) { return; }

    this.screenManager.remove(this);

    for (let i = 0; i < this._screensToLoad.length; ++i) {

      const screen = this._screensToLoad[i];
      screen && this.screenManager.add(screen);

    }

  }

  /// <summary>
  /// Draws the loading screen.
  /// </summary>
  draw(gameTime) {

    // If we are the only active screen, that means all the previous screens
    // must have finished transitioning off. We check for this in the Draw
    // method, rather than in Update, because it isn't enough just for the
    // screens to be gone: in order for the transition to look good we must
    // have actually drawn a frame without them before we perform the load.
    if (this.screenState === Const.ScreenState.Active && this.screenManager.screenCount === 1) {
      this._otherScreensAreGone = true;
    }

    // The gameplay screen takes a while to load, so we display a loading
    // message while that is going on, but the menus load very quickly, and
    // it would look silly if we flashed this up for just a fraction of a
    // second while returning from the game to the menus. This parameter
    // tells us how long the loading is going to take, so we know whether
    // to bother drawing the message.
    this._logMsgText.visible = !!this._loadingIsSlow;

  }

}
