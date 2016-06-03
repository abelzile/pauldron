import * as Const from '../const';
import AiRandomWandererComponent from '../components/ai-random-wanderer-component';
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


export function buildMobBlueSlimeEntity(resources) {

  const frames = [
    new Pixi.Texture(resources['mob_blue_slime'].texture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  return new Entity()
    .add(new AiRandomWandererComponent())
    .add(new BoundingRectangleComponent())
    .add(new MobComponent(Const.Mob.BlueSlime))
    .add(new MovementComponent())
    .add(new MovieClipComponent(frames))
    .add(new PositionComponent(new Point()))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    .add(new EntityReferenceComponent(Const.InventorySlot.Hand1))
    .add(new StatisticComponent(Const.Statistic.HitPoints, 10))
    ;

}

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
