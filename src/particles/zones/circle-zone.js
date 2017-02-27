import Zone from './zone';
import * as Const from '../../const';
import Vector from '../../vector';

export default class CircleZone extends Zone {

  constructor(origin = new Vector(), radius = 1) {
    super();
    this.origin = origin;
    this.radius = radius;
  }

  getRandomPoint(isUniform = true) {

    //See http://gamedev.stackexchange.com/questions/26713/calculate-random-points-pixel-within-a-circle-image

    if (this.radius === 0) {
      return this.origin.clone();
    }

    const angle = Math.random() * Const.Radians2Pi;
    const r = (isUniform ? Math.sqrt(Math.random()) : Math.random()) * this.radius;

    return new Vector(
      this.origin.x + r * Math.cos(angle),
      this.origin.y + r * Math.sin(angle)
    );

  }

}
