import ParticleAction from './particle-action';
import Vector from '../../vector';

export default class AccelerationParticleAction extends ParticleAction {
  constructor(x, y) {
    super();
    this.acceleration = new Vector(x, y);
  }

  update(emitter, particle, delta) {
    particle.velocity.x += this.acceleration.x;
    particle.velocity.y += this.acceleration.y;
  }
}
