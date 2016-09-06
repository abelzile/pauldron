import * as Const from '../const';
import * as StringUtils from '../utils/string-utils';
import _ from 'lodash';
import Component from '../component';
import MagicSpellComponent from './magic-spell-component';


export default class SelfMagicSpellComponent extends MagicSpellComponent {

  constructor(magicSpellType, actionFunc = _.noop) {

    super(magicSpellType);

    this.actionFunc = actionFunc;

  }

  clone() {
    return new SelfMagicSpellComponent(this.magicSpellType, this.actionFunc);
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.magicSpellType)}${Const.Char.LF}Cast on Self`;
  }

}