import * as EntityFinders from './entity-finders';

export function sortInventory(a, b) {
  const sortOrder = [
    EntityFinders.isMagicSpell,
    EntityFinders.isWeapon,
    EntityFinders.isHeavyArmor,
    EntityFinders.isLightArmor,
    EntityFinders.isHelmet,
    EntityFinders.isBoots
  ];

  let aVal = sortOrder.length;

  for (let i = 0; i < sortOrder.length; ++i) {
    if (sortOrder[i](a)) {
      aVal = i;
      break;
    }
  }

  let bVal = sortOrder.length;

  for (let i = 0; i < sortOrder.length; ++i) {
    if (sortOrder[i](b)) {
      bVal = i;
      break;
    }
  }

  return bVal - aVal;
}
