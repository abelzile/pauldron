import * as _ from 'lodash';
import * as Const from './const';
import Poolable from './poolable';
import Vector from './vector';

export default class Circle extends Poolable {
  constructor(origin = new Vector(), radius = 1) {
    super();
    this.pinitialize(origin, radius);
  }

  pinitialize(origin = new Vector(), radius = 1) {
    this.origin = origin;
    this.radius = radius;
  }

  randomPointWithin(isUniform = true) {
    return Circle.randomPointWithin(this.origin, this.radius, isUniform);
  }

  randomPointOnCircumfrence() {
    return Circle.randomPointOnCircumfrence(this.origin, this.radius);
  }

  static randomPointWithin(origin, radius, isUniform = true) {
    //See http://gamedev.stackexchange.com/questions/26713/calculate-random-points-pixel-within-a-circle-image

    if (radius === 0) {
      return origin.clone();
    }

    const angle = Math.random() * Const.Radians2Pi;
    const r = (isUniform ? Math.sqrt(Math.random()) : Math.random()) * radius;

    return new Vector(origin.x + r * Math.cos(angle), origin.y + r * Math.sin(angle));
  }

  static randomPointOnCircumfrence(origin, radius) {
    const angle = _.random(0, Const.Radians2Pi, true);
    return new Vector(origin.x + radius * Math.cos(angle), origin.y + radius * Math.sin(angle));
  }
}
