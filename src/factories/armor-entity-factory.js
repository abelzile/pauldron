import * as Const from '../const';
import ArmorComponent from '../components/armor-component';
import Entity from '../entity';
import InventoryIconComponent from '../components/inventory-icon-component';
import LevelIconComponent from '../components/level-icon-component';
import MovieClipComponent from '../components/movie-clip-component';
import NameComponent from '../components/name-component';
import Pixi from 'pixi.js';
import StatisticComponent from '../components/statistic-component';


export function buildHeroArmorEntity(armorType, material, imageResources) {

  const armorTexture = imageResources['hero_armor'].texture;

  const texture = getArmorTexture(armorTexture, armorType, material);

  return new Entity()
    .add(new ArmorComponent(armorType, material, Const.InventorySlot.Body))
    .add(new NameComponent())
    .add(new InventoryIconComponent(texture, Const.InventorySlot.Body, Const.InventorySlot.Backpack))
    .add(new LevelIconComponent(texture))
    .add(new MovieClipComponent([texture]))
    .addRange(getArmorStatistics(armorType, material));

}

function getArmorTexture(armorTexture, armorType, material) {

  switch (armorType + material) {
    case Const.BodyArmorType.Robe + Const.ArmorMaterial.Cloth:
      return new Pixi.Texture(armorTexture, new Pixi.Rectangle(0, 0, 16, 16));
    case Const.BodyArmorType.Tunic + Const.ArmorMaterial.Leather:
      return new Pixi.Texture(armorTexture, new Pixi.Rectangle(16, 0, 16, 16));
    case Const.BodyArmorType.ChainMail + Const.ArmorMaterial.Iron:
      return new Pixi.Texture(armorTexture, new Pixi.Rectangle(32, 0, 16, 16));
    case Const.BodyArmorType.Plate + Const.ArmorMaterial.Iron:
      return new Pixi.Texture(armorTexture, new Pixi.Rectangle(48, 0, 16, 16));
    default:
      throw new Error(`"${armorType}" and "${material}" is not a valid armor combination.`);
  }

}

function getArmorStatistics(armorType, material) {

  switch (armorType + material) {
    case Const.BodyArmorType.Robe + Const.ArmorMaterial.Cloth:
      return [
        new StatisticComponent(Const.Statistic.Defense, .02)
      ];
    case Const.BodyArmorType.Tunic + Const.ArmorMaterial.Leather:
      return [
        new StatisticComponent(Const.Statistic.Defense, .05)
      ];
    case Const.BodyArmorType.ChainMail + Const.ArmorMaterial.Iron:
      return [
        new StatisticComponent(Const.Statistic.Defense, .10)
      ];
    case Const.BodyArmorType.Plate + Const.ArmorMaterial.Iron:
      return [
        new StatisticComponent(Const.Statistic.Defense, .20)
      ];
    default:
      throw new Error(`"${armorType}" and "${material}" is not a valid armor combination.`);
  }
  
}