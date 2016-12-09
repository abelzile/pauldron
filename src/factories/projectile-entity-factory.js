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
    .add(new GraphicsComponent('debug'))
    .add(new MovementComponent())
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
    .add(new PositionComponent())
    .add(new ProjectileAttackComponent())
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.3))
    ;

};

funcMap[Const.Projectile.Fireball] = function(imageResources) {

  const particle1Frames = [
    new Pixi.Texture(imageResources['particles'].texture, new Pixi.Rectangle(32, 0, 16, 16))
  ];

  const particle2Frames = [
    new Pixi.Texture(imageResources['particles'].texture, new Pixi.Rectangle(64, 0, 16, 16))
  ];

  const particle3Frames = [
    new Pixi.Texture(imageResources['particles'].texture, new Pixi.Rectangle(96, 0, 16, 16))
  ];

  const particle4Frames = [
    new Pixi.Texture(imageResources['particles'].texture, new Pixi.Rectangle(112, 0, 16, 16))
  ];

  return new Entity()
    .setTags('projectile')
    .add(new AnimatedSpriteComponent(Const.EmptyTextureArray))
    .add(new BoundingRectangleComponent(new Rectangle(0.25, 0.25, 0.5, 0.5)))
    .add(new GraphicsComponent('debug'))
    .add(new MovementComponent())
    .add(new ParticleEmitterComponent(particle4Frames,
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
    .add(new ParticleEmitterComponent(particle3Frames,
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
    .add(new ParticleEmitterComponent(particle2Frames,
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
    .add(new ParticleEmitterComponent(particle1Frames,
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
    .add(new PositionComponent())
    .add(new ProjectileAttackComponent())
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
    .add(new GraphicsComponent('debug'))
    .add(new MovementComponent())
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
    .add(new PositionComponent())
    .add(new ProjectileAttackComponent())
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
    .add(new MovementComponent())
    .add(new AnimatedSpriteComponent(frames))
    .add(new PositionComponent())
    .add(new ProjectileAttackComponent())
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
    .add(new GraphicsComponent('debug'))
    .add(new MovementComponent())
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
    .add(new PositionComponent())
    .add(new ProjectileAttackComponent())
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.3))
    ;

};

export function buildProjectile(projectileTypeId, imageResources) {

  const func = funcMap[projectileTypeId];

  if (!func) { throw new Error('No factory method found for projectileTypeId: "' + projectileTypeId + '".'); }

  return func(imageResources);

}