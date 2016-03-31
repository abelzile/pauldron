export default class Vector {

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

  zero() {
    this._x = 0;
    this._y = 0;
  }

  multiplyBy(value) {
    this._x *= value;
    this._y *= value;
  }

  clone() {
    return new Vector(this._x, this._y);
  }

}
