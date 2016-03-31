import Component from '../component';
import Point from '../point';

export default class ProjectileAttackComponent extends Component {

  constructor(shooterEntityId = '',
              startPosition = new Point(),
              endPosition = new Point(),
              range = 0,
              damage = 0) {

    super();

    this._shooterEntityId = shooterEntityId;
    this._startPosition = startPosition;
    this._endPosition = endPosition;
    this._range = range;
    this._angle = 0;
    this._damage = 0;

    this._calculateAngle();

  }

  get shooterEntityId() { return this._shooterEntityId; }

  get startPosition() { return this._startPosition; }

  get endPosition() { return this._endPosition; }

  get angle() { return this._angle; }

  get range() { return this._range; }

  get damage() { return this._damage; }

  set(shooterEntityId, startPosition, endPosition, range, damage) {

    this._shooterEntityId = shooterEntityId;
    this._startPosition.setFrom(startPosition);
    this._endPosition.setFrom(endPosition);
    this._range = range;
    this._damage = damage;

    this._calculateAngle();

  }

  clone() {
    return new ProjectileAttackComponent(this._shooterEntityId,
                                         this._startPosition.clone(),
                                         this._endPosition.clone(),
                                         this._range,
                                         this._damage);
  }

  _calculateAngle() {
    this._angle = Math.atan2(this._endPosition.y - this._startPosition.y,
                             this._endPosition.x - this._startPosition.x);
  }

}
