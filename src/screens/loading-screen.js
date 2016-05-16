import * as Const from '../const';
import _ from 'lodash';
import Pixi from 'pixi.js';
import Screen from '../screen';


export default class LoadingScreen extends Screen {

  constructor(loadingIsSlow, screensToLoad) {

    super();

    this._loadingIsSlow = loadingIsSlow;
    this._screensToLoad = screensToLoad;
    this._otherScreensAreGone = false;
    this._sprite = null;

  }

  static load(screenManager, loadingIsSlow, screensToLoad) {

    for (const screen of screenManager.getScreens()) {
      screen.exitScreen();
    }

    screenManager.add(new LoadingScreen(loadingIsSlow, screensToLoad));

  }

  activate() {

    var renderer = this.screenManager.renderer;

    this.scale.set(renderer.globalScale, renderer.globalScale);

    this._sprite = new Pixi.Text('Loading...', {font: '10px \'Press Start 2P\'', fill: '#00ff00'});
    this._sprite.position.x = 0;
    this._sprite.position.y = 0;

    this.addChild(this._sprite);

  }

  update(gameTime, otherScreenHasFocus, coveredByOtherScreen) {

    super.update(gameTime, otherScreenHasFocus, coveredByOtherScreen);

    // If all the previous screens have finished transitioning
    // off, it is time to actually perform the load.
    if (this._otherScreensAreGone) {

      this.screenManager.remove(this);

      _.each(this._screensToLoad, (screen) => {

        if (screen != null) {
          this.screenManager.add(screen);
        }

      });

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
    this._sprite.visible = !!this._loadingIsSlow;

  }

}
