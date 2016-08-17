import * as StringUtils from '../utils/string-utils';
import WeaponComponent from './weapon-component';


export default class MeleeWeaponComponent extends WeaponComponent {

  constructor(weaponTypeId, weaponMaterialTypeId, handedness, gradientColor1 = '#ffffff', gradientColor2 = '#ffffff') {

    super(weaponTypeId, weaponMaterialTypeId, handedness);

    this.gradientColor1 = gradientColor1;
    this.gradientColor2 = gradientColor2;

  }

  clone() {
    return new MeleeWeaponComponent(this.weaponTypeId, this.weaponMaterialTypeId, this.handedness, this.gradientColor1, this.gradientColor2);
  }
  
  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.weaponTypeId)}\n${StringUtils.formatIdString(this.handedness)}`;
  }

}
