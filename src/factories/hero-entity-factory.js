import * as Const from '../const';
import _ from 'lodash';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import HeroComponent from '../components/hero-component';
import InventoryBackgroundComponent from '../components/inventory-background-component';
import InventoryCurrentEntityReferenceComponent from '../components/inventory-current-entity-reference-component';
import InventoryHeroTextComponent from '../components/inventory-hero-text-component';
import InventoryItemTextComponent from '../components/inventory-item-text-component';
import InventorySlotComponent from '../components/inventory-slot-component';
import MovementComponent from '../components/movement-component';
import MovieClipComponent from '../components/movie-clip-component';
import Pixi from 'pixi.js';
import PositionComponent from '../components/position-component';
import Rectangle from '../rectangle';
import StatisticComponent from '../components/statistic-component';
import DialogHeaderComponent from "../components/dialog-header-component";


export function buildHeroEntity(resources) {

  const frames = [
    new Pixi.Texture(resources['hero'].texture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  const heroEnt = new Entity()
    .add(new BoundingRectangleComponent(new Rectangle(0.0625, 0.125, 0.875, 0.875)))
    .add(new HeroComponent())
    .add(new MovementComponent())
    .add(new MovieClipComponent(frames))
    .add(new PositionComponent())
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.1))
    .add(new StatisticComponent(Const.Statistic.HitPoints, 30))
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

      case Const.MagicSpellSlot.Spellbook:
        for (let i = 0; i < Const.MagicSpellBookSlotCount; ++i) {
          heroEnt.add(new EntityReferenceComponent(slotType));
        }
        break;

      case Const.MagicSpellSlot.Hotbar:
        for (let i = 0; i < Const.MagicSpellHotbarSlotCount; ++i) {
          heroEnt.add(new EntityReferenceComponent(slotType));
        }
        break;

      default:
        heroEnt.add(new EntityReferenceComponent(slotType));
        break;
      
    }

  }

  return heroEnt;

}

export function buildInventoryEntity(imageResources) {

  const dialogGuiTexture = imageResources['dialog_gui'].texture;

  const leftDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(0, 0, 7, 5));
  const rightDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(7, 0, 7, 5));
  const dividerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(14, 0, 3, 3));
  const frames = [
    new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(17, 0, 5, 5))
  ];

  const invEnt = new Entity()
    .add(new InventoryBackgroundComponent())
    .add(new InventoryCurrentEntityReferenceComponent())
    .add(new DialogHeaderComponent('Inventory', _.clone(Const.HeaderTextStyle), 1, leftDecoTexture, rightDecoTexture, dividerDecoTexture, frames))
    .add(new InventoryHeroTextComponent(' ', _.clone(Const.InventoryBodyTextStyle), 1 / 3))
    .add(new InventoryItemTextComponent(' ', _.clone(Const.InventoryBodyTextStyle), 1 / 3))
    ;

  for (const slotType of _.values(Const.InventorySlot)) {

    switch (slotType) {

      case Const.InventorySlot.Backpack:
        for (let i = 0; i < Const.BackpackSlotCount; ++i) {
          invEnt.add(new InventorySlotComponent(slotType, '', _.clone(Const.InventoryBodyTextStyle), 1 / 3));
        }
        break;

      case Const.InventorySlot.Hotbar:
        for (let i = 0; i < Const.HotbarSlotCount; ++i) {
          invEnt.add(new InventorySlotComponent(slotType, i === 0 ? slotType : i + 1, _.clone(Const.InventoryBodyTextStyle), 1 / 3));
        }
        break;

      default:
        invEnt.add(new InventorySlotComponent(slotType, '', _.clone(Const.InventoryBodyTextStyle), 1 / 3));
        break;

    }

  }

  return invEnt;

}
