import * as MathUtils from '../utils/math-utils';
import Line from '../line';
import MeleeAttackComponent from './melee-attack-component';
import * as PixiExtraFilters from 'pixi-extra-filters';

export default class SlashAttackComponent extends MeleeAttackComponent {
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

    this.graphics.clear();
    this.graphics.filters = [new PixiExtraFilters.GlowFilter(15, 2, 0, 0xa1e4f7, 0.5)];
    this.debugGraphics.clear();

    this.update();
  }

  update() {
    const attackPercent = 1.0 - this.remainingTime / this.totalTime;
    let currentAttackAngle;

    if (Math.PI / 2 <= this.attackMainAngle && this.attackMainAngle < 3 * Math.PI / 2) {
      currentAttackAngle = this.lastLineAngle - this.attackArcAngle * attackPercent;
    } else {
      currentAttackAngle = this.firstLineAngle + this.attackArcAngle * attackPercent;
    }

    this.lines.push(
      new Line(
        this.origin.x,
        this.origin.y,
        this.origin.x + this.length * Math.cos(currentAttackAngle),
        this.origin.y + this.length * Math.sin(currentAttackAngle)
      )
    );
  }

  clone() {
    return new SlashAttackComponent(this.attackHitColors);
  }
}
