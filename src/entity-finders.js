"use strict";
import _ from 'lodash';


export function isMob(entity) {

  if (!entity) { return false; }

  return entity.has('MobComponent');

}

export function isWeapon(entity) {

  if (!entity) { return false; }

  return entity.hasAny('MeleeWeaponComponent', 'RangedWeaponComponent');

}

export function isArmor(entity) {

  if (!entity) { return false; }

  return entity.has('ArmorComponent');

}

export function isItem(entity) {

  if (!entity) { return false; }

  return entity.has('ItemComponent');

}

export function findById(entities, id) {

  if (!id) { return undefined; }

  return _.find(entities, e => e.id === id);

}

export function findMainMenuItems(entities) {
  return _.filter(entities, e => e.has('MainMenuItemSpriteComponent'));
}

export function findLevels(entities) {
  return _.filter(entities, e => e.has('TileMapComponent') && e.has('NameComponent'));
}

export function findLevelByName(entities, name) {
  return _.find(entities, e => e.has('TileMapComponent') && e.has('NameComponent') && e.get('NameComponent').name === name);
}

export function findMobs(entities, mobAiCmponentName = '') {

  const filtered = _.filter(entities, e => isMob(e));

  if (mobAiCmponentName !== '') {
    return _.filter(filtered, e => e.has(mobAiCmponentName));
  }

  return filtered;

}

export function findWeapons(entities) {
  return _.filter(entities, isWeapon);
}

export function findArmors(entities) {
  return _.filter(entities, isArmor);
}

export function findProjectiles(entities) {
  return _.filter(entities, e => e.has('ProjectileAttackComponent'));
}

export function findInventory(entities) {
  return _.find(entities, e => e.has('InventoryBackgroundComponent'));
}

export function findContainers(entities) {
  return _.filter(entities, e => e.has('ContainerComponent'));
}

export function findItems(entities) {
  return _.filter(entities, e => e.has('ItemComponent'));
}

export function findReferencedIn(entities, entityRefComps) {
  return _.filter(entities, e => _.find(entityRefComps, c => c.entityId === e.id));
}

export function findLevelGui(entities) {
  return _.find(entities, e => e.has('LevelStatisticBarComponent'));
}

export function findWorldMapGui(entities) {
  return _.find(entities, e => e.has('WorldMapPointerComponent'));
}

export function findDefeatSplash(entities) {
  return _.find(entities, e => e.has('DefeatTextComponent'));
}

export function findVictorySplash(entities) {
  return _.find(entities, e => e.has('VictoryTextComponent'));
}

export function findMagicSpells(entities) {
  return _.filter(entities, e => e.hasAny('RangedMagicSpellComponent', 'SelfMagicSpellComponent'));
}