'use strict';
import * as Const from '../const';
import _ from 'lodash';
import AiRandomWandererComponent, { State as AiRandomWandererState } from '../components/ai-random-wanderer-component';
import AiSeekerComponent, { State as AiSeekerState } from '../components/ai-seeker-component';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import FacingComponent from '../components/facing-component';
import MobComponent from '../components/mob-component';
import MovementComponent from '../components/movement-component';
import MovieClipComponent from '../components/movie-clip-component';
import Pixi from 'pixi.js';
import Point from '../point';
import PositionComponent from '../components/position-component';
import StatisticComponent from '../components/statistic-component';
import GraphicsComponent from '../components/graphics-component';


const mobFuncs = Object.create(null);

mobFuncs[Const.Mob.BlueSlime] = function (mobTypeId, resources) {

  const baseTexture = resources['mob_blue_slime'].texture;

  const mcs = [

    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 48, 16, 16)) ],
      AiRandomWandererState.AttackWarmingUp
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16)) ],
      AiRandomWandererState.AttackCoolingDown
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 64, 16, 16)) ],
      AiRandomWandererState.Attacking
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 80, 16, 16)) ],
      AiRandomWandererState.KnockingBack
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16)) ],
      AiRandomWandererState.Waiting
    ),
    new MovieClipComponent(
      [
        new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 16, 16, 16)),
        new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 32, 16, 16)),
      ],
      AiRandomWandererState.Wandering
    ),

  ];

  _.forEach(mcs, c => { c.animationSpeed = 0.15; });

  return new Entity()
    .add(new AiRandomWandererComponent())
    .add(new BoundingRectangleComponent())
    .add(new EntityReferenceComponent(Const.InventorySlot.Hand1))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    .add(new StatisticComponent(Const.Statistic.HitPoints, 10))
    .addRange(mcs)
    ;

};

mobFuncs[Const.Mob.Orc] = function (mobTypeId, resources) {

  const baseTexture = resources['mob_orc'].texture;

  const mcs = [

    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 48, 16, 16)) ],
      AiSeekerState.AttackWarmingUp
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16)) ],
      AiSeekerState.AttackCoolingDown
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 64, 16, 16)) ],
      AiSeekerState.Attacking
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 80, 16, 16)) ],
      AiSeekerState.KnockingBack
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16)) ],
      AiSeekerState.Waiting
    ),
    new MovieClipComponent(
      [
        new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 16, 16, 16)),
        new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 32, 16, 16)),
      ],
      AiSeekerState.Seeking
    ),

  ];

  _.forEach(mcs, c => { c.animationSpeed = 0.15; });

  return new Entity()
    .add(new AiSeekerComponent())
    .add(new BoundingRectangleComponent())
    .add(new EntityReferenceComponent(Const.InventorySlot.Hand1))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    .add(new StatisticComponent(Const.Statistic.HitPoints, 20))
    .addRange(mcs)
    ;

};

mobFuncs[Const.Mob.Skeleton] = function (mobTypeId, resources) {

  const baseTexture = resources['mob_skeleton'].texture;

  const mcs = [

    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 48, 16, 16)) ],
      AiRandomWandererState.AttackWarmingUp
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16)) ],
      AiRandomWandererState.AttackCoolingDown
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 64, 16, 16)) ],
      AiRandomWandererState.Attacking
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 80, 16, 16)) ],
      AiRandomWandererState.KnockingBack
    ),
    new MovieClipComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16)) ],
      AiRandomWandererState.Waiting
    ),
    new MovieClipComponent(
      [
        new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 16, 16, 16)),
        new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 32, 16, 16)),
      ],
      AiRandomWandererState.Wandering
    ),

  ];

  _.forEach(mcs, c => { c.animationSpeed = 0.15; });

  return new Entity()
    .add(new AiRandomWandererComponent())
    .add(new BoundingRectangleComponent())
    .add(new EntityReferenceComponent(Const.InventorySlot.Hand1))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    .add(new StatisticComponent(Const.Statistic.HitPoints, 15))
    //.add(new EntityReferenceComponent(Const.MagicSpellSlot.Memory))
    //.add(new StatisticComponent(Const.Statistic.MagicPoints, 1000))
    .addRange(mcs)
    ;

};

export function buildMobZombieEntity(resources) {

  const frames = [
    new Pixi.Texture(resources['mob_zombie'].texture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  return new Entity()
    .add(new AiSeekerComponent())
    .add(new BoundingRectangleComponent())
    .add(new EntityReferenceComponent(Const.InventorySlot.Hand1))
    .add(new MovieClipComponent(frames))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    .add(new StatisticComponent(Const.Statistic.HitPoints, 15))
    ;

}

export function buildMob(mobTypeId, imageResources) {

  const func = mobFuncs[mobTypeId];

  if (!func) { throw new Error(`"${mobTypeId}" is not a valid mob id.`); }

  return (func(mobTypeId, imageResources))
         .add(new FacingComponent())
         .add(new GraphicsComponent('hp_bar'))
         .add(new GraphicsComponent('debug'))
         .add(new MobComponent(mobTypeId))
         .add(new MovementComponent())
         .add(new PositionComponent())
         ;

}