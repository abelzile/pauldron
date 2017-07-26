import Component from '../component';
import Vector from '../vector';

export default class ProjectileAttackComponent extends Component {
  constructor(attackHitColors) {
    super();

    this.shooterEntityId = '';
    this.startPosition = new Vector();
    this.endPosition = new Vector();
    this.angle = 0;
    this.attackHitColors = attackHitColors;
  }

  init(shooterEntityId, startPosition, endPosition, angle = 0) {
    this.shooterEntityId = shooterEntityId;
    this.startPosition.setFrom(startPosition);
    this.endPosition.setFrom(endPosition);
    this.angle = angle;
  }

  clone() {
    return new ProjectileAttackComponent(this.attackHitColors);
  }
}
