import Component from '../component';
import Point from '../point';


export default class GatewayComponent extends Component {

  constructor(position = new Point(), fromLevelName = '', toLevelName = '') {
    super();
    this._position = position;
    this._fromLevelName = fromLevelName;
    this._toLevelName = toLevelName;
  }

  get position() { return this._position; }

  get fromLevelName() { return this._fromLevelName; }

  get toLevelName() { return this._toLevelName; }

  clone() {
    return new GatewayComponent(this._position.clone(), this._fromLevelName, this._toLevelName);
  }

}
