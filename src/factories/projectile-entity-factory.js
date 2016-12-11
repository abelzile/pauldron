'use strict';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import AnimatedSpriteComponent from '../components/animated-sprite-component';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import GraphicsComponent from '../components/graphics-component';
import MovementComponent from '../components/movement-component';
import ParticleEmitterComponent from '../components/particle-emitter-component';
import PositionComponent from '../components/position-component';
import ProjectileAttackComponent from '../components/projectile-attack-component';
import Rectangle from '../rectangle';
import StatisticComponent from '../components/statistic-component';
import Vector from '../vector';


/*
const funcMap = Object.create(null);

funcMap[Const.Projectile.Arrow] = function(imageResources) {

  const projectileFrames = [
    new Pixi.Texture(imageResources['weapons'].texture, new Pixi.Rectangle(64, 0, 16, 16))
  ];

  const particleFrames = [
    new Pixi.Texture(imageResources['particles'].texture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  return new Entity()
    .setTags('projectile')
    .add(new AnimatedSpriteComponent(projectileFrames))
    .add(new BoundingRectangleComponent(new Rectangle(0.25, 0.25, 0.5, 0.5)))
    .add(new ParticleEmitterComponent(particleFrames,
                                      new Vector(),
                                      new Vector(),
                                      0.05,
                                      new Vector(0, 0),
                                      Const.RadiansOf1Degree,
                                      undefined,
                                      1,
                                      200,
                                      false,
                                      true,
                                      undefined))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.3))
    ;

};

funcMap[Const.Projectile.Fireball] = function(imageResources) {

  return new Entity()
    .setTags('projectile')
    .add(new AnimatedSpriteComponent(Const.EmptyTextureArray))
    .add(new BoundingRectangleComponent(new Rectangle(0.25, 0.25, 0.5, 0.5)))
    .add(new ParticleEmitterComponent([
                                        new Pixi.Texture(imageResources['particles'].texture, new Pixi.Rectangle(112, 0, 16, 16))
                                      ],
                                      new Vector(),
                                      new Vector(),
                                      0.05,
                                      new Vector(0.3125, 0.3125),
                                      Const.RadiansOf1Degree,
                                      undefined,
                                      1,
                                      50,
                                      false,
                                      true,
                                      0xd81400))
    .add(new ParticleEmitterComponent([
                                        new Pixi.Texture(imageResources['particles'].texture, new Pixi.Rectangle(96, 0, 16, 16))
                                      ],
                                      new Vector(),
                                      new Vector(),
                                      0.05,
                                      new Vector(0.25, 0.25),
                                      Const.RadiansOf1Degree,
                                      undefined,
                                      1,
                                      100,
                                      false,
                                      true,
                                      0xfc5300))
    .add(new ParticleEmitterComponent([
                                        new Pixi.Texture(imageResources['particles'].texture, new Pixi.Rectangle(64, 0, 16, 16))
                                      ],
                                      new Vector(),
                                      new Vector(),
                                      0.05,
                                      new Vector(0.1875, 0.1875),
                                      Const.RadiansOf1Degree,
                                      undefined,
                                      1,
                                      200,
                                      false,
                                      true,
                                      0xfcb800))
    .add(new ParticleEmitterComponent([
                                        new Pixi.Texture(imageResources['particles'].texture, new Pixi.Rectangle(32, 0, 16, 16))
                                      ],
                                      new Vector(),
                                      new Vector(),
                                      0.05,
                                      new Vector(0.125, 0.125),
                                      Const.RadiansOf1Degree,
                                      undefined,
                                      1,
                                      300,
                                      false,
                                      true,
                                      0xfafb89))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.2))
    ;

};

funcMap[Const.Projectile.Arrow] = function(imageResources) {

  const projectileFrames = [
    new Pixi.Texture(imageResources['weapons'].texture, new Pixi.Rectangle(64, 0, 16, 16))
  ];

  const particleFrames = [
    new Pixi.Texture(imageResources['particles'].texture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  return new Entity()
    .setTags('projectile')
    .add(new AnimatedSpriteComponent(projectileFrames))
    .add(new BoundingRectangleComponent(new Rectangle(0.25, 0.25, 0.5, 0.5)))
    .add(new ParticleEmitterComponent(particleFrames,
      new Vector(),
      new Vector(),
      0.05,
      new Vector(0, 0),
      Const.RadiansOf1Degree,
      undefined,
      1,
      200,
      false,
      true,
      undefined))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.3))
    ;

};
funcMap[Const.Projectile.IceShard] = function(imageResources) {

  const frames = [
    new Pixi.Texture(imageResources['magic_spells'].texture, new Pixi.Rectangle(16, 0, 16, 16))
  ];

  return new Entity()
    .setTags('projectile')
    .add(new BoundingRectangleComponent(new Rectangle()))
    .add(new AnimatedSpriteComponent(frames))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    ;

};
funcMap[Const.Projectile.GoblinArrow] = function(imageResources) {

  const projectileFrames = [
    new Pixi.Texture(imageResources['weapons'].texture, new Pixi.Rectangle(64, 16, 16, 16))
  ];

  const particleFrames = [
    new Pixi.Texture(imageResources['particles'].texture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  return new Entity()
    .setTags('projectile')
    .add(new AnimatedSpriteComponent(projectileFrames))
    .add(new BoundingRectangleComponent(new Rectangle(0.25, 0.25, 0.5, 0.5)))
    .add(new ParticleEmitterComponent(particleFrames,
      new Vector(),
      new Vector(),
      0.05,
      new Vector(0, 0),
      Const.RadiansOf1Degree,
      undefined,
      1,
      200,
      false,
      true,
      undefined))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.3))
    ;

};
*/

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

  if (projectileData.particleEmitterGroupIds) {

    for (let i = 0; i < projectileData.particleEmitterGroupIds.length; ++i) {

      const id = projectileData.particleEmitterGroupIds[i];

      const group = particleEmitterGroupTemplates[id];

      if (group && group.length > 0) {

        for (let j = 0; j < group.length; ++j) {
          emitters.push(group[j].clone());
        }

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