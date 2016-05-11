import * as Const from '../const';
import * as StringUtils from '../utils/string-utils';
import Component from '../component';

export default class StatisticEffectComponent extends Component {

  constructor(name, value, valueType = Const.StatisticEffectValue.Current, targetType = Const.TargetType.Self) {

    super();

    this._name = name;
    this._value = value;
    this._valueType = valueType;
    this._targetType = targetType;

  }

  get name() { return this._name; }

  get value() { return this._value; }

  get valueType() { return this._valueType; }

  get targetType() { return this._targetType; }

  clone() {
    return new StatisticEffectComponent(this._name, this._value, this._valueType, this._targetType);
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this._name)}: ${StringUtils.getNumberSign(this._value)}${StringUtils.formatNumber(this._value)} to ${StringUtils.formatIdString(this._valueType)}`;
  }

}