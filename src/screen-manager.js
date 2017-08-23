import * as _ from 'lodash';
import * as ArrayUtils from './utils/array-utils';
import * as Const from './const';
import EventEmitter from 'eventemitter2';

export default class ScreenManager extends EventEmitter {
  constructor(renderer, input, entityManager) {
    super();

    this.renderer = renderer;
    this.input = input;
    this.entityManager = entityManager;
    this.screens = [];
    this.tempScreens = [];
    this.isInitialized = false;
  }

  get screenCount() {
    return this.screens.length;
  }

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

      if (screen._screenState === Const.ScreenState.TransitionOn || screen._screenState === Const.ScreenState.Active) {
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
      if (screen._screenState !== Const.ScreenState.Hidden) {
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
    for (const screen of this.getScreens()) {
      this.remove(screen);
    }
  }

  getScreens() {
    return this.screens.slice();
  }

  cleanUpEntity(entity) {
    const components = [];

    ArrayUtils.append(
      components,
      entity.getAll('AnimatedSpriteComponent'),
      entity.getAll('GraphicsComponent'),
      entity.getAll('SpriteComponent'),
      entity.getAll('MeleeAttackComponent'),
    );

    const pixiObjs = [];

    for (const c of components) {
      if (_.has(c, 'animatedSprite')) {
        c.animatedSprite.destroy();
        pixiObjs.push(c.animatedSprite);
      }

      if (_.has(c, 'sprite')) {
        c.sprite.destroy();
        pixiObjs.push(c.sprite);
      }

      if (_.has(c, 'graphics')) {
        c.graphics.destroy();
        pixiObjs.push(c.graphics);
      }
    }

    if (pixiObjs.length === 0) {
      return;
    }

    for (const screen of this.screens) {
      screen.removeChild(...pixiObjs);
    }
  }
}
