import * as ArrayUtils from './utils/array-utils';
import * as Const from './const';
import _ from 'lodash';
import EventEmitter from 'eventemitter2';


export default class ScreenManager extends EventEmitter {

  constructor(renderer, input, entityManager) {

    super();

    this._renderer = renderer;
    this._input = input;
    this._entityManager = entityManager;
    this._game = undefined;
    this._screens = [];
    this._tempScreens = [];
    this._isInitialized = false;

  }

  get renderer() { return this._renderer; }

  get input() { return this._input; }

  get entityManager() { return this._entityManager; }

  get screenCount() { return this._screens.length; }

  initialize() {
    this._isInitialized = true;
  }

  loadContent() {

    for (const screen of this._screens) {
      screen.activate(this._entityManager.entities);
    }

  }

  unloadContent() {

    for (const screen of this._screens) {
      screen.unload(this._entityManager.entities);
    }

  }

  update(gameTime) {

    ArrayUtils.clear(this._tempScreens);

    for (const screen of this._screens) {
      this._tempScreens.push(screen);
    }

    let otherScreenHasFocus = false;
    let coveredByOtherScreen = false;

    while (this._tempScreens.length > 0) {

      const screen = this._tempScreens.pop();

      screen.update(gameTime, this._entityManager.entities, otherScreenHasFocus, coveredByOtherScreen);

      if (screen.screenState === Const.ScreenState.TransitionOn || screen.screenState === Const.ScreenState.Active) {

        if (!otherScreenHasFocus) {

          screen.handleInput(gameTime, this._entityManager.entities, this._input);

          otherScreenHasFocus = true;

        }

        if (!screen.isPopup) {
          coveredByOtherScreen = true;
        }

      }

    }

    this._input.update();

  }

  draw(gameTime) {

    for (const screen of this._screens) {

      if (screen.screenState !== Const.ScreenState.Hidden) {

        screen.draw(gameTime, this._entityManager.entities);

        this._renderer.render(screen);

      }

    }

  }

  add(screen) {

    screen.screenManager = this;
    screen.isExiting = false;

    this.emit('screen-manager.add-screen', screen);

    if (this._isInitialized) {
      screen.activate(this._entityManager.entities);
    }

    this._screens.push(screen);

    return this;

  }

  remove(screen) {

    if (this._isInitialized) {
      screen.unload(this._entityManager.entities);
    }

    ArrayUtils.remove(this._screens, screen);
    ArrayUtils.remove(this._tempScreens, screen);

  }
  
  removeAll() {

    _.each(this.getScreens(), s => { this.remove(s); });

  }

  getScreens() {

    return this._screens.slice();
    
  }

  cleanUpEntity(entity) {

    const pixiObjsToRemove = [];

    if (entity.has('MovieClipComponent')) {
      pixiObjsToRemove.push(entity.get('MovieClipComponent').movieClip);
    }

    if (entity.has('GraphicsComponent')) {
      pixiObjsToRemove.push(entity.get('GraphicsComponent').graphics);
    }

    if (entity.has('InventoryIconComponent')) {
      pixiObjsToRemove.push(entity.get('InventoryIconComponent').sprite);
    }

    if (pixiObjsToRemove.length === 0) { return; }

    for (const screen of this._screens) {
      for (const pixiObj of pixiObjsToRemove) {
        if (pixiObj) {
          screen.removeChild(pixiObj);
        }
      }
    }

  }

}
