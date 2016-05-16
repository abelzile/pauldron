import Component from '../component';


export default class SelfMagicSpellComponent extends Component {

  constructor(magicSpellType) {

    super();

    this.magicSpellType = magicSpellType;

  }

  clone() {
    return new SelfMagicSpellComponent(this.magicSpellType);
  }

}