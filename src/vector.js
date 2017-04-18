import Poolable from './poolable';

export default class Vector extends Poolable {
  constructor(x = 0, y = 0) {
    super();
    this.x = x;
    this.y = y;
  }

  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  get angle() {
    return Math.atan2(this.y, this.x);
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setFrom(point) {
    this.x = point.x;
    this.y = point.y;
    return this;
  }

  zero() {
    this.x = 0;
    this.y = 0;
    return this;
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  multiply(value) {
    this.x *= value;
    this.y *= value;
    return this;
  }

  divide(value) {
    this.x /= value;
    this.y /= value;
    return this;
  }

  equals(vector) {
    return this.x === vector.x && this.y === vector.y;
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  toString() {
    return `{ x:${this.x},y:${this.y} }`;
  }

  static distanceSquared(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return dx * dx + dy * dy;
  }

  static distance(point1, point2) {
    return Math.sqrt(Vector.distanceSquared(point1, point2));
  }

  static fromAngle(angle, magnitude) {
    return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
  }
}
