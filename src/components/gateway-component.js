import Component from '../component';
import Point from '../point';


export default class GatewayComponent extends Component {

  constructor(position = new Point(), fromLevelName = '', toLevelName = '') {

    super();

    this.position = position;
    this.fromLevelName = fromLevelName;
    this.toLevelName = toLevelName;

  }

  get x() { return this.position.x; }
  set x(value) { this.position.x = value; }

  get y() { return this.position.y; }
  set y(value) { this.position.y = value; }

  clone() {
    return new GatewayComponent(this.position.clone(), this.fromLevelName, this.toLevelName);
  }

}
