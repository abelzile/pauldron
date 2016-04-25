import Component from '../component';


export default class NameComponent extends Component {

  constructor(name, description = '') {

    super();

    this._name = name;
    this._description = description;

  }

  get name() { return this._name; }

  get description() { return this._description; }

  clone() {
    return new NameComponent(this._name, this._description);
  }

}
