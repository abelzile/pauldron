import Component from '../component';

export default class AiComponent extends Component {
  constructor(initialState = '') {
    super();

    this._state = initialState;
    this._previousState = initialState;

    this.transitionData = undefined;
    this.timeLeftInCurrentState = 0;
  }

  get state() {
    return this._state;
  }

  get previousState() {
    return this._previousState;
  }
  set previousState(value) {
    this._previousState = value;
  }

  get hasTimeLeftInCurrentState() {
    return this.timeLeftInCurrentState > 0;
  }

  get hasStateChanged() {
    return this._state !== this._previousState;
  }

  updatePreviousStateToCurrent() {
    this._previousState = this._state;
  }

  changeState(newState, transitionData) {
    if (this._state === newState) {
      return;
    }

    this._previousState = this._state;
    this._state = newState;
    this.transitionData = transitionData;
  }
}
