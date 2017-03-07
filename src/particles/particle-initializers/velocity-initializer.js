import Initializer from './initializer';

export default class VelocityInitializer extends Initializer {

  constructor(zone) {
    super();
    this.zone = zone;
  }

  initialize(emitter, particle) {

    const point = this.zone.getRandomPoint();

    if (particle.rotation === 0) {

      particle.velocity.x = point.x;
      particle.velocity.y = point.y;

    } else {

      const sin = Math.sin(particle.rotation);
      const cos = Math.cos(particle.rotation);
      particle.velocity.x = cos * point.x - sin * point.y;
      particle.velocity.y = cos * point.y + sin * point.x;

    }

  }

}
