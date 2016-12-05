'use strict';
import * as _ from 'lodash';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import AiRandomWandererComponent, { State as AiRandomWandererState } from '../components/ai-random-wanderer-component';
import AiSeekerComponent, { State as AiSeekerState } from '../components/ai-seeker-component';
import AnimatedSpriteComponent from '../components/animated-sprite-component';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import ExperienceValueComponent from '../components/experience-value-component';
import FacingComponent from '../components/facing-component';
import GraphicsComponent from '../components/graphics-component';
import MobComponent from '../components/mob-component';
import MovementComponent from '../components/movement-component';
import PositionComponent from '../components/position-component';
import StatisticComponent from '../components/statistic-component';
import SpriteComponent from '../components/sprite-component';
import Rectangle from '../rectangle';


function buildAnimatedSpriteComponents(baseTexture, mobResources) {

  const mcs = [];

  const animations = mobResources.bear.animations;

  for (let i = 0; i < animations.length; ++i) {

    const desc = animations[i];

    const frames = [];
    for (let j = 0; j < desc.frames.length; ++j) {
      frames[j] = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), desc.frames[j]));
    }

    const animatedSpriteComponent = new AnimatedSpriteComponent(frames, desc.mobState);
    animatedSpriteComponent.animationSpeed = desc.animationSpeed;

    mcs[i] = animatedSpriteComponent

  }

  return mcs;

}

function buildShadowSpriteComponent(baseTexture, mobResources) {

  return new SpriteComponent(new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), mobResources.bear.shadowFrame)), 'shadow');

}

function buildBoundingRectComponent(mobResources) {
  return new BoundingRectangleComponent(_.assign(new Rectangle(), mobResources.bear.boundingRect));
}

const mobFuncs = Object.create(null);

mobFuncs[Const.Mob.BlueSlime] = function (mobTypeId, resources) {

  const baseTexture = resources['mob_blue_slime'].texture;

  const shadowFrame = new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 96, 16, 16));

  const mcs = [

    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 48, 16, 16)) ],
      AiRandomWandererState.AttackWarmingUp
    ),
    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16)) ],
      AiRandomWandererState.AttackCoolingDown
    ),
    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 64, 16, 16)) ],
      AiRandomWandererState.Attacking
    ),
    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 80, 16, 16)) ],
      AiRandomWandererState.KnockingBack
    ),
    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16)) ],
      AiRandomWandererState.Waiting
    ),
    new AnimatedSpriteComponent(
      [
        new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 16, 16, 16)),
        new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 32, 16, 16)),
      ],
      AiRandomWandererState.Wandering
    ),

  ];

  for (let i = 0; i < mcs.length; ++i) {
    mcs[i].animationSpeed = 0.15;
  }

  return new Entity()
    .add(new AiRandomWandererComponent())
    .add(new BoundingRectangleComponent())
    .add(new EntityReferenceComponent(Const.InventorySlot.Hand1))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    .add(new StatisticComponent(Const.Statistic.HitPoints, 10))
    .add(new ExperienceValueComponent(50))
    .add(new SpriteComponent(shadowFrame, 'shadow'))
    .addRange(mcs)
    ;

};

mobFuncs[Const.Mob.Bear] = function (mobTypeId, textureResources, mobResources) {

  const baseTexture = textureResources['mob_bear'].texture;

  return new Entity()
    .add(new AiRandomWandererComponent())
    .add(buildBoundingRectComponent(mobResources))
    .add(new EntityReferenceComponent(Const.InventorySlot.Hand1))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    .add(new StatisticComponent(Const.Statistic.HitPoints, 10))
    .add(new ExperienceValueComponent(50))
    .add(buildShadowSpriteComponent(baseTexture, mobResources))
    .addRange(buildAnimatedSpriteComponents(baseTexture, mobResources))
    ;

};

mobFuncs[Const.Mob.Orc] = function (mobTypeId, resources) {

  const baseTexture = resources['mob_orc'].texture;

  const mcs = [

    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 48, 16, 16)) ],
      AiSeekerState.AttackWarmingUp
    ),
    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16)) ],
      AiSeekerState.AttackCoolingDown
    ),
    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 64, 16, 16)) ],
      AiSeekerState.Attacking
    ),
    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 80, 16, 16)) ],
      AiSeekerState.KnockingBack
    ),
    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16)) ],
      AiSeekerState.Waiting
    ),
    new AnimatedSpriteComponent(
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

    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 48, 16, 16)) ],
      AiRandomWandererState.AttackWarmingUp
    ),
    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16)) ],
      AiRandomWandererState.AttackCoolingDown
    ),
    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 64, 16, 16)) ],
      AiRandomWandererState.Attacking
    ),
    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 80, 16, 16)) ],
      AiRandomWandererState.KnockingBack
    ),
    new AnimatedSpriteComponent(
      [ new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16)) ],
      AiRandomWandererState.Waiting
    ),
    new AnimatedSpriteComponent(
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
    .add(new AnimatedSpriteComponent(frames))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    .add(new StatisticComponent(Const.Statistic.HitPoints, 15))
    ;

}

export function buildMob(mobTypeId, imageResources, mobResources) {

  const func = mobFuncs[mobTypeId];

  if (!func) { throw new Error(`"${mobTypeId}" is not a valid mob id.`); }

  return (func(mobTypeId, imageResources, mobResources))
         .setTags('mob')
         .add(new FacingComponent())
         .add(new GraphicsComponent('hp_bar'))
         .add(new GraphicsComponent('debug'))
         .add(new MobComponent(mobTypeId))
         .add(new MovementComponent())
         .add(new PositionComponent())
         ;

}