import Component from '../component';


export default class MeleeWeaponComponent extends Component {

  //IDEA:base damage and maybe some other things may eventually go in here (or they may become separate components along with duration, range, etc.).

  constructor(weapon, duration, range, arc, damage) {

    super();

    this._weapon = weapon;
    this._duration = duration;
    this._range = range;
    this._arc = arc;
    this._damage = damage;

  }

  get weapon() { return this._weapon; }

  get duration() { return this._duration; }

  get range() { return this._range; }

  get arc() { return this._arc; }

  get damage() { return this._damage; }

  clone() {
    return new MeleeWeaponComponent(this._weapon, this._duration, this._range, this._arc, this._damage);
  }

}
