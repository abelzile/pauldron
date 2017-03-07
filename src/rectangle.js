import * as _ from 'lodash';
import * as ObjectUtils from './utils/object-utils';
import Line from './line';
import Vector from './vector';

export default class Rectangle {

  constructor(x = 0, y = 0, width = 1, height = 1) {

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this._sides = [ new Line(), new Line(), new Line(), new Line() ];

  }

  get top() { return this.y; }
  set top(value) { this.y = value; }

  get left() { return this.x; }
  set left(value) { this.x = value; }

  get bottom() { return this.y + this.height; }

  get right() { return this.x + this.width; }

  get sides() {

    this._sides[0].point1.x = this.x;
    this._sides[0].point1.y = this.y;
    this._sides[0].point2.x = this.right;
    this._sides[0].point2.y = this.y;

    this._sides[1].point1.x = this.right;
    this._sides[1].point1.y = this.y;
    this._sides[1].point2.x = this.right;
    this._sides[1].point2.y = this.bottom;

    this._sides[2].point1.x = this.right;
    this._sides[2].point1.y = this.bottom;
    this._sides[2].point2.x = this.x;
    this._sides[2].point2.y = this.bottom;

    this._sides[3].point1.x = this.x;
    this._sides[3].point1.y = this.bottom;
    this._sides[3].point2.x = this.x;
    this._sides[3].point2.y = this.y;

    return this._sides;

  }

  get area() { return this.width * this.height; }

  intersectsWith(geoObj) {

    const typeName = ObjectUtils.getTypeName(geoObj);

    switch (typeName) {

      case 'Rectangle':
      {
        let l = geoObj.left;
        let w = geoObj.width;
        let t = geoObj.top;
        let h = geoObj.height;

        if (l < this.x + this.width && this.x < l + w && t < this.y + this.height) {
          return this.y < t + h;
        }

        return false;
      }
      case 'Line':
      {
        return _.some(this.sides, (sideLine) => sideLine.intersectsWith(geoObj));
      }
      case 'Point':
      case 'Vector':
      {
        let x = geoObj.x;
        let y = geoObj.y;

        return this.x <= x && x < this.x + this.width && this.y <= y && y < this.y + this.height;
      }
      default:
      {
        throw new Error('Unknown object type. intersectWith accepts a Rectangle, Line or Point object.');
      }

    }

  }

  static intersection(a, b) {

    const x1 = Math.max(a.x, b.x);
    const x2 = Math.min(a.x + a.width, b.x + b.width);
    const y1 = Math.max(a.y, b.y);
    const y2 = Math.min(a.y + a.height, b.y + b.height);

    if (x2 >= x1 && y2 >= y1) {
      return new Rectangle(x1, y1, x2 - x1, y2 - y1);
    }
    return null;

  }

  getOffsetBy(point) {
    return Rectangle.offsetBy(this, point);
  }

  static offsetBy(rect, point) {

    const newRect = rect.clone();
    newRect.x += point.x;
    newRect.y += point.y;

    return newRect;

  }

  getCenter() {
    return new Vector(this.x + this.width / 2.0, this.y + this.height / 2.0);
  }

  getDiagonalLength() {
    return Math.sqrt(this.width * this.width + this.height * this.height);
  }

  inflate2(amount) {
    this.x -= amount;
    this.y -= amount;
    this.width += (2 * amount);
    this.height += (2 * amount);
  }

  clone() {
    return new Rectangle(this.x, this.y, this.width, this.height);
  }

  toString() {
    return `{ x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height}}`;
  }

  static inflate(rect, amount) {
    return new Rectangle(
      rect.x - amount,
      rect.y - amount,
      rect.width + (2 * amount),
      rect.height + (2 * amount)
    );
  }

  static fromPixiRect(pixiRect) {
    return new Rectangle(pixiRect.x, pixiRect.y, pixiRect.width, pixiRect.height);
  }

  static equals(r1, r2) {

    if (!r1) { return false; }
    if (!r2) { return false; }

    return r1.x === r2.x &&
           r1.y === r2.y &&
           r1.width === r2.width &&
           r1.height === r2.height

  }

}
