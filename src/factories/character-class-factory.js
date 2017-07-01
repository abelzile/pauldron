'use strict';
import * as Const from '../const';
import CharacterClassComponent from '../components/character-class-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import LevelUpRewardComponent from '../components/level-up-reward-component';
import StatisticComponent from '../components/statistic-component';

//TODO: move into data files.

const commonLevelRewards = [
  new LevelUpRewardComponent(Const.Statistic.SkillPoints, 1),
  new LevelUpRewardComponent(Const.Statistic.AttributePoints, 1)
];

const commonStats = [
  new StatisticComponent(Const.Statistic.SkillPoints, 999, 1),
  new StatisticComponent(Const.Statistic.AttributePoints, 999, 1),
  new StatisticComponent(Const.Statistic.Acceleration, 0.08)
];

const funcMap = Object.create(null);

funcMap[Const.CharacterClass.Archer] = function(characterClassTypeId) {
  const starterStats = [
    new StatisticComponent(Const.Statistic.HitPoints, 25),
    new StatisticComponent(Const.Statistic.MagicPoints, 25),
    new StatisticComponent(Const.Statistic.Strengh, 1),
    new StatisticComponent(Const.Statistic.Endurance, 1),
    new StatisticComponent(Const.Statistic.Intelligence, 1),
    new StatisticComponent(Const.Statistic.Agility, 1)
  ];

  const levelRewards = [
    new LevelUpRewardComponent(Const.Statistic.HitPoints, 8),
    new LevelUpRewardComponent(Const.Statistic.MagicPoints, 2)
  ];

  return new Entity()
    .add(
      new CharacterClassComponent(
        Const.CharacterClass.Archer,
        'Archer',
        'Long range fighter.'
      )
    )
    .addRange(starterStats)
    .addRange(levelRewards);
};

funcMap[Const.CharacterClass.Warrior] = function(characterClassTypeId) {
  const starterStats = [
    new StatisticComponent(Const.Statistic.HitPoints, 30),
    new StatisticComponent(Const.Statistic.MagicPoints, 900/*20*/),
    new StatisticComponent(Const.Statistic.Strengh, 1),
    new StatisticComponent(Const.Statistic.Endurance, 1),
    new StatisticComponent(Const.Statistic.Intelligence, 1),
    new StatisticComponent(Const.Statistic.Agility, 1)
  ];

  const levelRewards = [
    new LevelUpRewardComponent(Const.Statistic.HitPoints, 10),
    new LevelUpRewardComponent(Const.Statistic.MagicPoints, 1)
  ];

  return new Entity()
    .add(
      new CharacterClassComponent(
        Const.CharacterClass.Warrior,
        'Warrior',
        'Master of melee.'
      )
    )
    .addRange(starterStats)
    .addRange(levelRewards);
};

funcMap[Const.CharacterClass.Wizard] = function(characterClassTypeId) {
  const starterStats = [
    new StatisticComponent(Const.Statistic.HitPoints, 20),
    new StatisticComponent(Const.Statistic.MagicPoints, 30),
    new StatisticComponent(Const.Statistic.Strengh, 1),
    new StatisticComponent(Const.Statistic.Endurance, 1),
    new StatisticComponent(Const.Statistic.Intelligence, 1),
    new StatisticComponent(Const.Statistic.Agility, 1)
  ];

  const levelRewards = [
    new LevelUpRewardComponent(Const.Statistic.HitPoints, 6),
    new LevelUpRewardComponent(Const.Statistic.MagicPoints, 3)
  ];

  return new Entity()
    .add(
      new CharacterClassComponent(
        Const.CharacterClass.Wizard,
        'Wizard',
        'Arcane adventurer.'
      )
    )
    .addRange(starterStats)
    .addRange(levelRewards);
};

export function buildCharacterClass(
  characterClassTypeId,
  skillGroups,
  starterWeapons,
  starterArmors,
  starterItems
) {
  const func = funcMap[characterClassTypeId];

  if (!func) {
    throw new Error(
      `"${characterClassTypeId}" is not a valid character class.`
    );
  }

  return func(characterClassTypeId)
    .setTags('character_class')
    .addRange(commonLevelRewards)
    .addRange(commonStats)
    .addRange(
      skillGroups.map(e => new EntityReferenceComponent('skill_group', e.id))
    )
    .addRange(
      starterWeapons.map(e => new EntityReferenceComponent('weapon', e.id))
    )
    .addRange(
      starterArmors.map(e => new EntityReferenceComponent('armor', e.id))
    )
    .addRange(
      starterItems.map(e => new EntityReferenceComponent('item', e.id))
    );
}
