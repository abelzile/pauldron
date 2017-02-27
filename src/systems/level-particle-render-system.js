import * as _ from 'lodash';
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

    this._particleCreated = particle => this._pixiContainer.addChild(particle.sprite);
    this._particleRemoved = particle => this._pixiContainer.removeChild(particle.sprite);

    this._emitterSubscribe = entity => _.forEach(entity.getAll('ParticleEmitterComponent'), comp => {
      const emitter = comp.emitter;
      emitter.on('create-particle', this._particleCreated);
      emitter.on('remove-particle', this._particleRemoved);
    });

    this._emitterUnsubscribe = entity =>
      _.forEach(entity.getAll('ParticleEmitterComponent'), comp => comp.emitter.removeAllListeners());

    this._entityManager
      .on('add', this._emitterSubscribe)
      .on('remove', this._emitterUnsubscribe);

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    _.forEach(entities, this._emitterSubscribe);
  }

  unload(entities) {}

  processEntities(gameTime, entities) {

    const ents = EntityFinders.findParticleEmitters(entities);
    const topLeftPos = this._entityManager.currentLevelEntity.get('TileMapComponent').topLeftPos;

    for (let i = 0; i < ents.length; ++i) {

      const entity = ents[i];
      const emitters = entity.getAll('ParticleEmitterComponent');

      for (let j = 0; j < emitters.length; ++j) {
        const emitter = emitters[j].emitter;
        emitter.update(gameTime);
        this._positionParticles(emitter, topLeftPos);
      }

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

}
