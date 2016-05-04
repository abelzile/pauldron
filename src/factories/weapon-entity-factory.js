import * as Const from '../const';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import InventoryIconComponent from '../components/inventory-icon-component';
import LevelIconComponent from '../components/level-icon-component';
import MeleeAttackComponent from '../components/melee-attack-component';
import MeleeWeaponComponent from '../components/melee-weapon-component';
import MovementComponent from '../components/movement-component';
import MovieClipComponent from '../components/movie-clip-component';
import Pixi from 'pixi.js';
import PositionComponent from '../components/position-component';
import ProjectileAttackComponent from '../components/projectile-attack-component';
import RangedWeaponComponent from '../components/ranged-weapon-component';
import Rectangle from '../rectangle';
import StatisticComponent from '../components/statistic-component';


export function buildWeaponSwordTemplateEntity(resources) {

  const weaponTexture = resources['weapons'].texture;

  const frames = [
    new Pixi.Texture(weaponTexture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(weaponTexture, new Pixi.Rectangle(0, 0, 16, 16));

  return new Entity()
    .add(new InventoryIconComponent(iconTexture, Const.InventorySlot.Hand1, Const.InventorySlot.Backpack))
    .add(new LevelIconComponent(iconTexture))
    .add(new MeleeAttackComponent())
    .add(new MeleeWeaponComponent(Const.Weapon.Sword, Const.Handedness.OneHanded))
    .add(new StatisticComponent(Const.Statistic.Damage, 5))
    .add(new StatisticComponent(Const.Statistic.Range, 2))
    .add(new StatisticComponent(Const.Statistic.Duration, 200))
    .add(new StatisticComponent(Const.Statistic.Arc, Const.RadiansOf90Degrees))
    .add(new MovieClipComponent(frames))
    ;

}

export function buildWeaponBlueSlimePunchTemplateEntity() {

  return new Entity()
    .add(new MeleeAttackComponent())
    .add(new MeleeWeaponComponent(Const.Weapon.BlueSlimePunch, Const.Handedness.OneHanded))
    .add(new StatisticComponent(Const.Statistic.Damage, 2))
    .add(new StatisticComponent(Const.Statistic.Range, .6))
    .add(new StatisticComponent(Const.Statistic.Duration, 200))
    .add(new StatisticComponent(Const.Statistic.Arc, Const.RadiansOf360Degrees))
    //TODO:movie clip component
    ;

}

export function buildWeaponAxeTemplateEntity() {

  return new Entity()
    .add(new MeleeAttackComponent())
    .add(new MeleeWeaponComponent(Const.Weapon.Axe, Const.Handedness.OneHanded, 300, 2, Const.RadiansOf90Degrees))
    //TODO:movie clip component
    ;

}

export function buildWeaponBowTemplateEntity(resources) {

  const weaponTexture = resources['weapons'].texture;

  const frames = [
    new Pixi.Texture(weaponTexture, new Pixi.Rectangle(0, 32, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(weaponTexture, new Pixi.Rectangle(0, 32, 16, 16));

  return new Entity()
    .add(new InventoryIconComponent(iconTexture, Const.InventorySlot.Hand1, Const.InventorySlot.Backpack))
    .add(new LevelIconComponent(iconTexture))
    .add(new MovieClipComponent(frames))
    .add(new RangedWeaponComponent(Const.Weapon.Bow, Const.Handedness.TwoHanded, Const.Projectile.Arrow/*, 1000, 8, 0.1, 3*/))
    .add(new StatisticComponent(Const.Statistic.Duration, 1000))
    .add(new StatisticComponent(Const.Statistic.Range, 8))
    .add(new StatisticComponent(Const.Statistic.Acceleration, .1))
    .add(new StatisticComponent(Const.Statistic.Damage, 3))
    ;
}

export function buildProjectileArrowTemplateEntity(resources) {

  const frames = [
    new Pixi.Texture(resources['projectiles'].texture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  return new Entity()
    .add(new BoundingRectangleComponent(new Rectangle(0.25, 0.25, 0.5, 0.5)))
    .add(new MovementComponent())
    .add(new MovieClipComponent(frames))
    .add(new PositionComponent())
    .add(new ProjectileAttackComponent())
    .add(new StatisticComponent(Const.Statistic.Acceleration, 0.06))
    ;

}

export function buildWeaponZombiePunchTemplateEntity() {

  return new Entity()
    .add(new MeleeAttackComponent())
    .add(new MeleeWeaponComponent(Const.Weapon.ZombiePunch, Const.Handedness.OneHanded, 200, 0.6, Const.RadiansOf360Degrees))
    //TODO:movie clip component
    ;

}
