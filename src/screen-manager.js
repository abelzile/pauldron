import * as ArrayUtils from './utils/array-utils';
import * as Const from './const';
import _ from 'lodash';
import EventEmitter from 'eventemitter2';


export default class ScreenManager extends EventEmitter {

  constructor(renderer, input, entityManager) {

    super();

    this.renderer = renderer;
    this.input = input;
    this.entityManager = entityManager;
    this.game = undefined;
    this.screens = [];
    this.tempScreens = [];
    this.isInitialized = false;

  }

  get screenCount() { return this.screens.length; }

  initialize() {
    this.isInitialized = true;
  }

  loadContent() {

    for (const screen of this.screens) {
      screen.activate(this.entityManager.entities);
    }

  }

  unloadContent() {

    for (const screen of this.screens) {
      screen.unload(this.entityManager.entities);
    }

  }

  update(gameTime) {

    ArrayUtils.clear(this.tempScreens);

    for (const screen of this.screens) {
      this.tempScreens.push(screen);
    }

    let otherScreenHasFocus = false;
    let coveredByOtherScreen = false;

    while (this.tempScreens.length > 0) {

      const screen = this.tempScreens.pop();

      screen.update(gameTime, this.entityManager.entities, otherScreenHasFocus, coveredByOtherScreen);

      if (screen.screenState === Const.ScreenState.TransitionOn || screen.screenState === Const.ScreenState.Active) {

        if (!otherScreenHasFocus) {

          screen.handleInput(gameTime, this.entityManager.entities, this.input);

          otherScreenHasFocus = true;

        }

        if (!screen.isPopup) {
          coveredByOtherScreen = true;
        }

      }

    }

    this.input.update();

  }

  draw(gameTime) {

    for (const screen of this.screens) {

      if (screen.screenState !== Const.ScreenState.Hidden) {

        screen.draw(gameTime, this.entityManager.entities);

        this.renderer.render(screen);

      }

    }

  }

  add(screen) {

    screen.screenManager = this;
    screen.isExiting = false;

    this.emit('screen-manager.add-screen', screen);

    if (this.isInitialized) {
      screen.activate(this.entityManager.entities);
    }

    this.screens.push(screen);

    return this;

  }

  remove(screen) {

    if (this.isInitialized) {
      screen.unload(this.entityManager.entities);
    }

    ArrayUtils.remove(this.screens, screen);
    ArrayUtils.remove(this.tempScreens, screen);

  }
  
  removeAll() {

    _.each(this.getScreens(), s => { this.remove(s); });

  }

  getScreens() {

    return this.screens.slice();
    
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

    for (const screen of this.screens) {
      for (const pixiObj of pixiObjsToRemove) {
        if (pixiObj) {
          screen.removeChild(pixiObj);
        }
      }
    }

  }

}
