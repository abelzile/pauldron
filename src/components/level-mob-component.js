import Component from '../component';
import Point from '../point';


export default class LevelMobComponent extends Component{

  constructor(mobTypeId, x, y) {

    super();

    this.mobTypeId = mobTypeId;
    this.startPosition = new Point(x, y);
    this.currentEntityId = '';

  }

  clone() {
    throw new Error('Not implemented.');
  }

}
