import Component from '../component';
import Vector from '../vector';

export default class LevelContainerComponent extends Component {
  constructor(containerTypeId, x, y, containerDropType) {
    super();

    this.containerTypeId = containerTypeId;
    this.startPosition = new Vector(x, y);
    this.containerDropType = containerDropType;
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
