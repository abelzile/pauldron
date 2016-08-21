import * as Const from './const';


export const MobWeaponMap = Object.create(null);

MobWeaponMap[Const.Mob.BlueSlime] = {
  weaponTypeId: Const.WeaponType.BlueSlimePunch,
  weaponMaterialTypeId: Const.WeaponMaterial.Flesh,
};

MobWeaponMap[Const.Mob.Orc] = {
  weaponTypeId: Const.WeaponType.Axe,
  weaponMaterialTypeId: Const.WeaponMaterial.Iron,
};

MobWeaponMap[Const.Mob.Skeleton] = {
  weaponTypeId: Const.WeaponType.Bow,
  weaponMaterialTypeId: Const.WeaponMaterial.Wood,
};

MobWeaponMap[Const.Mob.Zombie] = {
  weaponTypeId: Const.WeaponType.ZombiePunch,
  weaponMaterialTypeId: Const.WeaponMaterial.Flesh,
};

export const MobMagicSpellMap = {};
MobMagicSpellMap[Const.Mob.Skeleton] = Const.MagicSpell.Fireball;



