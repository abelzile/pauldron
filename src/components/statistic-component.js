import Component from '../component';


export default class StatisticComponent extends Component {

  constructor(name, value = 0.0) {

    super();

    if (!name) { throw new Error('name parameter cannot be null or undefined.'); }

    this._name = name;
    this._value = value;

  }

  get name() { return this._name; }

  get value() { return this._value; }

  clone() {
    return new StatisticComponent(this._name, this._value);
  }

}
