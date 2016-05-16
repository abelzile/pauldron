import * as StringUtils from '../utils/string-utils';
import Component from '../component';


export default class RangedWeaponComponent extends Component {

  constructor(weapon, handedness, projectile) {

    super();

    this.weapon = weapon;
    this.handedness = handedness;
    this.projectile = projectile;

  }

  clone() {
    return new RangedWeaponComponent(this.weapon, this.handedness, this.projectile);
  }
  
  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.weapon)}\n${StringUtils.formatIdString(this.handedness)}`;
  }

}
