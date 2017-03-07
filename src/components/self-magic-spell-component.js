import * as _ from 'lodash';
import * as Const from '../const';
import * as StringUtils from '../utils/string-utils';
import MagicSpellComponent from './magic-spell-component';


export default class SelfMagicSpellComponent extends MagicSpellComponent {

  constructor(magicSpellType, actionFunc = _.noop, attackShape = Const.AttackShape.Slash,
              attackGradientColor1 = 0xffffff, attackGradientColor2 = 0xffffff, glowColor = 0xffffff) {

    super(magicSpellType);

    this.actionFunc = actionFunc;
    this.attackShape = attackShape;
    this.attackGradientColor1 = attackGradientColor1;
    this.attackGradientColor2 = attackGradientColor2;
    this.glowColor = glowColor;

  }

  clone() {
    return new SelfMagicSpellComponent(
      this.magicSpellType,
      this.actionFunc,
      this.attackShape,
      this.attackGradientColor1,
      this.attackGradientColor2,
      this.glowColor);
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.magicSpellType)}${Const.Char.LF}Cast on Self`;
  }

}