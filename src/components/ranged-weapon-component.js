import * as StringUtils from '../utils/string-utils';
import WeaponComponent from './weapon-component';

export default class RangedWeaponComponent extends WeaponComponent {
  constructor(weaponTypeId, weaponMaterialTypeId, handedness, projectileType) {
    super(weaponTypeId, weaponMaterialTypeId, handedness);

    this.projectileType = projectileType;
  }

  clone() {
    return new RangedWeaponComponent(
      this.weaponTypeId,
      this.weaponMaterialTypeId,
      this.handedness,
      this.projectileType
    );
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.weaponTypeId)}\n${StringUtils.formatIdString(this.handedness)}`;
  }
}
