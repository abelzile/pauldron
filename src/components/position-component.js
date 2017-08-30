import Component from '../component';
import Vector from '../vector';

export default class PositionComponent extends Component {
  constructor(position = new Vector()) {
    super();
    this.position = position;
    this.previousPosition = this.position.clone();
  }

  get x() {
    return this.position.x;
  }
  set x(value) {
    this.previousPosition.x = this.position.x;
    this.position.x = value;
  }

  get y() {
    return this.position.y;
  }
  set y(value) {
    this.previousPosition.y = this.position.y;
    this.position.y = value;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  clone() {
    return new PositionComponent(this.position.clone());
  }
}
