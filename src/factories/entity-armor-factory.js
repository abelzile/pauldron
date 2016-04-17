import * as Const from '../const';
import ArmorComponent from '../components/armor-component';
import Entity from '../entity';
import InventoryIconComponent from '../components/inventory-icon-component';
import LevelIconComponent from '../components/level-icon-component';
import MovieClipComponent from '../components/movie-clip-component';
import Pixi from 'pixi.js';


export function buildArmorHeroLeatherTemplateEntity(resources) {

  const armorTexture = resources['hero_armor'].texture;

  const frames = [
    new Pixi.Texture(armorTexture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(armorTexture, new Pixi.Rectangle(0, 0, 16, 16));

  return new Entity()
    .add(new ArmorComponent(Const.InventorySlot.Body))
    .add(new InventoryIconComponent(iconTexture, Const.InventorySlot.Body, Const.InventorySlot.Backpack))
    .add(new LevelIconComponent(iconTexture))
    .add(new MovieClipComponent(frames))
    ;

}
