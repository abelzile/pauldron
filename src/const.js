import * as EnumUtils from './utils/enum-utils';
import * as ObjectUtils from './utils/object-utils';
import _ from 'lodash';

export const ScreenWidth = 1280;
export const ScreenHeight = 720;
export const ScreenScale = 3;
export const TilePixelSize = 16;

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
                                                      AbilitiesGui: 'c283bb8c-2aec-4718-b401-385ee17c1f85',
                                                      CharacterCreationGui: 'ffeb160c-ffd4-453b-aed9-c906ea388577'
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
                                            West: 4,
                                          });

export const Mob = EnumUtils.create({
                                      BlueSlime: 'blue_slime',
                                      Orc: 'orc',
                                      Skeleton: 'skeleton',
                                      Zombie: 'zombie',
                                    });

export const Projectile = EnumUtils.create({
                                             Arrow: 'arrow',
                                             Fireball: 'fireball',
                                             IceShard: 'ice_shard',
                                             LightningBolt: 'lightning_bold',
                                           });

export const ScreenState = EnumUtils.create({
                                              Active: 1,
                                              Hidden: 2,
                                              TransitionOff: 3,
                                              TransitionOn: 4,
                                            });

export const WeaponMaterial = EnumUtils.create({
                                                 Flesh: 'flesh',
                                                 Iron: 'iron',
                                                 Wood: 'wood',
                                               });

export const WeaponType = EnumUtils.create({
                                             Axe: 'axe',
                                             Bow: 'bow',
                                             BlueSlimePunch: 'blue_slime_punch',
                                             Staff: 'staff',
                                             Sword: 'sword',
                                             ZombiePunch: 'zombie_punch',
                                           });

const equipableInventorySlot = {
  Body: 'body',
  Feet: 'feet',
  Hand1: 'hand_1',
  Hand2: 'hand_2',
  Head: 'head',
};

const otherInventorySlot = {
  Backpack: 'backpack',
  Hotbar: 'hotbar',
  Trash: 'trash',
  Use: 'use',
};

export const InventorySlot = EnumUtils.create(equipableInventorySlot, otherInventorySlot);

export const EquipableInventorySlot = EnumUtils.create(equipableInventorySlot);

export const BackpackSlotCount = 25;
export const HotbarSlotCount = 5;

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

export const Item = EnumUtils.create({
                                       HealingPotion: 'healing_potion',
                                       MagicPotion: 'magic_potion',
                                       MaxHpUpPotion: 'max_hp_up_potion'
                                     });

export const Statistic = EnumUtils.create({
                                            Acceleration: 'acceleration',
                                            Arc: 'arc',
                                            CastingDuration: 'casting_duration',
                                            Damage: 'damage',
                                            Defense: 'defense',
                                            Duration: 'duration',
                                            HitPoints: 'hit_points',
                                            KnockBackDuration: 'knock_back_duration',
                                            MagicPoints: 'magic_points',
                                            Range: 'range',
                                            SkillPoints: 'skill_points',
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
                                        HealthRed: 0xd40000,
                                        MagicBlue: 0x0064e0,
                                        White: 0xffffff,
                                      });

export const Char = EnumUtils.create({
                                       BoxDrawingsLightHorizontal: '\u2500',
                                       LF: '\n',
                                       WhiteDiamondContainingBlackSmallDiamond: '\u25C8',
                                       WhiteLeftPointingSmallTriangle: '\u25C3',
                                       WhiteRightPointingSmallTriangle: '\u25B9',
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

export const WorldMapButtonTextStyle = ObjectUtils.createImmutable({
                                                                     font: '8px Silkscreen',
                                                                     tint: 0xffffff
                                                                   });

export const MagicSpell = EnumUtils.create({
                                             Charge: 'charge',
                                             Fireball: 'fireball',
                                             Heal: 'heal',
                                             IceShard: 'ice_shard',
                                             LightningBolt: 'lightning_bolt',
                                             MultiArrow: 'multi_arrow',
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

export const ScreenDecoAlpha = .3;

export const CharacterClass = EnumUtils.create({
                                                 Archer: 'archer',
                                                 Warrior: 'warrior',
                                                 Wizard: 'wizard'
                                               });

export const SkillGroup = EnumUtils.create({
                                             FireMagic: 'fire_magic',
                                             IceMagic: 'ice_magic',
                                             LightningMagic: 'lightning_magic',
                                             WarriorSkills: 'warrior_skills',
                                           });

export const AttackShape = EnumUtils.create({
                                              CenteredArc: 'centered_arc',
                                              Slash: 'slash',
                                              Stab: 'stab',
                                            });

export const EffectTimeType = EnumUtils.create({
                                                 Permanent: 'permanent',
                                                 Temporary: 'temporary',
                                               });