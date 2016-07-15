import Component from '../component';
import NameComponent from './name-component';


export default class CharacterClassComponent extends Component {

  constructor(typeId, name, description) {

    super();

    this.typeId = typeId;
    this.nameComponent = new NameComponent(name, description);

  }

  get name() { return this.nameComponent.name; }

  get description() { return this.nameComponent.description; }

  clone() {
    return new CharacterClassComponent(this.typeId, this.name, this.description);
  }

}