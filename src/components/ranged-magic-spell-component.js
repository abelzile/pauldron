import Component from "../component";


export default class RangedMagicSpellComponent extends Component {

  constructor(magicSpellTypeId, projectileTypeId) {

    super();

    this._magicSpellTypeId = magicSpellTypeId;
    this._projectileTypeId = projectileTypeId;

  }

  get magicSpellTypeId() { return this._magicSpellTypeId; }
  
  get projectileTypeId() { return this._projectileTypeId; }

  clone() {
    return new RangedMagicSpellComponent(this._magicSpellTypeId, this._projectileTypeId);
  }

}