import Vector from '../../vector';
import Zone from './zone';

export default class CircleZone extends Zone {
  constructor(origin = new Vector(), radius = 1) {
    super();
    this.origin = origin;
    this.radius = radius;
  }

  getRandomPoint() {
    const angle = Math.random() * Math.PI * 2;
    return new Vector(Math.cos(angle) * this.radius, Math.sin(angle) * this.radius);
  }
}
