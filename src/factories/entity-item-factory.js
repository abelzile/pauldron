import * as Const from '../const';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import InventoryIconComponent from '../components/inventory-icon-component';
import ItemComponent from '../components/item-component';
import MovieClipComponent from '../components/movie-clip-component';
import Pixi from 'pixi.js';
import Point from '../point';
import PositionComponent from '../components/position-component';
import Rectangle from '../rectangle';
import TemplateComponent from '../components/template-component';


export function buildItemHealingPotionTemplateEntity(resources) {

  const itemsTexture = resources['items'].texture;

  const frames = [
    new Pixi.Texture(itemsTexture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(itemsTexture, new Pixi.Rectangle(0, 0, 16, 16));

  return new Entity()
    .add(new BoundingRectangleComponent(new Rectangle(0.25, 0.25, 0.5, 0.75)))
    .add(new InventoryIconComponent(iconTexture, Const.InventorySlot.Backpack))
    .add(new ItemComponent(Const.Item.HealingPotion))
    .add(new MovieClipComponent(frames))
    .add(new PositionComponent(new Point()))
    .add(new TemplateComponent())
    ;

}

export function buildItemMagicPotionTemplateEntity(resources) {

  const itemsTexture = resources['items'].texture;

  const frames = [
    new Pixi.Texture(itemsTexture, new Pixi.Rectangle(0, 16, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(itemsTexture, new Pixi.Rectangle(0, 16, 16, 16));

  return new Entity()
    .add(new BoundingRectangleComponent(new Rectangle(0.25, 0.25, 0.5, 0.75)))
    .add(new InventoryIconComponent(iconTexture, Const.InventorySlot.Backpack))
    .add(new ItemComponent(Const.Item.MagicPotion))
    .add(new MovieClipComponent(frames))
    .add(new PositionComponent(new Point()))
    .add(new TemplateComponent())
    ;

}
