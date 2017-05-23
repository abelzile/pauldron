import * as _ from 'lodash';
import Component from '../component';

export default class TierComponent extends Component {
  constructor(tier) {
    super();

    if (!(_.isNumber(tier) && tier >= 0)) {
      throw new Error('tier must be a number >= 0.');
    }

    this.tier = tier;
  }
}
