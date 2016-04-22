export default class Point {

  constructor(x = 0, y = 0) {
    this._x = x;
    this._y = y;
  }

  get x() { return this._x; }
  set x(value) { this._x = value; }

  get y() { return this._y; }
  set y(value) { this._y = value; }

  set(x, y) {
    this._x = x;
    this._y = y;
  }

  setFrom(point) {
    this._x = point.x;
    this._y = point.y;
  }

  zero() {
    this._x = 0;
    this._y = 0;
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
    return `{ x:${this._x},y:${this._y} }`;
  }

}
