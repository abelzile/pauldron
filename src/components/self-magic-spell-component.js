import * as Const from "../const";
import * as StringUtils from '../utils/string-utils';
import Component from '../component';
import MagicSpellComponent from './magic-spell-component';


export default class SelfMagicSpellComponent extends MagicSpellComponent {

  constructor(magicSpellType) {

    super(magicSpellType);

  }

  clone() {
    return new SelfMagicSpellComponent(this.magicSpellType);
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.magicSpellType)}${Const.Char.LF}Cast on Self`;
  }

}