import * as StringUtils from '../utils/string-utils';
import Component from '../component';


export default class RangedWeaponComponent extends Component {

  constructor(weapon, handedness, projectileType) {

    super();

    this.weapon = weapon;
    this.handedness = handedness;
    this.projectileType = projectileType;

  }

  clone() {
    return new RangedWeaponComponent(this.weapon, this.handedness, this.projectileType);
  }
  
  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.weapon)}\n${StringUtils.formatIdString(this.handedness)}`;
  }

}
