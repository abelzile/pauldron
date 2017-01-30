import Component from '../component';
import Vector from '../vector';

export default class LevelItemComponent extends Component {

  constructor(itemTypeId, x, y) {

    super();

    this.itemTypeId = itemTypeId;
    this.startPosition = new Vector(x, y);
    this.currentEntityId = '';

  }

  clone() {
    throw new Error('Not implemented.');
  }

}
