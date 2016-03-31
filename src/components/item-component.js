import Component from '../component';


export default class ItemComponent extends Component {

  constructor(itemTypeId) {

    super();

    this._itemTypeId = itemTypeId;

  }

  get itemTypeId() { return this._itemTypeId; }

  clone() {
    return new ItemComponent(this._itemTypeId);
  }

}
