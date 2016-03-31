import * as Const from './const';


const MobWeaponMap = Object.create(null);
MobWeaponMap[Const.Mob.BlueSlime] = Const.Weapon.BlueSlimePunch;
MobWeaponMap[Const.Mob.Orc] = Const.Weapon.Axe;
MobWeaponMap[Const.Mob.Skeleton] = Const.Weapon.Bow;
MobWeaponMap[Const.Mob.Zombie] = Const.Weapon.ZombiePunch;

export default MobWeaponMap;
