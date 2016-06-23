import Component from '../component';
import Point from '../point';

export default class ProjectileAttackComponent extends Component {

  constructor(shooterEntityId = '',
              startPosition = new Point(),
              endPosition = new Point(),
              range = 0,
              damage = 0,
              knockBackDuration = 0) {

    super();

    this.shooterEntityId = shooterEntityId;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.range = range;
    this.angle = 0;
    this.damage = 0;
    this.knockBackDuration = 0;

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
    return new ProjectileAttackComponent(this.shooterEntityId,
                                         this.startPosition.clone(),
                                         this.endPosition.clone(),
                                         this.range,
                                         this.damage);
  }

  _calculateAngle() {
    this.angle = Math.atan2(this.endPosition.y - this.startPosition.y,
                             this.endPosition.x - this.startPosition.x);
  }

}
