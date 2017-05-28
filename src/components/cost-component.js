import * as _ from 'lodash';
import Component from '../component';

export default class CostComponent extends Component {
  constructor(amount) {
    super();
    if (!_.isNumber(amount) || (_.isNumber(amount) && amount < 0)) {
      throw new Error('amount must be a number greater than 0.');
    }
    this.amount = amount;
  }
}
