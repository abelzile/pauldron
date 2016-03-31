import Component from '../component';
import Point from '../point';


export default class LevelContainerComponent extends Component{

  constructor(containerTypeId, x, y) {

    super();

    this._containerTypeId = containerTypeId;
    this._startPosition = new Point(x, y);
    this._currentEntityId = '';

  }

  get containerTypeId() { return this._containerTypeId; }

  get startPosition() { return this._startPosition; }

  get currentEntityId() { return this._currentEntityId; }
  set currentEntityId(value) { this._currentEntityId = value; }

}
