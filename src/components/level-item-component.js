import Component from '../component';
import Point from '../point';


export default class LevelItemComponent extends Component {

  constructor(itemTypeId, x, y) {

    super();

    this.itemTypeId = itemTypeId;
    this.startPosition = new Point(x, y);
    this.currentEntityId = '';

  }

  clone() {
    throw new Error('Not implemented.');
  }

}
