'use strict';
import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';

export function getCurrentStatisticValues(entity, filter) {
  const statsMap = entity.getAllKeyValueMap('StatisticComponent', 'name', 'currentValue', filter);
  const effects = entity.getAll('StatisticEffectComponent', filter);

  for (const effect of effects) {
    if (!_.has(statsMap, effect.name)) {
      continue;
    }
    statsMap[effect.name] += effect.value;
  }

  return statsMap;
}

export function getPositionedBoundingRect(entity) {
  if (!entity) {
    throw new Error('entity argument required.');
  }

  const posComp = entity.get('PositionComponent');

  if (!posComp) {
    throw new Error('Entity does not have PositionComponent.');
  }

  const boundingRectComp = entity.get('BoundingRectangleComponent');

  if (!boundingRectComp) {
    throw new Error('Entity does not have BoundingRectangleComponent.');
  }

  return boundingRectComp.rectangle.getOffsetBy(posComp.position);
}

export function getInventoryItemDescription(item) {
  if (EntityFinders.isWeapon(item)) {
    if (item.has('MeleeWeaponComponent')) {
      return getMeleeWeaponDetails(item);
    } else {
      return getRangedWeaponDetails(item);
    }
  } else if (EntityFinders.isArmor(item)) {
    return getArmorDetails(item);
  } else if (EntityFinders.isItem(item)) {
    return getItemDetails(item);
  } else {
    return '';
  }
}

export function getMerchantItemDescription(item, hero, entities) {
  let slot = '';
  let compName = '';

  if (EntityFinders.isWeapon(item)) {
    if (item.has('MeleeWeaponComponent')) {
      compName = 'MeleeWeaponComponent';
    } else {
      compName = 'RangedWeaponComponent';
    }
    slot = Const.EquipableInventorySlot.Hand1;
  } else if (EntityFinders.isArmor(item)) {
    compName = 'ArmorComponent';
    const slots = item.get('InventoryIconComponent').allowedSlotTypes;

    let slot = null;
    if (_.includes(slots, Const.EquipableInventorySlot.Body)) {
      slot = Const.EquipableInventorySlot.Body;
    } else if (_.includes(slots, Const.EquipableInventorySlot.Hand2)) {
      slot = Const.EquipableInventorySlot.Hand2;
    } else if (_.includes(slots, Const.EquipableInventorySlot.Head)) {
      slot = Const.EquipableInventorySlot.Head;
    } else if (_.includes(slots, Const.EquipableInventorySlot.Feet)) {
      slot = Const.EquipableInventorySlot.Feet;
    }
  }

  if (compName && slot) {
    let entRef = hero.getAll('EntityReferenceComponent', ref => ref.typeId === slot)[0];
    if (entRef) {
      const comparisonItem = EntityFinders.findById(entities, entRef.entityId);
      if (comparisonItem) {
        let lines = [];
        const comp = item.get(compName);
        lines.push(comp.toInventoryDisplayString());

        buildStatisticComparison(item, comparisonItem, lines);

        return lines.join(Const.Char.LF);
      }
    }
  }

  return getInventoryItemDescription(item);
}

function buildStatisticComparison(item, comparisonItem, outLines) {
  const itemStats = item.getAllKeyed('StatisticComponent', 'name');
  const comparisonItemStats = comparisonItem.getAllKeyed('StatisticComponent', 'name');

  _.forOwn(itemStats, (value, key) => {
    let str = value.toInventoryDisplayString();

    if (_.has(comparisonItemStats, key)) {
      const comparisonComp = comparisonItemStats[key];

      str += ' (' + comparisonComp.maxValue + ')';
    }

    outLines.push(str);
  });
}

function getMeleeWeaponDetails(weaponEnt) {
  const weaponComp = weaponEnt.get('MeleeWeaponComponent');
  const statComps = weaponEnt.getAll('StatisticComponent');

  let str = weaponComp.toInventoryDisplayString() + Const.Char.LF;

  return _.reduce(statComps, (s, c) => s + c.toInventoryDisplayString() + Const.Char.LF, str);
}

function getRangedWeaponDetails(weaponEnt) {
  const weaponComp = weaponEnt.get('RangedWeaponComponent');
  const statComps = weaponEnt.getAll('StatisticComponent');

  let str = weaponComp.toInventoryDisplayString() + Const.Char.LF;

  return _.reduce(statComps, (s, c) => s + c.toInventoryDisplayString() + Const.Char.LF, str);
}

function getArmorDetails(armorEnt) {
  const armorComp = armorEnt.get('ArmorComponent');
  const statComps = armorEnt.getAll('StatisticComponent');

  let str = armorComp.toInventoryDisplayString() + Const.Char.LF;

  return _.reduce(statComps, (s, c) => s + c.toInventoryDisplayString() + Const.Char.LF, str);
}

function getItemDetails(itemEnt) {
  const itemComp = itemEnt.get('ItemComponent');
  const statEffectComps = itemEnt.getAll('StatisticEffectComponent');

  let str = itemComp.toInventoryDisplayString() + Const.Char.LF;

  return _.reduce(statEffectComps, (s, c) => s + c.toInventoryDisplayString() + Const.Char.LF, str);
}
