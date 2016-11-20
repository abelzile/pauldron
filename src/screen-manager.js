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

    const screens = this.getScreens();

    for (let i = 0; i < screens.length; ++i) {
      this.remove(screens[i]);
    }

  }

  getScreens() {

    return this.screens.slice();
    
  }

  cleanUpEntity(entity) {

    const components = [].concat(entity.getAll('AnimatedSpriteComponent'),
                                 entity.getAll('GraphicsComponent'),
                                 entity.getAll('InventoryIconComponent'));

    const pixiObjs = _.reduce(components, (accum, c) => {

      if (c.animatedSprite) {
        accum.push(c.animatedSprite);
      }

      if (c.graphics) {
        accum.push(c.graphics);
      }

      if (c.sprite) {
        accum.push(c.sprite);
      }

      return accum;

    }, []);

    if (pixiObjs.length > 0) {
      _.forEach(this.screens, s => { s.removeChild(...pixiObjs); });
    }

  }

}
