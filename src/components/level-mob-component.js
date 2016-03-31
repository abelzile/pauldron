import Component from '../component';
import Point from '../point';


export default class LevelMobComponent extends Component{

  constructor(mobTypeId, x, y) {

    super();

    this._mobTypeId = mobTypeId;
    this._startPosition = new Point(x, y);
    this._currentEntityId = '';

  }

  get mobTypeId() { return this._mobTypeId; }

  get startPosition() { return this._startPosition; }

  get currentEntityId() { return this._currentEntityId; }
  set currentEntityId(value) { this._currentEntityId = value; }

}
