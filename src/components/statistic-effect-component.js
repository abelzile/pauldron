import * as Const from '../const';
import * as StringUtils from '../utils/string-utils';
import Component from '../component';

export default class StatisticEffectComponent extends Component {

  constructor(name, value, valueType = Const.StatisticEffectValue.Current, targetType = Const.TargetType.Self) {

    super();

    this.name = name;
    this.value = value;
    this.valueType = valueType;
    this.targetType = targetType;

  }

  clone() {
    return new StatisticEffectComponent(this.name, this.value, this.valueType, this.targetType);
  }

  toInventoryDisplayString() {
    return `${StringUtils.formatIdString(this.name)}: ${StringUtils.getNumberSign(this.value)}${StringUtils.formatNumber(this.value)} to ${StringUtils.formatIdString(this.valueType)}`;
  }

}