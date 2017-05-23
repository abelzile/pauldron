'use strict';
import * as _ from 'lodash';
import * as Const from './const';

export function isDeleted(entity) {
  return entity && entity.deleted === true;
}

export function isMob(entity) {
  return entity && entity.hasTag('mob');
}

export function isWeapon(entity) {
  return entity && entity.hasTag('weapon');
}

export function isArmor(entity) {
  return entity && entity.hasTag('armor');
}

export function isItem(entity) {
  return entity && entity.has('ItemComponent');
}

export function isMagicSpell(entity) {
  return entity && entity.hasAny('RangedMagicSpellComponent', 'SelfMagicSpellComponent');
}

export function isCharacterClass(entity) {
  return entity && entity.hasTag('character_class');
}

export function isProjectile(entity) {
  return entity && entity.hasTag('projectile');
}

export function isLevel(entity) {
  return entity && entity.hasTag('level');
}

export function isLevelGui(entity) {
  return entity && entity.hasTag('level_gui');
}

export function isParticleEmitter(entity) {
  return entity && entity.has('ParticleEmitterComponent');
}

export function isMerchantMob(entity) {
  return entity && entity.has('MerchantComponent');
}

export function isHostileMob(entity) {
  if (!entity) {
    return false;
  }

  const mobComponent = entity.get('MobComponent');

  return mobComponent && mobComponent.isHostile;
}

export function isFriendlyMob(entity) {
  return !isHostileMob(entity);
}

export function findById(entities, id) {
  for (let i = 0; i < entities.length; ++i) {
    const e = entities[i];

    if (e.id === id) {
      return e;
    }
  }

  return null;
}

export function findMainMenu(entities) {
  return _.find(entities, e => e.has('MainMenuItemSpriteComponent'));
}

export function findMainMenuItems(entities) {
  return _.filter(entities, e => e.has('MainMenuItemSpriteComponent'));
}

export function findLevels(entities) {
  return _.filter(entities, isLevel);
}

export function findLevelByName(entities, name) {
  return _.find(findLevels(entities), e => e.get('NameComponent').name === name);
}

export function hasComponent(entity, name) {
  return entity.has(name);
}

export function findMobs(entities, mobAiComponentName = '') {
  const mobs = _.filter(entities, isMob);

  if (mobAiComponentName) {
    return _.filter(mobs, _.ary(_.partialRight(hasComponent, mobAiComponentName), 1));
  }

  return mobs;
}

export function findMerchantMobs(entities) {
  return findMobs(entities, 'MerchantComponent');
}

export function findHostileMobs(entities) {
  return _.filter(findMobs(entities), isHostileMob);
}

export function findFriendlyMobs(entities) {
  return _.filter(findMobs(entities), isFriendlyMob);
}

export function findWeapons(entities) {
  return _.filter(entities, isWeapon);
}

export function findArmors(entities) {
  return _.filter(entities, isArmor);
}

export function findProjectiles(entities) {
  return _.filter(entities, isProjectile);
}

export function findInventoryGui(entities) {
  return findById(entities, Const.EntityId.InventoryGui);
}

export function findSpellBook(entities) {
  return _.find(entities, e => e.has('SpellBookBackgroundComponent'));
}

export function findContainers(entities) {
  return _.filter(entities, e => e.has('ContainerComponent'));
}

export function findItems(entities) {
  return _.filter(entities, isItem);
}

export function findReferencedIn(entities, entityRefComps) {
  return _.filter(entities, e => _.find(entityRefComps, c => c.entityId === e.id));
}

export function findLevelGui(entities) {
  return _.find(entities, isLevelGui);
}

export function findWorldMapGui(entities) {
  return findById(entities, Const.EntityId.WorldMapGui);
}

export function findDefeatSplash(entities) {
  return _.find(entities, e => e.has('DefeatTextComponent'));
}

export function findVictorySplash(entities) {
  return _.find(entities, e => e.has('VictoryTextComponent'));
}

export function findMagicSpells(entities) {
  return _.filter(entities, isMagicSpell);
}

export function findCharacterCreationGui(entities) {
  return findById(entities, Const.EntityId.CharacterCreationGui);
}

export function findCharacterClasses(entities) {
  return _.filter(entities, isCharacterClass);
}

export function findAbilitiesGui(entities) {
  return findById(entities, Const.EntityId.AbilitiesGui);
}

export function findParticleEmitters(entities) {
  return _.filter(entities, isParticleEmitter);
}

export function findLevelMapGui(entities) {
  return findById(entities, Const.EntityId.LevelMapGui);
}

export function findMerchantShopGui(entities) {
  return findById(entities, Const.EntityId.MerchantShopGui);
}