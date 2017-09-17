'use strict';
import ArrowTrailEmitter from '../particles/emitters/arrow-trail-emitter';
import Entity from '../entity';
import Factory from './factory';
import FireballTrailEmitter from '../particles/emitters/fireball-trail-emitter';
import GraphicsComponent from '../components/graphics-component';
import MovementComponent from '../components/movement-component';
import ParticleEmitterComponent from '../components/particle-emitter-component';
import PositionComponent from '../components/position-component';
import IceShardTrailEmitter from '../particles/emitters/ice-shard-trail-emitter';
import LargeRockTrailEmitter from '../particles/emitters/large-rock-trail-emitter';

export default class ProjectileEntityFactory extends Factory {
  constructor(entityData, textureData) {
    super(entityData, textureData);
  }

  buildProjectile(id) {
    const projectileData = this.entityDict[id];

    if (!projectileData) {
      throw new Error(`Invalid projectile type id: "${id}"`);
    }

    const entity = new Entity();
    entity
      .setTags('projectile')
      .add(new GraphicsComponent('debug'))
      .add(new MovementComponent())
      .add(new PositionComponent())
      .add(this.buildBoundingRectComponent(id))
      .add(this.buildProjectileAttackComponent(id))
      .addRange(this.buildAnimatedSpriteComponents(id))
      .addRange(this.buildStatisticComponents(id))
      .add(this.buildProjectileParticleEmitterComponent(id, entity));

    return entity;
  }

  buildProjectileParticleEmitterComponent(id, entity) {
    const particleTexture = this.textureDict['particles'].texture;

    switch (id) {
      case 'arrow_bone':
      case 'arrow_celestial':
      case 'arrow_dwarven':
      case 'arrow_elven':
      case 'arrow_jade':
      case 'arrow_meteorite':
      case 'arrow_obsidian':
      case 'arrow_steel':
      case 'arrow_wood':
      case 'small_arrow_wood':
        return new ParticleEmitterComponent(new ArrowTrailEmitter(particleTexture, entity));
      case 'fireball':
        return new ParticleEmitterComponent(new FireballTrailEmitter(particleTexture, entity));
      case 'ice_shard':
        return new ParticleEmitterComponent(new IceShardTrailEmitter(particleTexture, entity));
      case 'large_rock':
        return new ParticleEmitterComponent(new LargeRockTrailEmitter(particleTexture, entity));
      default:
        return null;
    }
  }
}
