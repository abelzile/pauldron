'use strict';
import * as Const from '../const';
import _ from 'lodash';
import Entity from '../entity';
import InventoryIconComponent from '../components/inventory-icon-component';
import LevelIconComponent from '../components/level-icon-component';
import MeleeAttackComponent from '../components/melee-attack-component';
import MeleeWeaponComponent from '../components/melee-weapon-component';
import AnimatedSpriteComponent from '../components/animated-sprite-component';
import AnimatedSpriteSettingsComponent from '../components/animated-sprite-settings-component';
import * as Pixi from 'pixi.js';
import RangedAttackComponent from '../components/ranged-attack-component';
import RangedWeaponComponent from '../components/ranged-weapon-component';
import StatisticComponent from '../components/statistic-component';


const weaponFuncs = Object.create(null);
_.forOwn(Const.WeaponType, (val, key) => { weaponFuncs[val] = Object.create(null); });

weaponFuncs[Const.WeaponType.BlueSlimePunch][Const.WeaponMaterial.Flesh] = function(weaponTypeId, weaponMaterialTypeId, imageResources) {

  return new Entity()
    .add(new MeleeAttackComponent())
    .add(new MeleeWeaponComponent(weaponTypeId, weaponMaterialTypeId, Const.Handedness.OneHanded, Const.AttackShape.Slash, 0xffffff, 0xffffff, 0xb4ecfc))
    .add(new StatisticComponent(Const.Statistic.Damage, 2))
    .add(new StatisticComponent(Const.Statistic.Range, .6))
    .add(new StatisticComponent(Const.Statistic.Duration, 200))
    .add(new StatisticComponent(Const.Statistic.Arc, Const.RadiansOf90Degrees))
    .add(new StatisticComponent(Const.Statistic.KnockBackDuration, 200))
    ;

};

weaponFuncs[Const.WeaponType.Sword][Const.WeaponMaterial.Iron] = function(weaponTypeId, weaponMaterialTypeId, imageResources) {

  const weaponTexture = imageResources['weapons'].texture;

  const frames = [
    new Pixi.Texture(weaponTexture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(weaponTexture, new Pixi.Rectangle(0, 0, 16, 16));

  const mc = new AnimatedSpriteComponent(frames);
  mc.anchor.x = 0;
  mc.anchor.y = 1;
  mc.pivot.x = 0;
  mc.pivot.y = 1;

  const mcSettings1 = new AnimatedSpriteSettingsComponent('neutral');
  mcSettings1.positionOffset.x = 6;
  mcSettings1.positionOffset.y = 14;
  mcSettings1.rotation = 5.061;

  return new Entity()
    .add(mc)
    .add(mcSettings1)
    .add(new InventoryIconComponent(iconTexture, Const.InventorySlot.Hand1, Const.InventorySlot.Backpack))
    .add(new LevelIconComponent(iconTexture))
    .add(new MeleeAttackComponent())
    .add(new MeleeWeaponComponent(weaponTypeId, weaponMaterialTypeId, Const.Handedness.OneHanded, Const.AttackShape.Slash, 0xffffff, /*0xdddddd*/0xffffff, 0xace8fc))
    .add(new StatisticComponent(Const.Statistic.Arc, Const.RadiansOf90Degrees))
    .add(new StatisticComponent(Const.Statistic.Damage, 5))
    .add(new StatisticComponent(Const.Statistic.Duration, 200))
    .add(new StatisticComponent(Const.Statistic.KnockBackDuration, 200))
    .add(new StatisticComponent(Const.Statistic.Range, 2))
    ;

};

weaponFuncs[Const.WeaponType.Staff][Const.WeaponMaterial.Wood] = function(weaponTypeId, weaponMaterialTypeId, imageResources) {

  const weaponTexture = imageResources['weapons'].texture;

  const frames = [
    new Pixi.Texture(weaponTexture, new Pixi.Rectangle(32, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(weaponTexture, new Pixi.Rectangle(32, 0, 16, 16));

  const mc = new AnimatedSpriteComponent(frames);
  mc.anchor.x = 0;
  mc.anchor.y = 1;
  mc.pivot.x = 0;
  mc.pivot.y = 1;

  const mcSettings1 = new AnimatedSpriteSettingsComponent('neutral');
  mcSettings1.positionOffset.x = 6;
  mcSettings1.positionOffset.y = 18;
  mcSettings1.rotation = 5.3;

  return new Entity()
    .add(mc)
    .add(mcSettings1)
    .add(new InventoryIconComponent(iconTexture, Const.InventorySlot.Hand1, Const.InventorySlot.Backpack))
    .add(new LevelIconComponent(iconTexture))
    .add(new MeleeAttackComponent())
    .add(new MeleeWeaponComponent(weaponTypeId, weaponMaterialTypeId, Const.Handedness.TwoHanded, 0xb17a47, 0xf7e6d7))
    .add(new StatisticComponent(Const.Statistic.Arc, Const.RadiansOf180Degrees))
    .add(new StatisticComponent(Const.Statistic.Damage, 3))
    .add(new StatisticComponent(Const.Statistic.Duration, 300))
    .add(new StatisticComponent(Const.Statistic.KnockBackDuration, 400))
    .add(new StatisticComponent(Const.Statistic.Range, 2))
    ;

};

weaponFuncs[Const.WeaponType.Bow][Const.WeaponMaterial.Wood] = function (weaponTypeId, weaponMaterialTypeId, imageResources) {

  const weaponTexture = imageResources['weapons'].texture;

  const frames = [
    new Pixi.Texture(weaponTexture, new Pixi.Rectangle(48, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(weaponTexture, new Pixi.Rectangle(48, 0, 16, 16));

  const mc = new AnimatedSpriteComponent(frames);
  mc.anchor.x = .5;
  mc.anchor.y = .5;
  mc.pivot.x = .5;
  mc.pivot.y = .5;

  const mcSettings1 = new AnimatedSpriteSettingsComponent('neutral');
  mcSettings1.positionOffset.x = 11;
  mcSettings1.positionOffset.y = 11;
  mcSettings1.rotation = 0.4;

  return new Entity()
    .add(mc)
    .add(mcSettings1)
    .add(new InventoryIconComponent(iconTexture, Const.InventorySlot.Hand1, Const.InventorySlot.Backpack))
    .add(new LevelIconComponent(iconTexture))
    .add(new RangedAttackComponent())
    .add(new RangedWeaponComponent(weaponTypeId, weaponMaterialTypeId, Const.Handedness.TwoHanded, Const.Projectile.Arrow))
    .add(new StatisticComponent(Const.Statistic.Acceleration, .1))
    .add(new StatisticComponent(Const.Statistic.Damage, 3))
    .add(new StatisticComponent(Const.Statistic.Duration, 1000))
    .add(new StatisticComponent(Const.Statistic.KnockBackDuration, 200))
    .add(new StatisticComponent(Const.Statistic.Range, 8))
    ;

};

weaponFuncs[Const.WeaponType.ZombiePunch][Const.WeaponMaterial.Flesh] = function(weaponTypeId, weaponMaterialTypeId, imageResources) {

  return new Entity()
    .add(new MeleeAttackComponent())
    .add(new MeleeWeaponComponent(weaponTypeId, weaponMaterialTypeId, Const.Handedness.OneHanded))
    .add(new StatisticComponent(Const.Statistic.Damage, 2))
    .add(new StatisticComponent(Const.Statistic.Range, .6))
    .add(new StatisticComponent(Const.Statistic.Duration, 200))
    .add(new StatisticComponent(Const.Statistic.Arc, Const.RadiansOf360Degrees))
    .add(new StatisticComponent(Const.Statistic.KnockBackDuration, 200))
    //TODO:movie clip component
    ;

};

weaponFuncs[Const.WeaponType.Axe][Const.WeaponMaterial.Iron] = function(weaponTypeId, weaponMaterialTypeId, imageResources) {

  const weaponTexture = imageResources['weapons'].texture;

  const frames = [
    new Pixi.Texture(weaponTexture, new Pixi.Rectangle(16, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(weaponTexture, new Pixi.Rectangle(16, 0, 16, 16));

  const mc = new AnimatedSpriteComponent(frames);
  mc.anchor.x = 0;
  mc.anchor.y = 1;
  mc.pivot.x = 0;
  mc.pivot.y = 1;

  const mcSettings1 = new AnimatedSpriteSettingsComponent('neutral');
  mcSettings1.positionOffset.x = 6;
  mcSettings1.positionOffset.y = 14;
  mcSettings1.rotation = 5.061;

  return new Entity()
    .add(mc)
    .add(mcSettings1)
    .add(new InventoryIconComponent(iconTexture, Const.InventorySlot.Hand1, Const.InventorySlot.Backpack))
    .add(new LevelIconComponent(iconTexture))
    .add(new MeleeAttackComponent())
    .add(new MeleeWeaponComponent(weaponTypeId, weaponMaterialTypeId, Const.Handedness.OneHanded, Const.AttackShape.Slash, 0xffffff, 0xdddddd, 0xace8fc))
    .add(new StatisticComponent(Const.Statistic.Arc, Const.RadiansOf90Degrees))
    .add(new StatisticComponent(Const.Statistic.Damage, 5))
    .add(new StatisticComponent(Const.Statistic.Duration, 200))
    .add(new StatisticComponent(Const.Statistic.KnockBackDuration, 200))
    .add(new StatisticComponent(Const.Statistic.Range, 2))
    ;

};

export function buildWeapon(weaponTypeId, weaponMaterialTypeId, imageResources) {

  const func = weaponFuncs[weaponTypeId][weaponMaterialTypeId];

  if (!func) { throw new Error(`"${weaponTypeId}" and "${weaponMaterialTypeId}" is not a valid weapon combination.`); }

  return func(weaponTypeId, weaponMaterialTypeId, imageResources)
    .setTags('weapon');

}