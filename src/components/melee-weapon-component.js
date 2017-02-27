import * as Const from '../const';
import * as StringUtils from '../utils/string-utils';

import WeaponComponent from './weapon-component';

export default class MeleeWeaponComponent extends WeaponComponent {

  constructor(
    weaponTypeId,
    weaponMaterialTypeId,
    handedness,
    attackShape = Const.AttackShape.Slash,
    gradientColor1 = 0xffffff,
    gradientColor2 = 0xffffff,
    glowColor = 0xffffff
  ) {

    super(weaponTypeId, weaponMaterialTypeId, handedness);

    this.attackShape = attackShape;
    this.gradientColor1 = gradientColor1;
    this.gradientColor2 = gradientColor2;
    this.glowColor = glowColor;

  }

  clone() {
    return new MeleeWeaponComponent(
      this.weaponTypeId,
      this.weaponMaterialTypeId,
      this.handedness,
      this.attackShape,
      this.gradientColor1,
      this.gradientColor2,
      this.glowColor
    );
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.weaponTypeId)}\n${StringUtils.formatIdString(this.handedness)}`;
  }

}
