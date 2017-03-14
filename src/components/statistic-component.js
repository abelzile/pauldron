import * as _ from 'lodash';
import * as Const from '../const';
import * as ObjectUtils from '../utils/object-utils';
import * as StringUtils from '../utils/string-utils';
import Component from '../component';

export default class StatisticComponent extends Component {
  constructor(name, maxValue, currentValue) {
    super();

    if (!name) {
      throw new Error('name parameter cannot be null or undefined.');
    }
    if (!_.isNumber(maxValue)) {
      throw new Error('maxValue must be a number.');
    }
    if (currentValue && !_.isNumber(currentValue)) {
      throw new Error('currentValue must be a number.');
    }

    this.name = name;
    this.maxValue = maxValue;
    this._currentValue = currentValue || this.maxValue;
  }

  get currentValue() {
    return this._currentValue;
  }
  set currentValue(value) {
    this._currentValue = value;

    if (this._currentValue > this.maxValue) {
      this._currentValue = this.maxValue;
    }
  }

  apply(effectComp) {
    const typeName = ObjectUtils.getTypeName(effectComp);

    switch (typeName) {
      case 'StatisticEffectComponent': {
        if (this.name !== effectComp.name) {
          return false;
        }

        switch (effectComp.valueType) {
          case Const.StatisticEffectValue.Current:
            this.currentValue += effectComp.value;
            break;
          case Const.StatisticEffectValue.Max:
            this.maxValue += effectComp.value;
            break;
          default:
            throw new Error(
              `valueType is "${effectComp.valueType}". valueType must be "${Const.StatisticEffectValue.Current}" or "${Const.StatisticEffectValue.Max}".`
            );

        }

        return true;
      }
      case 'LevelUpRewardComponent': {
        if (this.name !== effectComp.statisticId) {
          return false;
        }

        this.maxValue += effectComp.amount;

        return true;
      }
      default: {
        throw new Error('"' + typeName + '" is an invalid statistic modifying component.');
      }

    }

    return false;
  }

  clone() {
    return new StatisticComponent(this.name, this.maxValue, this.currentValue);
  }

  toInventoryDisplayString(includeMaxValue) {
    let s = `${StringUtils.formatIdString(this.name)}: ${StringUtils.formatNumber(this.currentValue)}`;

    if (includeMaxValue) {
      s += `/${StringUtils.formatNumber(this.maxValue)}`;
    }

    return s;
  }
}
