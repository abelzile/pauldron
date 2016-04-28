import Component from '../component';


export default class RangedWeaponComponent extends Component {

  constructor(weapon, handedness, projectile, duration, range, acceleration, damage) {

    super();

    this._weapon = weapon;
    this._handedness = handedness;
    this._projectile = projectile;
    this._duration = duration;
    this._range = range;
    this._acceleration = acceleration;
    this._damage = damage;

  }

  get weapon() { return this._weapon; }
  
  get handedness() { return this._handedness; }

  get projectile() { return this._projectile; }

  get duration() { return this._duration; } // time it takes to attack with the bow

  get range() { return this._range; } // distance projectile will cover

  get acceleration() { return this._acceleration; } // projectile acceleration

  get damage() { return this._damage; }

  clone() {
    return new RangedWeaponComponent(this._weapon, this._handedness, this._projectile, this._duration, this._range, this._acceleration, this._damage);
  }

}
