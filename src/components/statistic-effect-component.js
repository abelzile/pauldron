import * as Const from '../const';
import * as StringUtils from '../utils/string-utils';
import Component from '../component';

export default class StatisticEffectComponent extends Component {

  constructor(name, value, valueType = Const.StatisticEffectValue.Current) {

    super();

    this._name = name;
    this._value = value;
    this._valueType = valueType;

  }

  get name() { return this._name; }

  get value() { return this._value; }

  get valueType() { return this._valueType; }

  clone() {
    return new StatisticEffectComponent(this._name, this._value, this._valueType);
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this._name)}: ${StringUtils.getNumberSign(this._value)}${StringUtils.formatNumber(this._value)} to ${StringUtils.formatIdString(this._valueType)}`;
  }

}