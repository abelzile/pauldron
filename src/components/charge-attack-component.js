import * as Const from '../const';
import * as MathUtils from '../utils/math-utils';
import Line from '../line';
import MeleeAttackComponent from './melee-attack-component';

export default class ChargeAttackComponent extends MeleeAttackComponent {
  constructor(attackHitColors) {
    super(attackHitColors);
  }

  init(origin, position, length, attackArc, remainingTime) {
    this.origin.x = origin.x;
    this.origin.y = origin.y;
    this.position.x = position.x;
    this.position.y = position.y;
    this.length = length;
    this.attackArcAngle = attackArc;
    this.remainingTime = remainingTime;
    this.totalTime = remainingTime;

    this.attackMainAngle = MathUtils.normalizeAngle(
      Math.atan2(this.position.y - this.origin.y, this.position.x - this.origin.x)
    );
    this.attackMainLine.point1.x = this.origin.x;
    this.attackMainLine.point1.y = this.origin.y;
    this.attackMainLine.point2.x = this.origin.x + this.length * Math.cos(this.attackMainAngle);
    this.attackMainLine.point2.y = this.origin.y + this.length * Math.sin(this.attackMainAngle);

    this.firstLineAngle = this.attackMainAngle - this.attackArcAngle / 2;
    this.lastLineAngle = this.attackMainAngle + this.attackArcAngle / 2;

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
    this.debugGraphics.clear();
  }

  update() {
    //noop
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
