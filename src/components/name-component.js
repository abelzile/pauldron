import Component from '../component';


export default class NameComponent extends Component {

  constructor(name = '') {
    super();
    this._name = name;
  }

  get name() { return this._name; }

  clone() {
    return new NameComponent(this._name);
  }

}
