import * as StringUtils from '../utils/string-utils';
import Component from '../component';

export default class ArmorComponent extends Component {
  constructor(armorType, material, slotType) {
    super();

    this.armorType = armorType;
    this.material = material;
    this.slotType = slotType;
  }

  clone() {
    return new ArmorComponent(this.armorType, this.material, this.slotType);
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.material)} ${StringUtils.formatIdString(
      this.armorType
    )}\nWorn on: ${StringUtils.formatIdString(this.slotType)}`;
  }
}
