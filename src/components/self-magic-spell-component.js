import Component from '../component';


export default class SelfMagicSpellComponent extends Component {

  constructor(magicSpellType) {

    super();

    this._magicSpellType = magicSpellType;

  }

  get magicSpellType() { return this._magicSpellType; }

  clone() {
    return new SelfMagicSpellComponent(this._magicSpellType);
  }

}