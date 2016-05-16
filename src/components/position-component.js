import Component from '../component';
import Point from '../point';


export default class PositionComponent extends Component {

  constructor(position = new Point()) {
    super();
    this.position = position;
  }

  clone() {
    return new PositionComponent(this.position.clone());
  }

}
