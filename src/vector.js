export default class Vector {

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }

  zero() {
    this.x = 0;
    this.y = 0;
  }

  multiplyBy(value) {
    this.x *= value;
    this.y *= value;
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

}
