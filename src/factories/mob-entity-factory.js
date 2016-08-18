'use strict';
import * as Const from '../const';
import _ from 'lodash';
import AiRandomWandererComponent, { State as AiRandomWandererComponentState } from '../components/ai-random-wanderer-component';
import AiSeekerComponent from '../components/ai-seeker-component';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import MobComponent from '../components/mob-component';
import MovementComponent from '../components/movement-component';
import MovieClipComponent from '../components/movie-clip-component';
import Pixi from 'pixi.js';
import Point from '../point';
import PositionComponent from '../components/position-component';
import StatisticComponent from '../components/statistic-component';
import FacingComponent from '../components/facing-component';


const mobFuncs = Object.create(null);
mobFuncs[Const.Mob.BlueSlime] = function (mobTypeId, resources) {

  const baseTexture = resources['mob_blue_slime'].texture;

  const mcs = [

    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 48, 16, 16)) ],
      AiRandomWandererComponentState.AttackWarmingUp
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16)) ],
      AiRandomWandererComponentState.AttackCoolingDown
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 64, 16, 16)) ],
      AiRandomWandererComponentState.Attacking
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 80, 16, 16)) ],
      AiRandomWandererComponentState.KnockingBack
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16)) ],
      AiRandomWandererComponentState.Waiting
    ),
    new MovieClipComponent(
      [
        new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 16, 16, 16)),
        new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 32, 16, 16)),
      ],
      AiRandomWandererComponentState.Wandering
    ),

  ];

  _.forEach(mcs, c => { c.animationSpeed = 0.15; });

  return new Entity()
    .add(new AiRandomWandererComponent())
    .add(new BoundingRectangleComponent())
    .add(new EntityReferenceComponent(Const.InventorySlot.Hand1))
    .add(new FacingComponent())
    .add(new MobComponent(mobTypeId))
    .add(new MovementComponent())
    .add(new PositionComponent(new Point()))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    .add(new StatisticComponent(Const.Statistic.HitPoints, 10))
    .addRange(mcs)
    ;

};

export function buildMobOrcEntity(resources) {

  const frames = [
    new Pixi.Texture(resources['mob_orc'].texture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  return new Entity()
    .add(new AiSeekerComponent())
    .add(new BoundingRectangleComponent())
    .add(new MobComponent(Const.Mob.Orc))
    .add(new MovementComponent())
    .add(new MovieClipComponent(frames))
    .add(new PositionComponent(new Point()))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    .add(new EntityReferenceComponent(Const.InventorySlot.Hand1))
    ;

}

export function buildMobSkeletonEntity(resources) {

  const frames = [
    new Pixi.Texture(resources['mob_skeleton'].texture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  return new Entity()
    .add(new AiRandomWandererComponent())
    .add(new BoundingRectangleComponent())
    .add(new MobComponent(Const.Mob.Skeleton))
    .add(new MovementComponent())
    .add(new MovieClipComponent(frames))
    .add(new PositionComponent())
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    .add(new EntityReferenceComponent(Const.InventorySlot.Hand1))
    .add(new EntityReferenceComponent(Const.MagicSpellSlot.Memory))
    .add(new StatisticComponent(Const.Statistic.HitPoints, 15))
    .add(new StatisticComponent(Const.Statistic.MagicPoints, 1000))
    ;

}

export function buildMobZombieEntity(resources) {

  const frames = [
    new Pixi.Texture(resources['mob_zombie'].texture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  return new Entity()
    .add(new AiSeekerComponent())
    .add(new BoundingRectangleComponent())
    .add(new MobComponent(Const.Mob.Zombie))
    .add(new MovementComponent())
    .add(new MovieClipComponent(frames))
    .add(new PositionComponent())
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    .add(new EntityReferenceComponent(Const.InventorySlot.Hand1))
    .add(new StatisticComponent(Const.Statistic.HitPoints, 15))
    ;

}

export function buildMob(mobTypeId, imageResources) {

  const func = mobFuncs[mobTypeId];

  if (!func) { throw new Error(`"${mobTypeId}" is not a valid mob id.`); }

  return func(mobTypeId, imageResources);

}