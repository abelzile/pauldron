import * as StringUtils from '../utils/string-utils';
import Component from '../component';

export default class MeleeWeaponComponent extends Component {

  constructor(weapon, handedness) {

    super();

    this._weapon = weapon;
    this._handedness = handedness;

  }

  get weapon() { return this._weapon; }

  get handedness() { return this._handedness; }

  clone() {
    return new MeleeWeaponComponent(this._weapon, this._handedness);
  }
  
  toDisplayString() {
    return `${StringUtils.formatIdString(this._weapon)}\n${StringUtils.formatIdString(this._handedness)}`;
  }

}
