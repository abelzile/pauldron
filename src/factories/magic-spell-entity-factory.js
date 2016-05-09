"use strict";


import * as Const from '../const';
import Entity from '../entity';
import InventoryIconComponent from '../components/inventory-icon-component';
import LevelIconComponent from '../components/level-icon-component';
import MovieClipComponent from '../components/movie-clip-component';
import Pixi from 'pixi.js';
import RangedMagicSpellComponent from '../components/ranged-magic-spell-component';
import StatisticComponent from '../components/statistic-component';


const funcMap = Object.create(null);

funcMap[Const.MagicSpell.Fireball] = function(magicSpellTypeId, resources) {

  const magicSpellTexture = resources['magic_spells'].texture;

  const frames = [
    new Pixi.Texture(magicSpellTexture, new Pixi.Rectangle(0, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(magicSpellTexture, new Pixi.Rectangle(0, 0, 16, 16));
  
  return new Entity()
    .add(new InventoryIconComponent(iconTexture, Const.MagicSpellSlot.Memorized, Const.InventorySlot.Spellbook))
    .add(new LevelIconComponent(iconTexture))
    .add(new MovieClipComponent(frames))
    .add(new RangedMagicSpellComponent(magicSpellTypeId, Const.Projectile.Fireball))
    .add(new StatisticComponent(Const.Statistic.Acceleration, .1))
    .add(new StatisticComponent(Const.Statistic.Damage, 3))
    .add(new StatisticComponent(Const.Statistic.Duration, 1000))
    .add(new StatisticComponent(Const.Statistic.Range, 8))
    ;

};

funcMap[Const.MagicSpell.IceShard] = function(magicSpellTypeId, resources) {

  const magicSpellTexture = resources['magic_spells'].texture;

  const frames = [
    new Pixi.Texture(magicSpellTexture, new Pixi.Rectangle(16, 0, 16, 16))
  ];

  const iconTexture = new Pixi.Texture(magicSpellTexture, new Pixi.Rectangle(16, 0, 16, 16));

  return new Entity()
    .add(new InventoryIconComponent(iconTexture, Const.MagicSpellSlot.Memorized, Const.InventorySlot.Spellbook))
    .add(new LevelIconComponent(iconTexture))
    .add(new MovieClipComponent(frames))
    .add(new RangedMagicSpellComponent(magicSpellTypeId, Const.Projectile.IceShard))
    .add(new StatisticComponent(Const.Statistic.Acceleration, .1))
    .add(new StatisticComponent(Const.Statistic.Damage, 3))
    .add(new StatisticComponent(Const.Statistic.Duration, 1000))
    .add(new StatisticComponent(Const.Statistic.Range, 8))
    ;

};

export function buildMagicSpellEntity(magicSpellTypeId, resources) {

  const func = funcMap[magicSpellTypeId];
  
  if (!func) { throw new Error('No factory method found for magicSpellTypeId: "' + magicSpellTypeId + '".'); }
  
  return func(magicSpellTypeId, resources);

}