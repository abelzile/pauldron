import Component from '../component';


export default class ArmorComponent extends Component {

  constructor(slotType) {

    super();

    //TODO:armor material, etc.

    this._slotType = slotType;

  }

  get slotType() { return this._slotType; }

  clone() {
    return new ArmorComponent(this._slotType);
  }

}
