import * as EntityFinders from '../entity-finders';
import System from '../system';
import * as _ from 'lodash';


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

    //TODO: consider entitySpatialGrid. Would require adding all entities with emitters to grid.
    //const hero = this._entityManager.heroEntity;
    //const adjacEnts = this._entityManager.entitySpatialGrid.getAdjacentEntities(hero);

    /*const ents = EntityFinders.findParticleEmitters(entities);

    for (let i = 0; i < ents.length; ++i) {

      const ent = ents[i];

      const animatedSprites = ent.getAll('AnimatedSpriteComponent');
      const emitters = ent.getAll('ParticleEmitterComponent');
      const currentFrames = [];

      this._getCurrentFrames(animatedSprites, currentFrames);

      for (let j = 0; j < emitters.length; ++j) {

        const emitter = emitters[j];

        let active = true;

        if (emitter.activeFrames && emitter.activeFrames.length) {
          const common = _.intersection(emitter.activeFrames, currentFrames);
          active = common && common.length > 0;
        }

        if (active) {
          this._addParticles(emitter);
        }
        this._moveParticles(emitter);
        this._fadeParticles(emitter);
        this._ageParticles(gameTime, emitter);

      }

    }
    */
  }

  _getCurrentFrames(animatedSprites, outCurrentFrames) {

    for (let i = 0; i < animatedSprites.length; ++i) {

      const animatedSprite = animatedSprites[i];
      if (animatedSprite.visible) {
        outCurrentFrames.push(animatedSprite.id)
      }

    }

  }

  _addParticles(emitter) {

    for (let i = 0; i < emitter.emissionRate; ++i) {
      emitter.tryAddParticle();
    }

  }

  _moveParticles(emitter) {

    if (!emitter.moving) {
      return;
    }

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

    if (!emitter.fadeOutAlpha) {
      return;
    }

    for (let i = 0; i < emitter.particles.length; ++i) {

      const particle = emitter.particles[i];
      particle.sprite.alpha = emitter.alpha - ((particle.age / emitter.maxParticleAge) * emitter.alpha);

    }

  }

}