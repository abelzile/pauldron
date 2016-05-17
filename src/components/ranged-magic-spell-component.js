import * as Const from "../const";
import * as StringUtils from "../utils/string-utils";
import Component from '../component';


export default class RangedMagicSpellComponent extends Component {

  constructor(magicSpellType, projectileType) {

    super();

    this.magicSpellType = magicSpellType;
    this.projectileType = projectileType;

  }

  clone() {
    return new RangedMagicSpellComponent(this.magicSpellType, this.projectileType);
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.magicSpellType)}${Const.Char.LF}Ranged Attack`;
  }

}