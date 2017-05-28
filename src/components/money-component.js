import Component from '../component';

export default class MoneyComponent extends Component {
  constructor(amount = 0) {
    super();
    this.amount = amount;
  }

  clone() {
    return new MoneyComponent(this.amount);
  }
}