import * as EntityFinders from './entity-finders';

export function sortInventory(a, b) {
  const sortOrder = [
    EntityFinders.isBoots,
    EntityFinders.isHelmet,
    EntityFinders.isLightArmor,
    EntityFinders.isMediumArmor,
    EntityFinders.isHeavyArmor,
    EntityFinders.isWeapon,
    EntityFinders.isMagicSpell
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

  return aVal - bVal;
}
