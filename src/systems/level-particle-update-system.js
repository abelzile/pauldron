import * as EntityFinders from '../entity-finders';
import System from '../system';


export default class LevelParticleUpdateSystem extends System {

  constructor(renderer, entityManager) {

    super();

    this._renderer = renderer;
    this._entityManager = entityManager;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
  }

  processEntities(gameTime, entities) {

    const ents = EntityFinders.findParticleEmitters(entities);

    for (let i = 0; i < ents.length; ++i) {

      const ent = ents[i];

      const emitters = ent.getAll('ParticleEmitterComponent');

      for (let j = 0; j < emitters.length; ++j) {

        const emitter = emitters[j];

        this._addParticles(emitter);
        this._moveParticles(emitter);
        this._fadeParticles(emitter);
        this._ageParticles(gameTime, emitter);

      }

    }

  }

  _addParticles(emitter) {

    for (let i = 0; i < emitter.emissionRate; ++i) {
      emitter.tryAddParticle();
    }

  }

  _moveParticles(emitter) {

    if (!emitter.moving) { return; }

    for (let i = 0; i < emitter.particles.length; ++i) {
      emitter.particles[i].move();
    }

  }

  _ageParticles(gameTime, emitter) {

    for (let i = 0; i < emitter.particles.length; ++i) {

      const particle = emitter.particles[i];

      particle.age += gameTime;

      if (particle.age >= emitter.maxParticleAge) {
        particle.deleted = true;
      }

    }

  }

  _fadeParticles(emitter) {

    if (!emitter.fadeOutAlpha) { return; }

    for (let i = 0; i < emitter.particles.length; ++i) {

      const particle = emitter.particles[i];
      particle.sprite.alpha = 1 - (particle.age / emitter.maxParticleAge);

    }

  }

}