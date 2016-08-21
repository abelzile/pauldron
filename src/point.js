export default class Point {

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }

  setFrom(point) {
    this.x = point.x;
    this.y = point.y;
  }

  divideBy(value) {
    this.x /= value;
    this.y /= value;

    return this;
  }

  zero() {
    this.x = 0;
    this.y = 0;

    return this;
  }

  clone() {
    return new Point(this._x, this._y);
  }

  static distanceSquared(point1, point2) {

    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;

    return dx * dx + dy * dy;

  }

  static distance(point1, point2) {

    return Math.sqrt(Point.distanceSquared(point1, point2));

  }

  toString() {
    return `{ x:${this.x},y:${this.y} }`;
  }

}
