import Component from '../component';
import Rectangle from '../rectangle';


export default class BoundingRectangleComponent extends Component {

  constructor(rectangle = new Rectangle()) {

    super();

    this._rectangle = rectangle;

  }

  get rectangle() { return this._rectangle; }

  clone() {
    return new BoundingRectangleComponent(this._rectangle.clone());
  }

}
