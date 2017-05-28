'use strict';
import * as _ from 'lodash';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import ExperienceComponent from '../components/experience-component';
import FacingComponent from '../components/facing-component';
import MoneyComponent from '../components/money-component';
import GraphicsComponent from '../components/graphics-component';
import HeroComponent from '../components/hero-component';
import MovementComponent from '../components/movement-component';
import PositionComponent from '../components/position-component';
import Rectangle from '../rectangle';
import SpriteComponent from '../components/sprite-component';
import StatisticComponent from '../components/statistic-component';

export function buildHero(resources) {
  const heroTexture = resources['hero'].texture;
  const shadowFrame = new Pixi.Texture(heroTexture, new Pixi.Rectangle(0, 112, 16, 16));
  const mp = 30;
  const heroEnt = new Entity(Const.EntityId.Hero)
    .add(new BoundingRectangleComponent(new Rectangle(0.0625, 0.125, 0.875, 0.875)))
    .add(new ExperienceComponent())
    .add(new FacingComponent())
    .add(new GraphicsComponent('debug'))
    .add(new HeroComponent())
    .add(new MoneyComponent(100))
    .add(new MovementComponent())
    .add(new PositionComponent())
    .add(new SpriteComponent(shadowFrame, 'shadow'))
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.1))
    .add(new StatisticComponent(Const.Statistic.HitPoints, 30))
    .add(new StatisticComponent(Const.Statistic.MagicPoints, mp))
    .add(new StatisticComponent(Const.Statistic.SkillPoints, 99, 1))
    .add(new EntityReferenceComponent('bounding_box'));

  const invSlotTypes = _.values(Const.InventorySlot);

  for (let i = 0; i < invSlotTypes.length; ++i) {
    const slotType = invSlotTypes[i];

    switch (slotType) {
      case Const.InventorySlot.Backpack: {
        for (let i = 0; i < Const.BackpackSlotCount; ++i) {
          heroEnt.add(new EntityReferenceComponent(slotType));
        }
        break;
      }
      case Const.InventorySlot.Hotbar: {
        for (let i = 0; i < Const.HotbarSlotCount; ++i) {
          heroEnt.add(new EntityReferenceComponent(slotType));
        }
        break;
      }
      default: {
        heroEnt.add(new EntityReferenceComponent(slotType));
        break;
      }
    }
  }

  const spellSlotTypes = _.values(Const.MagicSpellSlot);

  for (let i = 0; i < spellSlotTypes.length; ++i) {
    const slotType = spellSlotTypes[i];

    switch (slotType) {
      case Const.MagicSpellSlot.SpellBook: {
        for (let i = 0; i < Const.MagicSpellBookSlotCount; ++i) {
          heroEnt.add(new EntityReferenceComponent(slotType));
        }
        break;
      }
      /*case Const.MagicSpellSlot.Hotbar:
         for (let i = 0; i < Const.MagicSpellHotbarSlotCount; ++i) {
         heroEnt.add(new EntityReferenceComponent(slotType));
         }
         break;*/


      default: {
        heroEnt.add(new EntityReferenceComponent(slotType));
        break;
      }
    }
  }

  return heroEnt;
}
