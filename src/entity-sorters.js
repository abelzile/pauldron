import * as EntityFinders from './entity-finders';


export function sortInventory(a, b) {

  let aVal = 0;
  let bVal = 0;

  const magicSpellSortVal = 3;
  const weaponSortVal = 2;
  const armorSortVal = 1;
  const otherSortVal = 0;

  if (EntityFinders.isMagicSpell(a)) {
    aVal = magicSpellSortVal;
  } else if (EntityFinders.isWeapon(a)) {
    aVal = weaponSortVal;
  } else if (EntityFinders.isArmor(a)) {
    aVal = armorSortVal;
  } else {
    aVal = otherSortVal;
  }

  if (EntityFinders.isMagicSpell(b)) {
    bVal = magicSpellSortVal;
  } else if (EntityFinders.isWeapon(b)) {
    bVal = weaponSortVal;
  } else if (EntityFinders.isArmor(b)) {
    bVal = armorSortVal;
  } else {
    bVal = otherSortVal;
  }

  if (aVal < bVal) { return -1; }
  if (aVal > bVal) { return 1; }
  return 0;

}
