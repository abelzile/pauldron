import ParticleAction from './particle-action';

export default class AgeParticleAction extends ParticleAction {

  constructor() {
    super();
  }

  update(emitter, particle, delta) {

    particle.age += delta;

    if (particle.age >= particle.lifetime) {
      particle.deleted = true;
    }

  }

}
