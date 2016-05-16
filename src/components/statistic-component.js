import * as Const from '../const';
import * as StringUtils from '../utils/string-utils';
import _ from 'lodash';
import Component from '../component';


export default class StatisticComponent extends Component {

  constructor(name, maxValue, currentValue) {

    super();

    if (!name) { throw new Error('name parameter cannot be null or undefined.'); }
    if (!_.isNumber(maxValue)) { throw new Error('maxValue must be a number.'); }
    if (currentValue && !_.isNumber(currentValue)) { throw new Error('currentValue must be a number.'); }

    this.name = name;
    this.maxValue = maxValue;
    this._currentValue = currentValue || this.maxValue;

  }

  get currentValue() { return this._currentValue; }
  set currentValue(value) {

    this._currentValue = value;

    if (this._currentValue > this.maxValue) {
      this._currentValue = this.maxValue;
    }

  }
  
  apply(statisticEffectComp) {

    if (this.name !== statisticEffectComp.name) { return false; }

    switch (statisticEffectComp.valueType) {

      case Const.StatisticEffectValue.Current:
        this.currentValue += statisticEffectComp.value;
        break;
      case Const.StatisticEffectValue.Max:
        this.maxValue += statisticEffectComp.value;
        break;
      default:
        throw new Error(`valueType is "${statisticEffectComp.valueType}". valueType must be "${Const.StatisticEffectValue.Current}" or "${Const.StatisticEffectValue.Max}".`);

    }
    
    return true;

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
