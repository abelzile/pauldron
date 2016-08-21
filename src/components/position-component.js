import Component from '../component';
import Point from '../point';


export default class PositionComponent extends Component {

  constructor(position = new Point()) {
    super();
    this.position = position;
  }

  get x() { return this.position.x; }
  set x(value) { this.position.x = value; }

  get y() { return this.position.y; }
  set y(value) { this.position.y = value; }

  clone() {
    return new PositionComponent(this.position.clone());
  }

}
