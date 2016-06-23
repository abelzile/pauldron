import * as Const from '../const';
import ArmorComponent from '../components/armor-component';
import Entity from '../entity';
import InventoryIconComponent from '../components/inventory-icon-component';
import LevelIconComponent from '../components/level-icon-component';
import MovieClipComponent from '../components/movie-clip-component';
import NameComponent from '../components/name-component';
import Pixi from 'pixi.js';
import StatisticComponent from '../components/statistic-component';


const heroArmorHash = Object.create(null);
heroArmorHash[Const.ArmorType.ChainMail] = Object.create(null);
heroArmorHash[Const.ArmorType.PlateMail] = Object.create(null);
heroArmorHash[Const.ArmorType.Robe] = Object.create(null);
heroArmorHash[Const.ArmorType.Shield] = Object.create(null);
heroArmorHash[Const.ArmorType.Tunic] = Object.create(null);

const ironChainMail = heroArmorHash[Const.ArmorType.ChainMail][Const.ArmorMaterial.Iron] = Object.create(null);
ironChainMail.textureRect = new Pixi.Rectangle(32, 0, 16, 16);
ironChainMail.inventoryEquipSlot = Const.InventorySlot.Body;
ironChainMail.statistics = [
  new StatisticComponent(Const.Statistic.Defense, .10)
];

const ironPlateMail = heroArmorHash[Const.ArmorType.PlateMail][Const.ArmorMaterial.Iron] = Object.create(null);
ironPlateMail.textureRect = new Pixi.Rectangle(48, 0, 16, 16);
ironPlateMail.inventoryEquipSlot = Const.InventorySlot.Body;
ironPlateMail.statistics = [
  new StatisticComponent(Const.Statistic.Defense, .20)
];

const clothRobe = heroArmorHash[Const.ArmorType.Robe][Const.ArmorMaterial.Cloth] = Object.create(null);
clothRobe.textureRect = new Pixi.Rectangle(0, 0, 16, 16);
clothRobe.inventoryEquipSlot = Const.InventorySlot.Body;
clothRobe.statistics = [
  new StatisticComponent(Const.Statistic.Defense, .02)
];

const woodShield = heroArmorHash[Const.ArmorType.Shield][Const.ArmorMaterial.Wood] = Object.create(null);
woodShield.textureRect = new Pixi.Rectangle(64, 0, 16, 16);
woodShield.inventoryEquipSlot = Const.InventorySlot.Hand2;
woodShield.statistics = [
  new StatisticComponent(Const.Statistic.Defense, .05)
];

const ironShield = heroArmorHash[Const.ArmorType.Shield][Const.ArmorMaterial.Iron] = Object.create(null);
ironShield.textureRect = new Pixi.Rectangle(80, 0, 16, 16);
ironShield.inventoryEquipSlot = Const.InventorySlot.Hand2;
ironShield.statistics = [
  new StatisticComponent(Const.Statistic.Defense, .10)
];

const steelShield = heroArmorHash[Const.ArmorType.Shield][Const.ArmorMaterial.Steel] = Object.create(null);
steelShield.textureRect = new Pixi.Rectangle(96, 0, 16, 16);
steelShield.inventoryEquipSlot = Const.InventorySlot.Hand2;
steelShield.statistics = [
  new StatisticComponent(Const.Statistic.Defense, .15)
];

const leatherTunic = heroArmorHash[Const.ArmorType.Tunic][Const.ArmorMaterial.Leather] = Object.create(null);
leatherTunic.textureRect = new Pixi.Rectangle(16, 0, 16, 16);
leatherTunic.inventoryEquipSlot = Const.InventorySlot.Body;
leatherTunic.statistics = [
  new StatisticComponent(Const.Statistic.Defense, .05)
];


export function buildHeroArmorEntity(armorTypeId, material, imageResources) {

  const armorTexture = imageResources['hero_armor'].texture;

  const hash = heroArmorHash[armorTypeId][material];

  if (!hash) { throw new Error(`"${armorTypeId}" and "${material}" is not a valid hero armor combination.`); }

  const texture = new Pixi.Texture(armorTexture, hash.textureRect);
  const inventoryEquipSlot = hash.inventoryEquipSlot;
  const statistics = hash.statistics;

  return new Entity()
    .add(new ArmorComponent(armorTypeId, material, inventoryEquipSlot))
    .add(new NameComponent())
    .add(new InventoryIconComponent(texture, inventoryEquipSlot, Const.InventorySlot.Backpack))
    .add(new LevelIconComponent(texture))
    .add(new MovieClipComponent([texture]))
    .addRange(statistics);

}