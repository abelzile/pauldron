import Circle from '../../circle';
import Vector from '../../vector';
import Zone from './zone';

export default class DiscZone extends Zone {
  constructor(origin = new Vector(), radius = 1) {
    super();
    this.origin = origin;
    this.radius = radius;
  }

  getRandomPoint(isUniform = true) {
    return Circle.randomPointWithin(this.origin, this.radius, isUniform);
  }
}
