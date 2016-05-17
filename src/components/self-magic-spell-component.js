import * as Const from "../const";
import * as StringUtils from '../utils/string-utils';
import Component from '../component';


export default class SelfMagicSpellComponent extends Component {

  constructor(magicSpellType) {

    super();

    this.magicSpellType = magicSpellType;

  }

  clone() {
    return new SelfMagicSpellComponent(this.magicSpellType);
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.magicSpellType)}${Const.Char.LF}Target: Self`;
  }

}