import Component from "../component";


export default class RangedMagicSpellComponent extends Component {

  constructor(magicSpellType, projectileType) {

    super();

    this._magicSpellType = magicSpellType;
    this._projectileType = projectileType;

  }

  get magicSpellType() { return this._magicSpellType; }
  
  get projectileType() { return this._projectileType; }

  clone() {
    return new RangedMagicSpellComponent(this._magicSpellType, this._projectileType);
  }

}