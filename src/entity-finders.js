import _ from 'lodash';


export function isMob(entity) {
  return entity.has('MobComponent');
}

export function isWeapon(entity) {
  return entity.has('MeleeWeaponComponent') || entity.has('RangedWeaponComponent');
}

export function isArmor(entity) {
  return entity.has('ArmorComponent');
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
  return _.find(entities, e => e.has('LevelHpGuiComponent'));
}

export function findWorldMapButtons(entities) {
  return _.filter(entities, e => e.has('WorldMapButtonComponent'));
}

export function findWorldMapPointer(entities) {
  return _.find(entities, e => e.has('WorldMapPointerComponent'));

}