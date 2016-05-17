import Pixi from 'pixi.js';
import * as MathUtils from './utils/math-utils';
import * as Const from './const';


export default class Screen extends Pixi.Container {

  constructor(isPopup = false) {

    super();

    this.isPopup = isPopup;
    this.transitionOnTime = 0;
    this.transitionOffTime = 0;
    this.transitionPosition = 1.0;
    this.screenState = Const.ScreenState.TransitionOn;
    this.isExiting = false;
    this.otherScreenHasFocus = false;
    this.screenManager = undefined;

  }

  get transitionAlpha() { return 1.0 - this.transitionPosition; }

  get isActive() {
    return !this.otherScreenHasFocus &&
      (this.screenState === Const.ScreenState.TransitionOn || this.screenState === Const.ScreenState.Active);
  }

  activate(entities) {
  }

  deactivate(entities) {
  }

  unload(entities) {
  }

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

  handleInput(gameTime, entities, input) {
  }

  draw(gameTime, entities) {
  }

  exitScreen() {

    if (this.transitionOffTime === 0) {
      this.screenManager.remove(this);
    } else {
      this.isExiting = true;
    }

  }

  _updateTransition(gameTime, time, direction) {

    var transitionDelta = (time === 0) ? 1 : gameTime / time;

    this.transitionPosition += transitionDelta * direction;

    if ((direction < 0 && this.transitionPosition <= 0) || (direction > 0 && this.transitionPosition >= 1)) {
      this.transitionPosition = MathUtils.clamp(this.transitionPosition, 0, 1);
      return false;
    }

    return true;

  }

}
