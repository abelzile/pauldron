import Pixi from 'pixi.js';
import * as MathUtils from './utils/math-utils';
import * as Const from './const';


export default class Screen extends Pixi.Container {

  constructor(isPopup = false) {

    super();

    this._isPopup = isPopup;
    this._transitionOnTime = 0;
    this._transitionOffTime = 0;
    this._transitionPosition = 1.0;
    this._screenState = Const.ScreenState.TransitionOn;
    this._isExiting = false;
    this._otherScreenHasFocus = false;
    this._screenManager = undefined;

  }

  get isPopup() { return this._isPopup; }

  get transitionOnTime() { return this._transitionOnTime; }
  get transitionOffTime() { return this._transitionOffTime; }

  get screenState() { return this._screenState; }

  get isExiting() { return this._isExiting; }
  set isExiting(value) { this._isExiting = value; }

  get screenManager() { return this._screenManager; }
  set screenManager(value) { this._screenManager = value; }

  get transitionAlpha() { return 1.0 - this._transitionPosition; }

  get isActive() {
    return !this._otherScreenHasFocus &&
      (this._screenState === Const.ScreenState.TransitionOn || this._screenState === Const.ScreenState.Active);
  }

  activate(entities) {
  }

  deactivate(entities) {
  }

  unload(entities) {
  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {

    this._otherScreenHasFocus = otherScreenHasFocus;

    if (this._isExiting) {

      this._screenState = Const.ScreenState.TransitionOff;

      if (!this._updateTransition(gameTime, this._transitionOffTime, 1)) {
        this._screenManager.remove(this);
      }

    } else if (coveredByOtherScreen) {

      if (this._updateTransition(gameTime, this._transitionOffTime, 1)) {
        this._screenState = Const.ScreenState.TransitionOff;
      } else {
        this._screenState = Const.ScreenState.Hidden;
      }

    } else {

      if (this._updateTransition(gameTime, this._transitionOnTime, -1)) {
        this._screenState = Const.ScreenState.TransitionOn;
      } else {
        this._screenState = Const.ScreenState.Active;
      }

    }

  }

  handleInput(gameTime, entities, input) {
  }

  draw(gameTime, entities) {
  }

  exitScreen() {

    if (this._transitionOffTime === 0) {
      this._screenManager.remove(this);
    } else {
      this._isExiting = true;
    }

  }

  _updateTransition(gameTime, time, direction) {

    var transitionDelta = (time === 0) ? 1 : gameTime / time;

    this._transitionPosition += transitionDelta * direction;

    if ((direction < 0 && this._transitionPosition <= 0) || (direction > 0 && this._transitionPosition >= 1)) {
      this._transitionPosition = MathUtils.clamp(this._transitionPosition, 0, 1);
      return false;
    }

    return true;

  }

}
