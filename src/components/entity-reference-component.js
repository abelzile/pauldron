import Component from '../component';


export default class EntityReferenceComponent extends Component {

  constructor(typeId = '', entityId = '') {

    super();

    this._typeId = typeId;
    this._entityId = entityId;

  }

  get typeId() { return this._typeId; }
  set typeId(value) { this._typeId = value; }

  get entityId() { return this._entityId; }
  set entityId(value) { this._entityId = value; }

  clone() {
    return new EntityReferenceComponent(this._typeId, this._entityId);
  }

}
