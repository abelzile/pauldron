import * as StringUtils from '../utils/string-utils';
import WeaponComponent from './weapon-component';


export default class MeleeWeaponComponent extends WeaponComponent {

  constructor(weaponTypeId, handedness) {
    super(weaponTypeId, handedness);
  }

  clone() {
    return new MeleeWeaponComponent(this.weaponTypeId, this.handedness);
  }
  
  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.weaponTypeId)}\n${StringUtils.formatIdString(this.handedness)}`;
  }

}
