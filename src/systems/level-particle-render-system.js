import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as ScreenUtils from '../utils/screen-utils';
import System from '../system';


export default class LevelParticleRenderSystem extends System{

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this._pixiContainer = pixiContainer;
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
    const topLeftPos = this._entityManager.currentLevelEntity.get('TileMapComponent').topLeftPos;

    for (let i = 0; i < ents.length; ++i) {

      const ent = ents[i];
      const emitters = ent.getAll('ParticleEmitterComponent');

      for (let j = 0; j < emitters.length; ++j) {

        const emitter = emitters[j];

        this._processParticles(emitter, topLeftPos);

      }

    }

  }

  _processParticles(emitter, topLeftPos) {

    for (let i = 0; i < emitter.particles.length; ++i) {

      const particle = emitter.particles[i];
      const sprite = particle.sprite;

      if (particle.deleted) {

        if (sprite.parent) {
          this._pixiContainer.removeChild(sprite);
        }

        continue;

      }

      if (!sprite.parent) {
        this._pixiContainer.addChild(sprite);
      }

      const newPos = ScreenUtils.translateWorldPositionToScreenPosition(particle.position, topLeftPos);

      sprite.position.x = newPos.x / Const.ScreenScale;
      sprite.position.y = newPos.y / Const.ScreenScale;

    }

  }

}