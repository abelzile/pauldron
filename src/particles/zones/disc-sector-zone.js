import * as _ from 'lodash';
import Vector from '../../vector';
import Zone from './zone';

export default class DiscSectorZone extends Zone {
  constructor(radius = 1, minAngle = 0, maxAngle = 0) {
    super();
    this.origin = new Vector();
    this.radius = radius;
    this.minAngle = minAngle;
    this.maxAngle = maxAngle;
  }

  getRandomPoint(isUniform = true) {
    //See http://gamedev.stackexchange.com/questions/26713/calculate-random-points-pixel-within-a-circle-image

    if (this.radius === 0) {
      return this.origin.clone();
    }

    //const angle = Math.random() * Const.Radians2Pi;
    const angle = _.random(this.minAngle, this.maxAngle, true);
    const r = (isUniform ? Math.sqrt(Math.random()) : Math.random()) * this.radius;

    return new Vector(this.origin.x + r * Math.cos(angle), this.origin.y + r * Math.sin(angle));
  }
}
