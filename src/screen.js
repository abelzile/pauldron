import * as _ from 'lodash';
import * as Const from './const';
import * as Pixi from 'pixi.js';

export default class Screen extends Pixi.Container {
  constructor(isPopup = false, backgroundColor = Const.Color.DarkBlueGray) {
    super();

    this.isPopup = isPopup;
    this.transitionOnTime = 0;
    this.transitionOffTime = 0;
    this.transitionPosition = 1;
    this._screenState = Const.ScreenState.TransitionOn;
    this.isExiting = false;
    this.otherScreenHasFocus = false;
    this.screenManager = undefined;
    this._backgroundColor = backgroundColor;
    this._backgroundColorGraphic = new Pixi.Graphics();
    this.addChild(this._backgroundColorGraphic);
    this.setBackgroundColor(backgroundColor);
    this._transitionOnGraphic = new Pixi.Graphics();
    this.addChild(this._transitionOnGraphic);
  }

  get transitionAlpha() {
    return 1 - this.transitionPosition;
  }

  get screenState() {
    return this._screenState;
  }
  set screenState(value) {
    if (this._screenState !== Const.ScreenState.Active && value === Const.ScreenState.Active) {
      this.screenManager.input.clear();
    }
    this._screenState = value;
  }

  get isActive() {
    return !this.otherScreenHasFocus && this._screenState === Const.ScreenState.Active;
  }

  setBackgroundColor(color) {
    this._backgroundColor = color;
    this._backgroundColorGraphic
      .clear()
      .lineStyle()
      .beginFill(this._backgroundColor)
      .drawRect(0, 0, Const.ScreenWidth, Const.ScreenHeight)
      .endFill();
  }

  activate(entities) {}

  deactivate(entities) {}

  unload(entities) {}

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {
    this.otherScreenHasFocus = otherScreenHasFocus;

    if (this.isExiting) {
      this.screenState = Const.ScreenState.TransitionOff;

      if (!this._updateTransition(gameTime, this.transitionOffTime, 1)) {
        this.screenManager.remove(this);
      }
    } else if (coveredByOtherScreen) {
      if (this._updateTransition(gameTime, this.transitionOffTime, 1)) {
        this.screenState = Const.ScreenState.TransitionOff;
      } else {
        this.screenState = Const.ScreenState.Hidden;
      }
    } else {
      if (this._updateTransition(gameTime, this.transitionOnTime, -1)) {
        this.screenState = Const.ScreenState.TransitionOn;
      } else {
        this.screenState = Const.ScreenState.Active;
      }
    }
  }

  handleInput(gameTime, entities, input) {}

  draw(gameTime, entities) {
    if (!this._transitionOnGraphic) {
      return;
    }

    if (this.transitionOnTime === 0) {
      this._removeTransitionGraphic();
    } else {
      const alpha = _.clamp(1 - this.transitionAlpha, 0, 1);

      if (this.children[this.children.length - 1] !== this._transitionOnGraphic) {
        this.removeChild(this._transitionOnGraphic);
        this.addChild(this._transitionOnGraphic);
      }

      this._transitionOnGraphic.clear();

      if (alpha === 0) {
        this._removeTransitionGraphic();
      } else {
        this._transitionOnGraphic
          .lineStyle()
          .beginFill(0x000000, alpha)
          .drawRect(0, 0, Const.ScreenWidth, Const.ScreenHeight)
          .endFill();
      }
    }
  }

  exitScreen() {
    if (this.transitionOffTime === 0) {
      this.screenManager.remove(this);
    } else {
      this.isExiting = true;
    }
  }

  _updateTransition(gameTime, time, direction) {
    const transitionDelta = time === 0 ? 1 : gameTime / time;

    this.transitionPosition += transitionDelta * direction;

    if (direction < 0 && this.transitionPosition <= 0 || direction > 0 && this.transitionPosition >= 1) {
      this.transitionPosition = _.clamp(this.transitionPosition, 0, 1);
      return false;
    }
    return true;
  }

  _removeTransitionGraphic() {
    this.removeChild(this._transitionOnGraphic);
    this._transitionOnGraphic.destroy();
    this._transitionOnGraphic = null;
  }
}
