'use strict';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import AnimatedSpriteComponent from '../components/animated-sprite-component';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import GraphicsComponent from '../components/graphics-component';
import MovementComponent from '../components/movement-component';
import PositionComponent from '../components/position-component';
import ProjectileAttackComponent from '../components/projectile-attack-component';
import Rectangle from '../rectangle';
import StatisticComponent from '../components/statistic-component';

function buildBoundingRectComponent(projectileData) {
  return new BoundingRectangleComponent(_.assign(new Rectangle(), projectileData.boundingRect));
}

function buildAnimatedSpriteComponents(baseTexture, projectileData) {

  const mcs = [];

  if (!projectileData.animations) { return mcs; }

  const animations = projectileData.animations;

  for (let i = 0; i < animations.length; ++i) {

    const desc = animations[i];

    const frames = [];
    for (let j = 0; j < desc.frames.length; ++j) {
      frames[j] = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), desc.frames[j]));
    }

    const component = new AnimatedSpriteComponent(frames);
    component.animationSpeed = desc.animationSpeed;

    mcs[i] = component

  }

  return mcs;

}

function buildStatisticCompoents(projectileData) {

  const statistics = projectileData.statistics;
  const stats = [];

  for (let i = 0; i < statistics.length; ++i) {

    const stat = statistics[i];

    stats[i] = new StatisticComponent(stat.name, stat.maxValue);

  }

  return stats;

}

function buildParticleEmitters(projectileData, particleEmitterGroupTemplates) {

  const emitters = [];

  if (!projectileData.particleEmitterGroupIds) {
    return emitters;
  }

  for (let i = 0; i < projectileData.particleEmitterGroupIds.length; ++i) {

    const id = projectileData.particleEmitterGroupIds[i];
    const group = particleEmitterGroupTemplates[id];

    if (group && group.length > 0) {

      for (let j = 0; j < group.length; ++j) {
        emitters.push(group[j].clone());
      }

    }

  }

  return emitters;

}

export function buildProjectile(imageResources, projectileData, particleEmitterGroupTemplates) {

  let baseTexture = projectileData.baseTextureResourceId ? imageResources[projectileData.baseTextureResourceId].texture : null;

  const entity = new Entity()
    .setTags('projectile')
    .add(new GraphicsComponent('debug'))
    .add(new MovementComponent())
    .add(new PositionComponent())
    .add(new ProjectileAttackComponent())
    .add(buildBoundingRectComponent(projectileData))
    .addRange(buildStatisticCompoents(projectileData));

  if (baseTexture) {

    const anims = buildAnimatedSpriteComponents(baseTexture, projectileData);
    if (anims.length > 0) {
      entity.addRange(anims)
    }

  } else {
    entity.add(new AnimatedSpriteComponent(Const.EmptyTextureArray));
  }

  if (projectileData.particleEmitterGroupIds) {
    entity.addRange(buildParticleEmitters(projectileData, particleEmitterGroupTemplates));
  }

  return entity;

}