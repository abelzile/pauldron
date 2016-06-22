import * as Const from "../const";
import * as StringUtils from "../utils/string-utils";
import Component from '../component';
import MagicSpellComponent from './magic-spell-component';


export default class RangedMagicSpellComponent extends MagicSpellComponent {

  constructor(magicSpellType, projectileType) {

    super(magicSpellType);

    this.projectileType = projectileType;

  }

  clone() {
    return new RangedMagicSpellComponent(this.magicSpellType, this.projectileType);
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.magicSpellType)}${Const.Char.LF}Ranged Attack`;
  }

}