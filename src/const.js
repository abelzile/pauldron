import * as EnumUtils from './utils/enum-utils';
import * as ObjectUtils from './utils/object-utils';
import * as Pixi from 'pixi.js';

export const ScreenWidth = 1280;
export const ScreenHeight = 720;
export const ScreenScale = 3;
export const TilePixelSize = 16;

export const ViewPortTileWidth = 32;
export const ViewPortTileHeight = 20;

export const RadiansOf1Degree = Math.PI * 2.0 / 360;
export const RadiansOf22Point5Degrees = Math.PI / 8.0;
export const RadiansOf45Degrees = Math.PI / 4.0;
export const RadiansOf90Degrees = RadiansOf45Degrees * 2.0;
export const RadiansOf180Degrees = RadiansOf90Degrees * 2.0;
export const RadiansOf270Degrees = RadiansOf90Degrees * 3.0;
export const RadiansOf360Degrees = RadiansOf90Degrees * 4.0;

export const RadiansPiOver4 = RadiansOf45Degrees;
export const RadiansPiOver2 = RadiansOf90Degrees;
export const RadiansPi = RadiansOf180Degrees;
export const Radians3PiOver2 = RadiansOf270Degrees;
export const Radians2Pi = RadiansOf360Degrees;

export const EntityId = ObjectUtils.createImmutable({
  AbilitiesGui: '__abilities_gui__',
  CharacterCreationGui: '__character_creation_gui__',
  DeletedEntityEmitterHolder: '__deleted_entity_emitter_holder_id__',
  Hero: '__hero__',
  HeroLevelTable: '__hero_level_table__',
  InventoryGui: '__inventory_gui__',
  LevelMapGui: '__level_map_gui__',
  MerchantShopGui: '__merchant_shop_gui__',
  World: '__world__',
  WorldMapGui: '__world_map_gui__',
  LevelGui: '__level_gui__',
  LoadingGui: '__loading_gui__',
  MainMenuGui: '__main_menu_gui__',
  VictoryGui: '__victory_gui__',
  DefeatGui: '__defeat_gui__'
});

export const Button = EnumUtils.create({
  LeftMouse: 'LEFT_MOUSE',
  MiddleMouse: 'MIDDLE_MOUSE',
  RightMouse: 'RIGHT_MOUSE',
  Backspace: 8,
  Tab: 9,
  Enter: 13,
  Shift: 16,
  Ctrl: 17,
  Alt: 18,
  Pause: 19,
  CapsLock: 20,
  Esc: 27,
  Space: 32,
  PageUp: 33,
  PageDown: 34,
  End: 35,
  Home: 36,
  LeftArrow: 37,
  UpArrow: 38,
  RightArrow: 39,
  DownArrow: 40,
  Insert: 45,
  Delete: 46,
  Zero: 48,
  One: 49,
  Two: 50,
  Three: 51,
  Four: 52,
  Five: 53,
  Six: 54,
  Seven: 55,
  Eight: 56,
  Nine: 57,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  NumLock: 144,
  ScrollLock: 145,
  SemiColon: 186,
  Equals: 187,
  Comma: 188,
  Dash: 189,
  Period: 190,
  ForwardSlash: 191,
  GraveAccent: 192,
  OpenSquareBracket: 219,
  BackSlash: 220,
  CloseSquareBracket: 221,
  SingleQuote: 222
});

export const Direction = EnumUtils.create({
  None: 0,
  North: 1,
  South: 2,
  East: 3,
  West: 4
});

export const WorldLevelType = EnumUtils.create({
  Graveyard: 'graveyard',
  Swamp: 'swamp',
  Winter: 'winter',
  Woodland: 'woodland',
  Desert: 'desert',
  Lava: 'lava',
  Mushroom: 'mushroom',
  Stone: 'stone',
  Ruins: 'ruins'
});

export const Mob = EnumUtils.create({
  Bear: 'bear',
  BlueSlime: 'blue_slime',
  Goblin: 'goblin',
  WeaponMerchant: 'weapon_merchant',
  ArmorMerchant: 'armor_merchant',
  ItemMerchant: 'item_merchant',
  Orc: 'orc',
  Skeleton: 'skeleton',
  Zombie: 'zombie'
});

export const Projectile = EnumUtils.create({
  ArrowBone: 'arrow_bone',
  ArrowCelestial: 'arrow_celestial',
  ArrowDwarven: 'arrow_dwarven',
  ArrowElven: 'arrow_elven',
  ArrowJade: 'arrow_jade',
  ArrowMeteorite: 'arrow_meteorite',
  ArrowObsidian: 'arrow_obsidian',
  ArrowSteel: 'arrow_steel',
  ArrowWood: 'arrow_wood',
  Fireball: 'fireball',
  GoblinArrow: 'small_arrow_wood',
  IceShard: 'ice_shard',
  LightningBolt: 'lightning_bold'
});

export const ScreenState = EnumUtils.create({
  Active: 1,
  Hidden: 2,
  TransitionOff: 3,
  TransitionOn: 4
});

export const WeaponMaterial = EnumUtils.create({
  Bear: 'bear',
  BlueSlime: 'blue_slime',
  Bone: 'bone',
  Celestial: 'celestial',
  Dwarven: 'dwarven',
  Elven: 'elven',
  Iron: 'iron',
  Jade: 'jade',
  Meteorite: 'meteorite',
  Obsidian: 'obsidian',
  Wood: 'wood',
  Zombie: 'zombie'
});

export const WeaponType = EnumUtils.create({
  Axe: 'axe',
  Bow: 'bow',
  GoblinBow: 'goblin_bow',
  Punch: 'punch',
  Staff: 'staff',
  Sword: 'sword'
});

const wearableInventorySlot = {
  Body: 'body',
  Feet: 'feet',
  Head: 'head'
};

const equipableInventorySlot = Object.assign(
  {
    Hand1: 'hand_1',
    Hand2: 'hand_2'
  },
  wearableInventorySlot
);

const otherInventorySlot = {
  Backpack: 'backpack',
  Hotbar: 'hotbar',
  Trash: 'trash',
  Use: 'use'
};

export const InventorySlot = EnumUtils.create(equipableInventorySlot, otherInventorySlot);

export const WearableInventorySlot = EnumUtils.create(wearableInventorySlot);

export const EquipableInventorySlot = EnumUtils.create(equipableInventorySlot);

export const MerchantSlot = EnumUtils.create({
  Stock: 'stock',
  Buy: 'buy',
  Sell: 'sell'
});

export const BackpackSlotCount = 25;
export const HotbarSlotCount = 5;
export const MerchantStockSlotCount = 15;

export const ArmorType = EnumUtils.create({
  ChainMail: 'chain_mail',
  PlateMail: 'plate_mail',
  Robe: 'robe',
  Shield: 'shield',
  Tunic: 'tunic'
});

export const ArmorMaterial = EnumUtils.create({
  Cloth: 'cloth',
  Iron: 'iron',
  Leather: 'leather',
  Steel: 'steel',
  Wood: 'wood'
});

export const Container = EnumUtils.create({ WoodChest: 'wood_chest' });

export const ContainerDropType = EnumUtils.create({
  Common: 'common'
});

export const LootType = EnumUtils.create({
  Healing: 'healing'
});

export const Item = EnumUtils.create({
  HealingPotion: 'healing_potion',
  MagicPotion: 'magic_potion',
  MaxHpUpPotion: 'max_hp_up_potion'
});

export const Attribute = EnumUtils.create({
  Agility: 'agility',
  Endurance: 'endurance',
  Intelligence: 'intelligence',
  Strengh: 'strength'
});

export const AttributeMax = 10;

export const Statistic = EnumUtils.create(Attribute, {
  Acceleration: 'acceleration',
  Arc: 'arc',
  AttributePoints: 'attribute_points',
  CastingDuration: 'casting_duration',
  Damage: 'damage',
  Defense: 'defense',
  Duration: 'duration',
  HitPoints: 'hit_points',
  KnockBackDuration: 'knock_back_duration',
  MagicPoints: 'magic_points',
  Range: 'range',
  SkillPoints: 'skill_points'
});

export const StatisticEffectValue = EnumUtils.create({
  Current: 'current',
  Max: 'max'
});

//TODO: this should not be here. ui strings should be in their own file (i18n).
export const WorldButtonText = EnumUtils.create({
  Cancel: 'Cancel',
  Travel: 'Travel'
});

export const Handedness = EnumUtils.create({
  OneHanded: 'one_handed',
  TwoHanded: 'two_handed'
});

export const Color = EnumUtils.create({
  Black: 0x000000,
  DarkBlueGray: 0x40424b,
  DarkDarkBlueGray: 0x2f3033,
  DarkOrange: 0xfc3000,
  GoodAlertYellow: 0xf0e060,
  ErrorAlertRed: 0xf03000,
  HealthRed: 0xd40000,
  LevelMapDarkBrown: 0x644340,
  LevelMapHeroLightGreen: 0x00ff00,
  LevelMapHeroDarkGreen: 0x00a000,
  LevelMapLightBrown: 0xd5bc81,
  LevelMapLightLightBrown: 0xfff6e0,
  LevelMapMobLightRed: 0xff0000,
  LevelMapMobDarkRed: 0xd30000,
  MagicBlue: 0x0064e0,
  White: 0xffffff,
  InactiveGray: 0xbbbbbb
});

export const Char = EnumUtils.create({
  BoxDrawingsLightHorizontal: '\u2500',
  LF: '\n',
  WhiteDiamondContainingBlackSmallDiamond: '\u25C8',
  WhiteLeftPointingSmallTriangle: '\u25C3',
  WhiteRightPointingSmallTriangle: '\u25B9'
});

export const LoadingScreenTextStyle = ObjectUtils.createImmutable({
  font: '16px Silkscreen',
  tint: 0xffffff
});

export const HeaderTextStyle = ObjectUtils.createImmutable({
  font: '8px Silkscreen',
  tint: 0xffffff,
  align: 'center'
});

export const InventoryBodyTextStyle = ObjectUtils.createImmutable({
  font: '16px Silkscreen',
  tint: 0xffffff
});

export const SpellBookTextStyle = ObjectUtils.createImmutable({
  font: '16px Silkscreen',
  tint: 0xffffff
});

export const ErrorTextStyle = ObjectUtils.createImmutable({
  font: '16px Silkscreen',
  tint: Color.ErrorAlertRed,
  align: 'center'
});

export const BasicTextStyle = ObjectUtils.createImmutable({
  font: '8px Silkscreen',
  tint: 0xffffff
});

export const MagicSpell = EnumUtils.create({
  Charge: 'charge',
  Fireball: 'fireball',
  Heal: 'heal',
  IceShard: 'ice_shard',
  LightningBolt: 'lightning_bolt',
  MultiArrow: 'multi_arrow'
});

const magicSpellEquipableSlot = {
  Memory: 'memory'
};

const magicSpellOtherSlot = {
  SpellBook: 'spell_book',
  Erase: 'erase'
};

export const MagicSpellSlot = EnumUtils.create(magicSpellEquipableSlot, magicSpellOtherSlot);

export const MagicSpellBookSlotCount = 25;

export const TargetType = EnumUtils.create({
  Self: 'self',
  Enemy: 'enemy'
});

export const FinalGameState = EnumUtils.create({ Victory: 'victory', Defeat: 'defeat' });

export const ScreenDecoAlpha = 0.3;

export const CharacterClass = EnumUtils.create({
  Archer: 'archer',
  Warrior: 'warrior',
  Wizard: 'wizard'
});

export const SkillGroup = EnumUtils.create({
  ArcherSkills: 'archer_skills',
  FireMagic: 'fire_magic',
  IceMagic: 'ice_magic',
  LightningMagic: 'lightning_magic',
  WarriorSkills: 'warrior_skills'
});

export const AttackShape = EnumUtils.create({
  CenteredArc: 'centered_arc',
  Slash: 'slash',
  Charge: 'charge'
});

/*export const EffectTimeType = EnumUtils.create({
  Permanent: 'permanent',
  Temporary: 'temporary'
});*/

export const EmptyTextureArray = [Pixi.Texture.EMPTY];

export const WeaponStyle = EnumUtils.create({ Melee: 'melee', Ranged: 'ranged' });

export const DoorTileIds = [1000, 1002, 1003];

export const SellPriceMultiplier = 0.25;
