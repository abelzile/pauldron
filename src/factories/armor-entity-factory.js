import * as Const from '../const';
import ArmorComponent from '../components/armor-component';
import Entity from '../entity';
import InventoryIconComponent from '../components/inventory-icon-component';
import LevelIconComponent from '../components/level-icon-component';
import MovieClipComponent from '../components/movie-clip-component';
import NameComponent from '../components/name-component';
import Pixi from 'pixi.js';
import StatisticComponent from '../components/statistic-component';


export const armorHash = Object.create(null);

armorHash[Const.ArmorType.ChainMail] = Object.create(null);

const ironChainMail = armorHash[Const.ArmorType.ChainMail][Const.ArmorMaterial.Iron] = Object.create(null);
ironChainMail.textureRect = new Pixi.Rectangle(32, 0, 16, 16);
ironChainMail.inventoryEquipSlot = Const.InventorySlot.Body;
ironChainMail.statistics = [
  new StatisticComponent(Const.Statistic.Defense, .10)
];

armorHash[Const.ArmorType.PlateMail] = Object.create(null);

const ironPlateMail = armorHash[Const.ArmorType.PlateMail][Const.ArmorMaterial.Iron] = Object.create(null);
ironPlateMail.textureRect = new Pixi.Rectangle(48, 0, 16, 16);
ironPlateMail.inventoryEquipSlot = Const.InventorySlot.Body;
ironPlateMail.statistics = [
  new StatisticComponent(Const.Statistic.Defense, .20)
];

armorHash[Const.ArmorType.Robe] = Object.create(null);

const clothRobe = armorHash[Const.ArmorType.Robe][Const.ArmorMaterial.Cloth] = Object.create(null);
clothRobe.textureRect = new Pixi.Rectangle(0, 0, 16, 16);
clothRobe.inventoryEquipSlot = Const.InventorySlot.Body;
clothRobe.statistics = [
  new StatisticComponent(Const.Statistic.Defense, .02)
];

armorHash[Const.ArmorType.Shield] = Object.create(null);

const woodShield = armorHash[Const.ArmorType.Shield][Const.ArmorMaterial.Wood] = Object.create(null);
woodShield.textureRect = new Pixi.Rectangle(64, 0, 16, 16);
woodShield.inventoryEquipSlot = Const.InventorySlot.Hand2;
woodShield.statistics = [
  new StatisticComponent(Const.Statistic.Defense, .05)
];

const ironShield = armorHash[Const.ArmorType.Shield][Const.ArmorMaterial.Iron] = Object.create(null);
ironShield.textureRect = new Pixi.Rectangle(80, 0, 16, 16);
ironShield.inventoryEquipSlot = Const.InventorySlot.Hand2;
ironShield.statistics = [
  new StatisticComponent(Const.Statistic.Defense, .10)
];

const steelShield = armorHash[Const.ArmorType.Shield][Const.ArmorMaterial.Steel] = Object.create(null);
steelShield.textureRect = new Pixi.Rectangle(96, 0, 16, 16);
steelShield.inventoryEquipSlot = Const.InventorySlot.Hand2;
steelShield.statistics = [
  new StatisticComponent(Const.Statistic.Defense, .15)
];

armorHash[Const.ArmorType.Tunic] = Object.create(null);

const leatherTunic = armorHash[Const.ArmorType.Tunic][Const.ArmorMaterial.Leather] = Object.create(null);
leatherTunic.textureRect = new Pixi.Rectangle(16, 0, 16, 16);
leatherTunic.inventoryEquipSlot = Const.InventorySlot.Body;
leatherTunic.statistics = [
  new StatisticComponent(Const.Statistic.Defense, .05)
];


export function buildHeroArmorEntity(armorType, material, imageResources) {

  const armorTexture = imageResources['hero_armor'].texture;

  const hash = armorHash[armorType][material];

  if (!hash) { throw new Error(`"${armorType}" and "${material}" is not a valid armor combination.`); }

  const texture = new Pixi.Texture(armorTexture, hash.textureRect);
  const inventoryEquipSlot = hash.inventoryEquipSlot;
  const statistics = hash.statistics;

  return new Entity()
    .add(new ArmorComponent(armorType, material, inventoryEquipSlot))
    .add(new NameComponent())
    .add(new InventoryIconComponent(texture, inventoryEquipSlot, Const.InventorySlot.Backpack))
    .add(new LevelIconComponent(texture))
    .add(new MovieClipComponent([texture]))
    .addRange(statistics);

}