import Poolable from './poolable';


export default class Vector extends Poolable {

  constructor(x = 0, y = 0) {

    super();

    this.x = x;
    this.y = y;

  }

  get magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }

  get angle() { return Math.atan2(this.y,this.x); }

  set(x, y) {
    this.x = x;
    this.y = y;
  }

  zero() {
    this.x = 0;
    this.y = 0;
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
  }

  multiply(value) {
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

  static fromAngle(angle, magnitude) {
    return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
  }

}
