import ParticleAction from './particle-action';

export default class RotateToDirectionParticleAction extends ParticleAction {
  constructor() {
    super();
  }

  update(emitter, particle, time) {
    particle.rotation = Math.atan2(particle.velocity.y, particle.velocity.x);
  }
}
