import * as StringUtils from '../utils/string-utils';
import WeaponComponent from './weapon-component';

export default class RangedWeaponComponent extends WeaponComponent {
  constructor(weaponTypeId, weaponMaterialTypeId, handedness, projectileType, projectileCount = 1) {
    super(weaponTypeId, weaponMaterialTypeId, handedness);

    this.projectileType = projectileType;
    this.projectileCount = projectileCount;
  }

  clone() {
    return new RangedWeaponComponent(
      this.weaponTypeId,
      this.weaponMaterialTypeId,
      this.handedness,
      this.projectileType,
      this.projectileCount
    );
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.weaponTypeId)}\n${StringUtils.formatIdString(this.handedness)}`;
  }
}
