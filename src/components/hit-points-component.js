import Component from '../component';


export default class HitPointsComponent extends Component {

  constructor(maxHp) {

    super();

    this._maxHp = maxHp;
    this._currentHp = this._maxHp;

  }

  get maxHp() { return this._maxHp; }
  set maxHp(value) { this._maxHp = value; }

  get currentHp() { return this._currentHp; }
  set currentHp(value) { this._currentHp = value; }

  clone() {
    return new HitPointsComponent(this._maxHp);
  }

}
