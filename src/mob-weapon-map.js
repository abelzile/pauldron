import * as Const from './const';


export const MobWeaponMap = Object.create(null);

MobWeaponMap[Const.Mob.Orc] = {
  typeId: Const.WeaponType.Axe,
  materialTypeId: Const.WeaponMaterial.Iron,
};

MobWeaponMap[Const.Mob.Skeleton] = {
  typeId: Const.WeaponType.Bow,
  materialTypeId: Const.WeaponMaterial.Wood,
};

MobWeaponMap[Const.Mob.Zombie] = {
  typeId: Const.WeaponType.ZombiePunch,
  materialTypeId: Const.WeaponMaterial.Flesh,
};

export const MobMagicSpellMap = {};
/*MobMagicSpellMap[Const.Mob.Skeleton] = Const.MagicSpell.Fireball;*/



