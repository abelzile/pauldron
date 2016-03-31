export default class AttackHit {

  constructor(entityId, hitAngle) {

    this._entityId = entityId;
    this._hitAngle = hitAngle;
    this._hasBeenProcessed = false;

  }

  get entityId() { return this._entityId; }

  get hitAngle() { return this._hitAngle; }

  get hasBeenProcessed() { return this._hasBeenProcessed; }
  set hasBeenProcessed(value) { this._hasBeenProcessed = value; }

}
