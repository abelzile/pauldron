import * as Const from '../const';
import * as StringUtils from '../utils/string-utils';

import WeaponComponent from './weapon-component';

export default class MeleeWeaponComponent extends WeaponComponent {

  constructor(
    weaponTypeId,
    weaponMaterialTypeId,
    handedness,
    attackShape = Const.AttackShape.Slash,
    attackGradientColor1 = 0xffffff,
    attackGradientColor2 = 0xffffff,
    glowColor = 0xffffff
  ) {

    super(weaponTypeId, weaponMaterialTypeId, handedness);

    this.attackShape = attackShape;
    this.attackGradientColor1 = attackGradientColor1;
    this.attackGradientColor2 = attackGradientColor2;
    this.glowColor = glowColor;

  }

  clone() {
    return new MeleeWeaponComponent(
      this.weaponTypeId,
      this.weaponMaterialTypeId,
      this.handedness,
      this.attackShape,
      this.attackGradientColor1,
      this.attackGradientColor2,
      this.glowColor
    );
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.weaponTypeId)}\n${StringUtils.formatIdString(this.handedness)}`;
  }

}
