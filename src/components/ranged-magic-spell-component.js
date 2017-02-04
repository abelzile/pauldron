import * as Const from "../const";
import * as StringUtils from "../utils/string-utils";
import MagicSpellComponent from './magic-spell-component';

export default class RangedMagicSpellComponent extends MagicSpellComponent {

  constructor(magicSpellType, projectileType, projectileCount = 1) {

    super(magicSpellType);

    this.projectileType = projectileType;
    this.projectileCount = projectileCount;

  }

  clone() {
    return new RangedMagicSpellComponent(this.magicSpellType, this.projectileType, this.projectileCount);
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.magicSpellType)}${Const.Char.LF}Ranged Attack`;
  }

}