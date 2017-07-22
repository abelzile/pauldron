import Component from '../component';

export default class RangedAttackComponent extends Component {
  constructor(angle = 0) {
    super();
    this.angle = angle;
  }

  setAngle(startPosition, endPosition) {
    this.angle = Math.atan2(endPosition.y - startPosition.y, endPosition.x - startPosition.x);
  }

  clone() {
    return new RangedAttackComponent(this.angle);
  }
}
