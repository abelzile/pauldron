import Component from '../component';

export default class ArrivalComponent extends Component {

  constructor(position, fromLevelName) {
    super();
    this.position = position;
    this.fromLevelName = fromLevelName;
  }

  get x() { return this.position.x; }
  set x(value) { this.position.x = value; }

  get y() { return this.position.y; }
  set y(value) { this.position.y = value; }

  clone() {
    return new ArrivalComponent(this.position, this.fromLevelName);
  }

}