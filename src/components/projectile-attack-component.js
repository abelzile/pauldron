import Component from '../component';
import Vector from '../vector';

export default class ProjectileAttackComponent extends Component {
  constructor(colors) {
    super();

    this.shooterEntityId = '';
    this.startPosition = new Vector();
    this.endPosition = new Vector();
    this.range = 0;
    this.damage = 0;
    this.knockBackDuration = 0;
    this.angle = 0;
    this.colors = colors;

    this._calculateAngle();
  }

  init(shooterEntityId, startPosition, endPosition, range, damage, knockBackDuration) {
    this.shooterEntityId = shooterEntityId;
    this.startPosition.setFrom(startPosition);
    this.endPosition.setFrom(endPosition);
    this.range = range;
    this.damage = damage;
    this.knockBackDuration = knockBackDuration;

    this._calculateAngle();
  }

  clone() {
    return new ProjectileAttackComponent(this.colors);
  }

  _calculateAngle() {
    this.angle = Math.atan2(this.endPosition.y - this.startPosition.y, this.endPosition.x - this.startPosition.x);
  }
}
