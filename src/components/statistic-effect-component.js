import * as _ from 'lodash';
import * as Const from '../const';
import * as StringUtils from '../utils/string-utils';
import Component from '../component';

export default class StatisticEffectComponent extends Component {
  constructor(
    name,
    value,
    timeLeft = 1,
    targetType = Const.TargetType.Self,
    valueType = Const.StatisticEffectValue.Current,
    onRemoveFromEntity = _.noop
  ) {
    super(onRemoveFromEntity);

    this.name = name;
    this.value = value;
    this.timeLeft = timeLeft;
    this.targetType = targetType;
    this.valueType = valueType;
  }

  clone() {
    return new StatisticEffectComponent(
      this.name,
      this.value,
      this.timeLeft,
      this.targetType,
      this.valueType,
      this.onRemoveFromEntity
    );
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
