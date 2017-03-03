import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as ScreenUtils from '../utils/screen-utils';
import System from '../system';

export default class LevelParticleRenderSystem extends System {
  constructor(pixiContainer, renderer, entityManager) {
    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;
    this._particleHolderEntity = null;

    this._particleCreated = particle => this._pixiContainer.addChild(particle.sprite);
    this._particleRemoved = particle => this._pixiContainer.removeChild(particle.sprite);

    this._emitterSubscribe = entity => {
      const emitterComps = entity.getAll('ParticleEmitterComponent');

      for (let i = 0; i < emitterComps.length; ++i) {
        const emitter = emitterComps[i].emitter;
        emitter.on('create-particle', this._particleCreated);
        emitter.on('remove-particle', this._particleRemoved);
      }
    };

    this._emitterUnsubscribe = entity => {
      const emitterComps = entity.getAll('ParticleEmitterComponent');
      for (let i = 0; i < emitterComps.length; ++i) {
        emitterComps[i].emitter.removeAllListeners();
      }
    };

    this._entityManager.on('add', this._emitterSubscribe).on('remove', this._emitterUnsubscribe);
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    for (let i = 0; i < entities.length; ++i) {
      this._emitterSubscribe(entities[i]);
    }
    this._particleHolderEntity = EntityFinders.findById(entities, Const.EntityId.DeletedEntityEmitterHolder);
  }

  unload(entities) {}

  processEntities(gameTime, entities) {
    const ents = EntityFinders.findParticleEmitters(entities);
    const topLeftPos = this._entityManager.currentLevelEntity.get('TileMapComponent').topLeftPos;

    for (let i = 0; i < ents.length; ++i) {
      this._updateEmittersAndParticles(ents[i].getAll('ParticleEmitterComponent'), gameTime, topLeftPos);
    }

    this._cleanupParticleHolder();
  }

  _updateEmittersAndParticles(emitters, gameTime, topLeftPos) {
    for (let j = 0; j < emitters.length; ++j) {
      const emitter = emitters[j].emitter;
      emitter.update(gameTime);
      this._positionParticles(emitter, topLeftPos);
    }
  }

  _positionParticles(emitter, topLeftPos) {
    for (let i = 0; i < emitter.particles.length; ++i) {
      const particle = emitter.particles[i];
      const newPos = ScreenUtils.translateWorldPositionToScreenPosition(particle.position, topLeftPos);
      const sprite = particle.sprite;
      sprite.position.x = newPos.x / Const.ScreenScale;
      sprite.position.y = newPos.y / Const.ScreenScale;
    }
  }

  _cleanupParticleHolder() {
    const holder = this._particleHolderEntity;
    const emitterComps = holder.getAll('ParticleEmitterComponent');

    if (emitterComps.length === 0) {
      return;
    }

    for (let i = 0; i < emitterComps.length; ++i) {
      const emitterComp = emitterComps[i];

      if (emitterComp.emitter.hasParticles) {
        continue;
      }

      emitterComp.emitter.stop();
      holder.remove(emitterComp);
    }
  }
}
