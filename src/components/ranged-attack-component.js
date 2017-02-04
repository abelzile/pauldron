import Component from '../component';

export default class RangedAttackComponent extends Component {

  constructor(angle = 0) {
    super();
    this.angle = angle;
  }

  clone() {
    return new RangedAttackComponent(this.angle);
  }

}