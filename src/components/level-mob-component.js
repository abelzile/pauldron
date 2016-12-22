import Component from '../component';
import Vector from '../vector';


export default class LevelMobComponent extends Component{

  constructor(mobTypeId, x, y) {

    super();

    this.mobTypeId = mobTypeId;
    this.startPosition = new Vector(x, y);
    this.currentEntityId = '';

  }

  clone() {
    throw new Error('Not implemented.');
  }

}
