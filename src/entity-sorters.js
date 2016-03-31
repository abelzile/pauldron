import * as EntityFinders from './entity-finders';


export function sortInventory(a, b) {

  let aVal = 0;
  let bVal = 0;

  if (EntityFinders.isWeapon(a)) {
    aVal = 2;
  } else if (EntityFinders.isArmor(a)) {
    aVal = 1;
  } else {
    aVal = 0;
  }

  if (EntityFinders.isWeapon(b)) {
    bVal = 2;
  } else if (EntityFinders.isArmor(b)) {
    bVal = 1;
  } else {
    bVal = 0;
  }

  if (aVal < bVal) { return -1; }
  if (aVal > bVal) { return 1; }
  return 0;

}
