import * as StringUtils from '../utils/string-utils';
import Component from '../component';


export default class ArmorComponent extends Component {

  constructor(armorType, material, slotType) {

    super();
    
    this._armorType = armorType;
    this._material = material;
    this._slotType = slotType;

  }

  get armorType() { return this._armorType; }

  get material() { return this._material; }
  
  get slotType() { return this._slotType; }

  clone() {
    return new ArmorComponent(this._armorType, this._material, this._slotType);
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this._material)} ${StringUtils.formatIdString(this._armorType)}\nWorn on: ${StringUtils.formatIdString(this._slotType)}`;
  }

}
