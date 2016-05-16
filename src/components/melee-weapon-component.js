import * as StringUtils from '../utils/string-utils';
import Component from '../component';

export default class MeleeWeaponComponent extends Component {

  constructor(weapon, handedness) {

    super();

    this.weapon = weapon;
    this.handedness = handedness;

  }

  clone() {
    return new MeleeWeaponComponent(this.weapon, this.handedness);
  }
  
  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.weapon)}\n${StringUtils.formatIdString(this.handedness)}`;
  }

}
