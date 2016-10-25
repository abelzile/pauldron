'use strict';
import * as Const from '../const';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import GraphicsComponent from '../components/graphics-component';
import MovementComponent from '../components/movement-component';
import MovieClipComponent from '../components/movie-clip-component';
import Pixi from 'pixi.js';
import PositionComponent from '../components/position-component';
import ProjectileAttackComponent from '../components/projectile-attack-component';
import Rectangle from '../rectangle';
import StatisticComponent from '../components/statistic-component';


const funcMap = Object.create(null);

funcMap[Const.Projectile.Arrow] = function(resources) {

  const frames = [
    new Pixi.Texture(resources['weapons'].texture, new Pixi.Rectangle(64, 0, 16, 16))
  ];

  return new Entity()
    .setTags('projectile')
    .add(new BoundingRectangleComponent(new Rectangle(0.25, 0.25, 0.5, 0.5)))
    .add(new GraphicsComponent('debug'))
    .add(new MovementComponent())
    .add(new MovieClipComponent(frames))
    .add(new PositionComponent())
    .add(new ProjectileAttackComponent())
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    ;

};

funcMap[Const.Projectile.Fireball] = function(resources) {

  const frames = [
    new Pixi.Texture(resources['magic_spells'].texture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  return new Entity()
    .setTags('projectile')
    .add(new BoundingRectangleComponent(new Rectangle()))
    .add(new MovementComponent())
    .add(new MovieClipComponent(frames))
    .add(new PositionComponent())
    .add(new ProjectileAttackComponent())
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    ;

};

funcMap[Const.Projectile.IceShard] = function(resources) {

  const frames = [
    new Pixi.Texture(resources['magic_spells'].texture, new Pixi.Rectangle(16, 0, 16, 16))
  ];

  return new Entity()
    .setTags('projectile')
    .add(new BoundingRectangleComponent(new Rectangle()))
    .add(new MovementComponent())
    .add(new MovieClipComponent(frames))
    .add(new PositionComponent())
    .add(new ProjectileAttackComponent())
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    ;

};


export function buildProjectile(projectileTypeId, resources) {

  const func = funcMap[projectileTypeId];

  if (!func) { throw new Error('No factory method found for projectileTypeId: "' + projectileTypeId + '".'); }

  return func(resources);

}