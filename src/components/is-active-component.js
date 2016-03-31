import Component from '../component';


export default class IsActiveComponent extends Component {

  constructor(isActive = false) {
    super();
    this._isActive = isActive;
  }

  get isActive() { return this._isActive; }
  set isActive(value) { this._isActive = value; }

  clone() {
    return new IsActiveComponent(this._isActive);
  }

}
