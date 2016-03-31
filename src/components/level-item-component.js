import Component from '../component';
import Point from '../point';


export default class LevelItemComponent extends Component {

  constructor(itemTypeId, x, y) {

    super();

    this._itemTypeId = itemTypeId;
    this._startPosition = new Point(x, y);
    this._currentEntityId = '';

  }

  get itemTypeId() { return this._itemTypeId; }

  get startPosition() { return this._startPosition; }

  get currentEntityId() { return this._currentEntityId; }
  set currentEntityId(value) { this._currentEntityId = value; }

}
