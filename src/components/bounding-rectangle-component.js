import Component from '../component';
import Rectangle from '../rectangle';

export default class BoundingRectangleComponent extends Component {
  constructor(rectangle = new Rectangle()) {
    super();
    this.rectangle = rectangle;
  }

  get x() {
    return this.rectangle.x;
  }
  set x(value) {
    this.rectangle.x = value;
  }

  get y() {
    return this.rectangle.y;
  }
  set y(value) {
    this.rectangle.y = value;
  }

  get width() {
    return this.rectangle.width;
  }
  set width(value) {
    this.rectangle.width = value;
  }

  get height() {
    return this.rectangle.height;
  }
  set height(value) {
    this.rectangle.height = value;
  }

  clone() {
    return new BoundingRectangleComponent(this.rectangle.clone());
  }
}
