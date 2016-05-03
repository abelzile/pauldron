import Component from '../component';


export default class RangedWeaponComponent extends Component {

  constructor(weapon, handedness, projectile) {

    super();

    this._weapon = weapon;
    this._handedness = handedness;
    this._projectile = projectile;

  }

  get weapon() { return this._weapon; }
  
  get handedness() { return this._handedness; }

  get projectile() { return this._projectile; }

  clone() {
    return new RangedWeaponComponent(this._weapon, this._handedness, this._projectile);
  }

}
