import Component from '../component';
import Vector from '../vector';

export default class ProjectileAttackComponent extends Component {
  constructor(colors) {
    super();

    this.shooterEntityId = '';
    this.startPosition = new Vector();
    this.endPosition = new Vector();
    this.angle = 0;
    this.colors = colors;

    this._calculateAngle();
  }

  init(shooterEntityId, startPosition, endPosition) {
    this.shooterEntityId = shooterEntityId;
    this.startPosition.setFrom(startPosition);
    this.endPosition.setFrom(endPosition);

    this._calculateAngle();
  }

  clone() {
    return new ProjectileAttackComponent(this.colors);
  }

  _calculateAngle() {
    this.angle = Math.atan2(this.endPosition.y - this.startPosition.y, this.endPosition.x - this.startPosition.x);
  }
}
