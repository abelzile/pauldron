import Component from '../component';


export default class AiComponent extends Component {

  constructor() {

    super();

    this._stateMachine = undefined;
    this._timeLeftInCurrentState = 0;

  }

  get stateMachine() { return this._stateMachine; }
  set stateMachine(value) { this._stateMachine = value; }

  get currentState() { return this._stateMachine.current; }

  get timeLeftInCurrentState() { return this._timeLeftInCurrentState; }
  set timeLeftInCurrentState(value) { this._timeLeftInCurrentState = value; }

  get hasTimeLeftInCurrentState() { return this._timeLeftInCurrentState > 0; }

}
