import Component from '../component';
import Point from '../point';


export default class GatewayComponent extends Component {

  constructor(position = new Point(), fromLevelName = '', toLevelName = '') {

    super();

    this.position = position;
    this.fromLevelName = fromLevelName;
    this.toLevelName = toLevelName;

  }

  clone() {
    return new GatewayComponent(this.position.clone(), this.fromLevelName, this.toLevelName);
  }

}
