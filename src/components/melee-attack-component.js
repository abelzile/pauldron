import Pixi from 'pixi.js';
import _ from 'lodash';
import Component from '../component';
import Point from '../point';
import Line from '../line';
import AttackHit from '../attack-hit';
import * as ArrayUtils from '../utils/array-utils';
import * as Const from '../const';


export default class MeleeAttackComponent extends Component {

  constructor() {

    super();

    this._origin = new Point();
    this._position = new Point();
    this._length = 0;
    this._remainingTime = 0;
    this._damage = 0;

    this._attackMainAngle = 0;
    this._attackMainLine = new Line();

    this._attackArcAngle = 0;

    this._firstLineAngle = 0;

    this._lines = [];

    this._attackHits = [];

    this._graphics = new Pixi.Graphics();

    this.reset();

  }

  get origin() { return this._origin; }

  get position() { return this._position; }

  get remainingTime() { return this._remainingTime; }

  get graphics() { return this._graphics; }

  get attackMainLine() { return this._attackMainLine; }

  get lines() { return this._lines; }

  get attackHits() { return this._attackHits; }

  get hasRemainingAttack() { return this._remainingTime > 0; }

  get damage() { return this._damage; }

  setAttack(origin, position, length, attackArc, remainingTime, damage) {

    this._origin.x = origin.x;
    this._origin.y = origin.y;
    this._position.x = position.x;
    this._position.y = position.y;
    this._length = length;
    this._remainingTime = remainingTime;
    this._damage = damage;

    this._attackMainAngle = Math.atan2(this._position.y - this._origin.y, this._position.x - this._origin.x);
    this._attackMainLine.point1.x = this._origin.x;
    this._attackMainLine.point1.y = this._origin.y;
    this._attackMainLine.point2.x = this._origin.x + this._length * Math.cos(this._attackMainAngle);
    this._attackMainLine.point2.y = this._origin.y + this._length * Math.sin(this._attackMainAngle);

    this._attackArcAngle = attackArc;

    this._firstLineAngle = this._attackMainAngle - (this._attackArcAngle / 2);

    let divisions = this._getAttackDivisions();
    let angleChunk = this._attackArcAngle / divisions;
    let curAngleChunk = this._firstLineAngle;

    for (let i = 0; i <= divisions; ++i) {

      this._lines.push(
        new Line(
          this._origin.x,
          this._origin.y,
          this._origin.x + this._length * Math.cos(curAngleChunk),
          this._origin.y + this._length * Math.sin(curAngleChunk)
        )
      );

      curAngleChunk += angleChunk;

    }

    this._graphics.clear();

  }

  decrementBy(time) {

    if (this._remainingTime > 0.0) {

      this._remainingTime -= time;

      if (this._remainingTime <= 0.0) {
        this.reset();
      }

    }

  }

  addHit(entityId, angle) {
    this._attackHits.push(new AttackHit(entityId, angle));
  }

  reset() {

    this._origin.zero();
    this._position.zero();
    this._length = 0;
    this._remainingTime = 0;

    this._attackMainAngle = 0;
    this._attackMainLine.zero();

    this._attackArcAngle = 0;

    this._firstLineAngle = 0;

    ArrayUtils.clear(this._lines);
    ArrayUtils.clear(this._attackHits);

    this._graphics.clear();

  }

  containsHitEntityId(id) {
    return _.some(this._attackHits, {entityId: id});
  }

  findHitEntityObj(id) {
    return _.find(this._attackHits, (hitObj) => hitObj.entityId === id);
  }

  clone() {
    return new MeleeAttackComponent();
  }

  _getAttackDivisions() {

    if (this._attackArcAngle > 0 && this._attackArcAngle <= Const.RadiansOf45Degrees) {
      return 5;
    }

    if (this._attackArcAngle > Const.RadiansOf45Degrees && this._attackArcAngle <= Const.RadiansOf90Degrees) {
      return 10;
    }

    if (this._attackArcAngle > Const.RadiansOf90Degrees && this._attackArcAngle <= Const.RadiansOf180Degrees) {
      return 20;
    }

    if (this._attackArcAngle > Const.RadiansOf180Degrees && this._attackArcAngle <= Const.RadiansOf270Degrees) {
      return 30;
    }

    if (this._attackArcAngle > Const.RadiansOf270Degrees && this._attackArcAngle <= Const.RadiansOf360Degrees) {
      return 40;
    }

    return 50;

  }

}
