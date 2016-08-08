"use strict";
import * as Const from '../const';
import _ from 'lodash';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import HeroComponent from '../components/hero-component';
import MovementComponent from '../components/movement-component';
import MovieClipComponent from '../components/movie-clip-component';
import Pixi from 'pixi.js';
import PositionComponent from '../components/position-component';
import Rectangle from '../rectangle';
import StatisticComponent from '../components/statistic-component';
import FacingComponent from '../components/facing-component';


export function buildHeroEntity(resources) {

  const heroEnt = new Entity()
    .add(new BoundingRectangleComponent(new Rectangle(0.0625, 0.125, 0.875, 0.875)))
    .add(new HeroComponent())
    .add(new MovementComponent())
    .add(new PositionComponent())
    .add(new FacingComponent())
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.1))
    .add(new StatisticComponent(Const.Statistic.HitPoints, 30))
    .add(new StatisticComponent(Const.Statistic.MagicPoints, 30))
    .add(new StatisticComponent(Const.Statistic.SkillPoints, 99, 2))
    ;

  for (const slotType of _.values(Const.InventorySlot)) {

    switch (slotType) {

      case Const.InventorySlot.Backpack:
        for (let i = 0; i < Const.BackpackSlotCount; ++i) {
          heroEnt.add(new EntityReferenceComponent(slotType));
        }
        break;

      case Const.InventorySlot.Hotbar:
        for (let i = 0; i < Const.HotbarSlotCount; ++i) {
          heroEnt.add(new EntityReferenceComponent(slotType));
        }
        break;

      default:
        heroEnt.add(new EntityReferenceComponent(slotType));
        break;

    }

  }

  for (const slotType of _.values(Const.MagicSpellSlot)) {

    switch (slotType) {

      case Const.MagicSpellSlot.SpellBook:
        for (let i = 0; i < Const.MagicSpellBookSlotCount; ++i) {
          heroEnt.add(new EntityReferenceComponent(slotType));
        }
        break;

      /*case Const.MagicSpellSlot.Hotbar:
        for (let i = 0; i < Const.MagicSpellHotbarSlotCount; ++i) {
          heroEnt.add(new EntityReferenceComponent(slotType));
        }
        break;*/

      default:
        heroEnt.add(new EntityReferenceComponent(slotType));
        break;
      
    }

  }

  return heroEnt;

}