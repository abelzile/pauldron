import * as Const from '../const';
import _ from 'lodash';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import HeroComponent from '../components/hero-component';
import InventoryBackgroundComponent from '../components/inventory-background-component';
import InventoryHpGuiComponent from '../components/inventory-hp-gui-component';
import InventorySlotComponent from '../components/inventory-slot-component';
import MovementComponent from '../components/movement-component';
import MovieClipComponent from '../components/movie-clip-component';
import Pixi from 'pixi.js';
import PositionComponent from '../components/position-component';
import Rectangle from '../rectangle';
import StatisticComponent from '../components/statistic-component';


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
    .add(new StatisticComponent('hit-points', 20))
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

  return heroEnt;

}

export function buildInventoryEntity(imageResources) {

  const guiTexture = imageResources['level_gui'].texture;

  const hpIconTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(0, 0, 16, 16));
  
  const invEnt = new Entity().add(new InventoryBackgroundComponent())
                             .add(new InventoryHpGuiComponent(hpIconTexture));

  for (const slotType of _.values(Const.InventorySlot)) {

    switch (slotType) {

      case Const.InventorySlot.Backpack:
        for (let i = 0; i < Const.BackpackSlotCount; ++i) {
          invEnt.add(new InventorySlotComponent(slotType));
        }
        break;

      case Const.InventorySlot.Hotbar:
        for (let i = 0; i < Const.HotbarSlotCount; ++i) {
          invEnt.add(new InventorySlotComponent(slotType, (i === 0 ? slotType + ' ' : '') + (i + 1)));
        }
        break;

      default:
        invEnt.add(new InventorySlotComponent(slotType));
        break;

    }

  }

  return invEnt;

}
