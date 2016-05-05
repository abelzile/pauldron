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

    this._name = name;
    this._maxValue = maxValue;
    this._currentValue = currentValue || this._maxValue;

  }

  get name() { return this._name; }

  get maxValue() { return this._maxValue; }
  set maxValue(value) { this._maxValue = value; }

  get currentValue() { return this._currentValue; }
  set currentValue(value) {

    this._currentValue = value;

    if (this._currentValue > this._maxValue) {
      this._currentValue = this._maxValue;
    }

  }
  
  apply(statisticEffectComp) {

    if (this._name !== statisticEffectComp.name) { return false; }

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
    return new StatisticComponent(this._name, this._maxValue, this._currentValue);
  }
  
  toInventoryDisplayString(includeMaxValue) {

    let s = `${StringUtils.formatIdString(this._name)}: ${StringUtils.formatNumber(this._currentValue)}`;

    if (includeMaxValue) {
      s += `/${StringUtils.formatNumber(this._maxValue)}`;
    }

    return s;

  }

}
