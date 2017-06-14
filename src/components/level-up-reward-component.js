import Component from '../component';

export default class LevelUpRewardComponent extends Component {
  constructor(statisticId, amount, modulo = 1) {
    super();
    this.statisticId = statisticId;
    this.amount = amount;
    this.modulo = modulo;
  }

  clone() {
    return new LevelUpRewardComponent(this.statisticId, this.amount, this.modulo);
  }
}
