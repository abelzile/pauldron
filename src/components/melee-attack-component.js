import * as ArrayUtils from '../utils/array-utils';
import * as Pixi from 'pixi.js';
import AttackHit from '../attack-hit';
import Component from '../component';
import Line from '../line';
import Vector from '../vector';

export default class MeleeAttackComponent extends Component {
  constructor(attackHitColors) {
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
    this.attackHitColors = attackHitColors;
    this.debugGraphics = new Pixi.Graphics();
    this.reset();
  }

  get hasRemainingAttack() {
    return this.remainingTime > 0;
  }

  init(origin, position, length, attackArc, remainingTime) {
    throw new Error('init() must be overridden.')
  }

  update() {
    throw new Error('update() must be overridden.')
  }

  adjustPositionBy(xDiff, yDiff) {
    this.origin.x += xDiff;
    this.origin.y += yDiff;
    this.position.x += xDiff;
    this.position.y += yDiff;

    ArrayUtils.clear(this.lines);

    this.init(this.origin, this.position, this.length, this.attackArcAngle, this.remainingTime);
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
    const intersections = rect.sides
      .map(side => {
        const intersection = Line.lineIntersection(center, this.origin, side.point1, side.point2);
        if (intersection) {
          return intersection;
        }
      })
      .filter(x => !!x);

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
    this.totalTime = 0;
    this.attackMainAngle = 0;
    this.attackMainLine.zero();
    this.attackArcAngle = 0;
    this.firstLineAngle = 0;
    this.lastLineAngle = 0;

    ArrayUtils.clear(this.lines);
    ArrayUtils.clear(this.attackHits);

    this.graphics.clear();
    this.debugGraphics.clear();
  }

  containsHitEntityId(id) {
    return !!this.findHitEntityObj(id);
  }

  findHitEntityObj(id) {
    for (const hit of this.attackHits) {
      if (hit.entityId === id) {
        return hit;
      }
    }
    return null;
  }

  clone() {
    throw new Error('clone() must be overridden.');
  }
}
