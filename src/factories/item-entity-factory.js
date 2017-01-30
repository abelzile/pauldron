import * as Const from '../const';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import InventoryIconComponent from '../components/inventory-icon-component';
import ItemComponent from '../components/item-component';
import LevelIconComponent from '../components/level-icon-component';
import AnimatedSpriteComponent from '../components/animated-sprite-component';
import * as Pixi from 'pixi.js';
import PositionComponent from '../components/position-component';
import Rectangle from '../rectangle';
import StatisticEffectComponent from '../components/statistic-effect-component';
import Vector from '../vector';


export function buildItemHealingPotionEntity(resources) {

  const itemsTexture = resources['items'].texture;

  const frames = [
    new Pixi.Texture(itemsTexture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(itemsTexture, new Pixi.Rectangle(0, 0, 16, 16));

  return new Entity()
    .add(new BoundingRectangleComponent(new Rectangle(0.25, 0.25, 0.5, 0.75)))
    .add(new InventoryIconComponent(iconTexture, Const.InventorySlot.Backpack, Const.InventorySlot.Hotbar, Const.InventorySlot.Use))
    .add(new LevelIconComponent(iconTexture))
    .add(new ItemComponent(Const.Item.HealingPotion))
    .add(new AnimatedSpriteComponent(frames))
    .add(new PositionComponent(new Vector()))
    .add(new StatisticEffectComponent(Const.Statistic.HitPoints, 10))
    ;

}

export function buildItemMagicPotionEntity(resources) {

  const itemsTexture = resources['items'].texture;

  const frames = [
    new Pixi.Texture(itemsTexture, new Pixi.Rectangle(0, 16, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(itemsTexture, new Pixi.Rectangle(0, 16, 16, 16));

  return new Entity()
    .add(new BoundingRectangleComponent(new Rectangle(0.25, 0.25, 0.5, 0.75)))
    .add(new InventoryIconComponent(iconTexture, Const.InventorySlot.Backpack, Const.InventorySlot.Hotbar, Const.InventorySlot.Use))
    .add(new LevelIconComponent(iconTexture))
    .add(new ItemComponent(Const.Item.MagicPotion))
    .add(new AnimatedSpriteComponent(frames))
    .add(new PositionComponent(new Vector()))
    ;

}

export function buildItemHpMaxUpPotionEntity(resources) {

  const itemsTexture = resources['items'].texture;

  const frames = [
    new Pixi.Texture(itemsTexture, new Pixi.Rectangle(32, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(itemsTexture, new Pixi.Rectangle(32, 0, 16, 16));

  return new Entity()
    .add(new BoundingRectangleComponent(new Rectangle(0.0625, 0.0625, 0.875, 0.9375)))
    .add(new InventoryIconComponent(iconTexture, Const.InventorySlot.Backpack, Const.InventorySlot.Use))
    .add(new LevelIconComponent(iconTexture))
    .add(new ItemComponent(Const.Item.MaxHpUpPotion))
    .add(new AnimatedSpriteComponent(frames))
    .add(new PositionComponent(new Vector()))
    .add(new StatisticEffectComponent(Const.Statistic.HitPoints, 1, Const.TargetType.Self, Const.StatisticEffectValue.Max))
    ;

}