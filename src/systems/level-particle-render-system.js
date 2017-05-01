import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntityUtils from '../utils/entity-utils';
import * as ScreenUtils from '../utils/screen-utils';
import ParticleEmitterComponent from '../components/particle-emitter-component';
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
        this._wireUpEmitter(emitterComps[i]);
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

  unload(entities) {
    this._entityManager.off('add', this._emitterSubscribe).off('remove', this._emitterUnsubscribe);
  }

  processEntities(gameTime, entities) {
    const ents = EntityFinders.findParticleEmitters(entities);
    const topLeftPos = this._entityManager.currentLevelEntity.get('TileMapComponent').topLeftPos;

    for (let i = 0; i < ents.length; ++i) {
      this._updateEmittersAndParticles(ents[i].getAll('ParticleEmitterComponent'), gameTime, topLeftPos);
    }

    this._cleanupParticleHolder();
  }

  showAttackHit(attack, point) {
    this._addParticleEmitterComponent(
      this._entityManager.particleEmitterFactory.buildAttackHitEmitter(attack.colors),
      point
    );
  }

  showMobDeath(mob) {
    const positionedBoundingRect = EntityUtils.getPositionedBoundingRect(mob);
    this._addParticleEmitterComponent(
      this._entityManager.particleEmitterFactory.buildMobDeathEmitter(
        Math.max(positionedBoundingRect.width, positionedBoundingRect.height)
      ),
      positionedBoundingRect.getCenter()
    );
  }

  showContainerOpen(container) {
    this._addParticleEmitterComponent(
      this._entityManager.particleEmitterFactory.buildContainerOpenEmitter(),
      EntityUtils.getPositionedBoundingRect(container).getCenter()
    );
  }

  showLoot(loot) {
    this._addParticleEmitterComponent(
      this._entityManager.particleEmitterFactory.buildShowLootEmitter(),
      EntityUtils.getPositionedBoundingRect(loot).getCenter()
    );
  }

  _addParticleEmitterComponent(emitter, point) {
    const particleEmitterComponent = new ParticleEmitterComponent(emitter);
    this._wireUpEmitter(particleEmitterComponent);
    this._particleHolderEntity.add(particleEmitterComponent);
    emitter.x = point.x;
    emitter.y = point.y;
    emitter.start();
  }

  _updateEmittersAndParticles(emitters, gameTime, topLeftPos) {
    for (let i = 0; i < emitters.length; ++i) {
      const emitter = emitters[i].emitter;
      emitter.update(gameTime);
      this._positionParticles(emitter, topLeftPos);
    }
  }

  _positionParticles(emitter, topLeftPos) {
    for (let i = 0; i < emitter.particles.length; ++i) {
      const particle = emitter.particles[i];
      const newPos = ScreenUtils.translateWorldPositionToScreenPosition(particle.position, topLeftPos);
      particle.sprite.position.set(newPos.x / Const.ScreenScale, newPos.y / Const.ScreenScale);
    }
  }

  _cleanupParticleHolder() {
    const holder = this._particleHolderEntity;
    const emitterComps = holder.getAll('ParticleEmitterComponent');

    for (let i = 0; i < emitterComps.length; ++i) {
      const emitterComp = emitterComps[i];

      if (emitterComp.emitter.hasParticles) {
        continue;
      }

      emitterComp.emitter.stop();
      emitterComp.emitter.removeAllListeners();
      holder.remove(emitterComp);
    }
  }

  _wireUpEmitter(emitterComp) {
    emitterComp &&
      emitterComp.emitter.on('create-particle', this._particleCreated).on('remove-particle', this._particleRemoved);
  }
}
