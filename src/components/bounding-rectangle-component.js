import Component from '../component';
import Rectangle from '../rectangle';

export default class BoundingRectangleComponent extends Component {

  constructor(rectangle = new Rectangle()) {
    super();
    this.rectangle = rectangle;
  }

  clone() {
    return new BoundingRectangleComponent(this.rectangle.clone());
  }

}
