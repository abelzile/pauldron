import Component from '../component';
import Point from '../point';


export default class PositionComponent extends Component {

  constructor(position = new Point()) {
    super();
    this._position = position;
  }

  get position() { return this._position; }

  clone() {
    return new PositionComponent(this._position.clone());
  }

}
