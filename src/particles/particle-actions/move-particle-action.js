import ParticleAction from './particle-action';

export default class MoveParticleAction extends ParticleAction {

  constructor() {
    super();
  }

  update(emitter, particle, delta) {
    particle.position.x += particle.velocity.x;
    particle.position.y += particle.velocity.y;
  }

}
