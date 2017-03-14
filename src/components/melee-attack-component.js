import * as _ from 'lodash';
import * as ArrayUtils from '../utils/array-utils';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import AttackHit from '../attack-hit';
import Component from '../component';
import Line from '../line';
import Vector from '../vector';

export default class MeleeAttackComponent extends Component {
  constructor(colors) {
    super();

    this.origin = new Vector();
    this.position = new Vector();
    this.length = 0;
    this.remainingTime = 0;
    this.attackMainAngle = 0;
    this.attackMainLine = new Line();
    this.attackArcAngle = 0;
    this.firstLineAngle = 0;
    this.lines = [];
    this.attackHits = [];
    this.graphics = new Pixi.Graphics();
    this.colors = colors;

    this.reset();
  }

  get hasRemainingAttack() {
    return this.remainingTime > 0;
  }

  init(origin, position, length, attackArc, remainingTime) {
    this.origin.x = origin.x;
    this.origin.y = origin.y;
    this.position.x = position.x;
    this.position.y = position.y;
    this.length = length;
    this.attackArcAngle = attackArc;
    this.remainingTime = remainingTime;

    this.attackMainAngle = Math.atan2(this.position.y - this.origin.y, this.position.x - this.origin.x);
    this.attackMainLine.point1.x = this.origin.x;
    this.attackMainLine.point1.y = this.origin.y;
    this.attackMainLine.point2.x = this.origin.x + this.length * Math.cos(this.attackMainAngle);
    this.attackMainLine.point2.y = this.origin.y + this.length * Math.sin(this.attackMainAngle);

    this.firstLineAngle = this.attackMainAngle - this.attackArcAngle / 2;

    let divisions = this._getAttackDivisions();
    let angleChunk = this.attackArcAngle / divisions;
    let curAngleChunk = this.firstLineAngle;

    for (let i = 0; i <= divisions; ++i) {
      this.lines.push(
        new Line(
          this.origin.x,
          this.origin.y,
          this.origin.x + this.length * Math.cos(curAngleChunk),
          this.origin.y + this.length * Math.sin(curAngleChunk)
        )
      );

      curAngleChunk += angleChunk;
    }

    this.graphics.clear();
  }

  adjustPositionBy(xDiff, yDiff) {
    this.origin.x += xDiff;
    this.origin.y += yDiff;
    this.position.x += xDiff;
    this.position.y += yDiff;

    ArrayUtils.clear(this.lines);

    this.init(
      this.origin,
      this.position,
      this.length,
      this.attackArcAngle,
      this.remainingTime
    );
  }

  decrementBy(time) {
    if (this.remainingTime > 0.0) {
      this.remainingTime -= time;
      if (this.remainingTime <= 0.0) {
        this.reset();
      }
    }
  }

  addHit(entityId, angle, rect) {
    this.attackHits.push(new AttackHit(entityId, angle));

    const center = rect.getCenter();
    const intersections = _.chain(rect.sides)
      .map(side => {
        const intersection = Line.lineIntersection(center, this.origin, side.point1, side.point2);
        if (intersection) {
          return intersection;
        }
      })
      .compact()
      .value();

    if (intersections.length > 0) {
      if (intersections.length === 1) {
        return intersections[0];
      } else {
        //TODO: find closest?
        return intersections[0];
      }
    }

    return center; // lines don't intersect because mob and attack are too overlapped
  }

  reset() {
    this.origin.zero();
    this.position.zero();
    this.length = 0;
    this.remainingTime = 0;
    this.attackMainAngle = 0;
    this.attackMainLine.zero();
    this.attackArcAngle = 0;
    this.firstLineAngle = 0;

    ArrayUtils.clear(this.lines);
    ArrayUtils.clear(this.attackHits);

    this.graphics.clear();
  }

  containsHitEntityId(id) {
    return !!this.findHitEntityObj(id);
  }

  findHitEntityObj(id) {
    for (let i = 0; i < this.attackHits.length; ++i) {
      const hitObj = this.attackHits[i];

      if (hitObj.entityId === id) {
        return hitObj;
      }
    }

    return null;
  }

  clone() {
    return new MeleeAttackComponent(this.colors);
  }

  _getAttackDivisions() {
    if (this.attackArcAngle > 0 && this.attackArcAngle <= Const.RadiansOf45Degrees) {
      return 5;
    }

    if (this.attackArcAngle > Const.RadiansOf45Degrees && this.attackArcAngle <= Const.RadiansOf90Degrees) {
      return 10;
    }

    if (this.attackArcAngle > Const.RadiansOf90Degrees && this.attackArcAngle <= Const.RadiansOf180Degrees) {
      return 20;
    }

    if (this.attackArcAngle > Const.RadiansOf180Degrees && this.attackArcAngle <= Const.RadiansOf270Degrees) {
      return 30;
    }

    if (this.attackArcAngle > Const.RadiansOf270Degrees && this.attackArcAngle <= Const.RadiansOf360Degrees) {
      return 40;
    }

    return 50;
  }
}
