'use strict';
import * as _ from 'lodash';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import ExperienceComponent from '../components/experience-component';
import FacingComponent from '../components/facing-component';
import GraphicsComponent from '../components/graphics-component';
import HeroComponent from '../components/hero-component';
import MoneyComponent from '../components/money-component';
import MovementComponent from '../components/movement-component';
import PositionComponent from '../components/position-component';
import Rectangle from '../rectangle';
import SpriteComponent from '../components/sprite-component';
import MobMovementAiComponent from '../components/mob-movement-ai-component';
import MobAttackAiComponent from '../components/mob-attack-ai-component';
import MovingTrailEmitter from '../particles/emitters/moving-trail-emitter';
import ParticleEmitterComponent from '../components/particle-emitter-component';

export function buildHero(resources) {
  const heroTexture = resources['hero'].texture;
  const shadowFrame = new Pixi.Texture(heroTexture, new Pixi.Rectangle(0, 112, 16, 16));
  const hero = new Entity(Const.EntityId.Hero);
  hero
    .add(new BoundingRectangleComponent(new Rectangle(0.0625, 0.125, 0.875, 0.875)))
    .add(new ExperienceComponent())
    .add(new FacingComponent())
    .add(new GraphicsComponent('debug'))
    .add(new HeroComponent())
    .add(new MobMovementAiComponent(Const.MobMovementAiType.Hero, Const.MobMovementAiState.Waiting))
    .add(new MobAttackAiComponent(Const.MobAttackAiType.Hero))
    .add(new MoneyComponent(100))
    .add(new MovementComponent())
    .add(new PositionComponent())
    .add(new SpriteComponent(shadowFrame, 'shadow'))
    .add(new EntityReferenceComponent('bounding_box'))
    .add(new ParticleEmitterComponent(new MovingTrailEmitter(resources['particles'].texture, hero)));

  const invSlotTypes = _.values(Const.InventorySlot);

  for (const slotType of invSlotTypes) {
    switch (slotType) {
      case Const.InventorySlot.Backpack: {
        for (let i = 0; i < Const.BackpackSlotCount; ++i) {
          hero.add(new EntityReferenceComponent(slotType));
        }
        break;
      }
      case Const.InventorySlot.Hotbar: {
        for (let i = 0; i < Const.HotbarSlotCount; ++i) {
          hero.add(new EntityReferenceComponent(slotType));
        }
        break;
      }
      default: {
        hero.add(new EntityReferenceComponent(slotType));
        break;
      }
    }
  }

  const spellSlotTypes = _.values(Const.MagicSpellSlot);

  for (const slotType of spellSlotTypes) {
    switch (slotType) {
      case Const.MagicSpellSlot.SpellBook: {
        for (let i = 0; i < Const.MagicSpellBookSlotCount; ++i) {
          hero.add(new EntityReferenceComponent(slotType));
        }
        break;
      }
      /*case Const.MagicSpellSlot.Hotbar:
         for (let i = 0; i < Const.MagicSpellHotbarSlotCount; ++i) {
         hero.add(new EntityReferenceComponent(slotType));
         }
         break;*/


      default: {
        hero.add(new EntityReferenceComponent(slotType));
        break;
      }
    }
  }

  return hero;
}
