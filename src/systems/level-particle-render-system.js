import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntityUtils from '../utils/entity-utils';
import * as ObjectUtils from '../utils/object-utils';
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

    this._emitterComponentSubscribe = (entity, component) => {
      if (ObjectUtils.getTypeName(component) === 'ParticleEmitterComponent') {
        this._wireUpEmitter(component);
      }
    };

    this._emitterComponentUnsubscribe = (entity, component) => {
      if (ObjectUtils.getTypeName(component) === 'ParticleEmitterComponent') {
        this._entityManager.moveParticleEmitterToHolder(entity, component);
      }
    };

    this._emitterEntitySubscribe = entity => {
      for (const emitterComp of entity.getAll('ParticleEmitterComponent')) {
        this._emitterComponentSubscribe(entity, emitterComp);
      }
    };

    this._emitterEntityUnsubscribe = entity => {
      for (const emitterComp of entity.getAll('ParticleEmitterComponent')) {
        this._emitterComponentUnsubscribe(entity, emitterComp);
      }
    };

    this._entityManager.on('add', this._emitterEntitySubscribe).on('remove', this._emitterEntityUnsubscribe);
    this._entityManager.heroEntity
      .on('add', this._emitterComponentSubscribe)
      .on('remove', this._emitterComponentUnsubscribe);
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    this._particleHolderEntity = EntityFinders.findById(entities, Const.EntityId.DeletedEntityEmitterHolder);

    this._emitterEntitySubscribe(this._entityManager.heroEntity);
    for (const entity of entities) {
      this._emitterEntitySubscribe(entity);
    }

    const mobs = EntityFinders.findMobs(entities);
    mobs.unshift(this._entityManager.heroEntity);

    for (const mob of mobs) {
      const movementEmitter = mob.get(
        'ParticleEmitterComponent',
        c => ObjectUtils.getTypeName(c.emitter) === 'MovingTrailEmitter'
      );
      if (movementEmitter) {
        movementEmitter.emitter.start();
        movementEmitter.emitter.pause();
      }
    }
  }

  unload(entities) {
    this._entityManager.off('add', this._emitterEntitySubscribe).off('remove', this._emitterEntityUnsubscribe);
    this._entityManager.heroEntity
      .off('add', this._emitterComponentSubscribe)
      .off('remove', this._emitterComponentUnsubscribe);
  }

  processEntities(gameTime, entities) {
    const topLeftPos = this._entityManager.currentLevelEntity.get('TileMapComponent').topLeftPos;

    const entitiesWithEmitters = EntityFinders.findParticleEmitters(entities);
    entitiesWithEmitters.unshift(this._entityManager.heroEntity);

    for (const entity of entitiesWithEmitters) {
      this._updateEmittersAndParticles(entity, gameTime, topLeftPos);
    }

    this._cleanupParticleHolder();
  }

  _updateMovingTrailEmitters(entity, movingEmitter) {
    if (entity.deleted) {
      return;
    }

    const movementAi = entity.get('MobMovementAiComponent');
    const movement = entity.get('MovementComponent');

    if (!movementAi && !movement) {
      return;
    }

    if (
      (movementAi.state === Const.MobMovementAiState.Moving ||
      movementAi.state === Const.MobMovementAiState.KnockingBack) &&
      (movement.velocityVector.x !== 0 || movement.velocityVector.y !== 0)
    ) {
      movingEmitter.resume();
    } else {
      movingEmitter.pause();
    }
  }

  showAttackHit(attack, point) {
    this._addParticleEmitterComponent(
      this._entityManager.particleEmitterFactory.buildAttackHitEmitter(attack.attackHitColors),
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

  showMobWaking(mob) {
    const emitters = mob.getAll('ParticleEmitterComponent');

    for (const emitter of emitters) {
      if (ObjectUtils.getTypeName(emitter.emitter) === 'WakeUpEmitter') {
        this._wireUpEmitter(emitter);
        emitter.emitter.start();
      }
    }
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

  _updateEmittersAndParticles(entity, gameTime, topLeftPos) {
    const emitterComponents = entity.getAll('ParticleEmitterComponent');

    for (const emitterComponent of emitterComponents) {
      const emitter = emitterComponent.emitter;

      if (ObjectUtils.getTypeName(emitter) === 'MovingTrailEmitter') {
        this._updateMovingTrailEmitters(entity, emitter);
      }

      emitter.update(gameTime);
      this._positionParticles(emitter, topLeftPos);
    }
  }

  _positionParticles(emitter, topLeftPos) {
    for (const particle of emitter.particles) {
      const newPos = this._pixiContainer.translateWorldPositionToScreenPosition(particle.position, topLeftPos);
      particle.sprite.position.set(newPos.x / Const.ScreenScale, newPos.y / Const.ScreenScale);
    }
  }

  _cleanupParticleHolder() {
    const holder = this._particleHolderEntity;

    for (const emitterComp of holder.getAll('ParticleEmitterComponent')) {
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
