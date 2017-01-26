import Component from '../component';
import Vector from '../vector';

export default class LevelMobComponent extends Component {

  constructor(mobTypeId, x, y, isBoss = false) {

    super();

    this.mobTypeId = mobTypeId;
    this.startPosition = new Vector(x, y);
    this.isBoss = isBoss;
    this.currentEntityId = '';

  }

  get x() {
    return this.startPosition.x;
  }

  get y() {
    return this.startPosition.y;
  }

  clone() {
    throw new Error('Not implemented.');
  }

}
