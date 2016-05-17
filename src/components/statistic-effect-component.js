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

    let val = this.value;
    if (this.value < 0) {
      val = `${StringUtils.formatNumber(this.value)}`; // negative numbers will already have '-'.
    } else {
      val = `${StringUtils.getNumberSign(this.value)}${StringUtils.formatNumber(this.value)}`;
    }

    return `${StringUtils.formatIdString(this.name)}: ${val} to ${StringUtils.formatIdString(this.valueType)}`;

  }

}