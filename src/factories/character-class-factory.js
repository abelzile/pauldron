'use strict';
import * as _ from 'lodash';
import * as Const from '../const';
import CharacterClassComponent from '../components/character-class-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import LevelUpRewardComponent from '../components/level-up-reward-component';

const funcMap = Object.create(null);

funcMap[Const.CharacterClass.Archer] = function(characterClassTypeId) {
  return new Entity()
    .add(new CharacterClassComponent(Const.CharacterClass.Archer, 'Archer', 'Long range fighter.'))
    .add(new LevelUpRewardComponent(Const.Statistic.HitPoints, 2))
    .add(new LevelUpRewardComponent(Const.Statistic.MagicPoints, 2));
};

funcMap[Const.CharacterClass.Warrior] = function(characterClassTypeId) {
  return new Entity()
    .add(new CharacterClassComponent(Const.CharacterClass.Warrior, 'Warrior', 'Master of melee.'))
    .add(new LevelUpRewardComponent(Const.Statistic.HitPoints, 3))
    .add(new LevelUpRewardComponent(Const.Statistic.MagicPoints, 1));
};

funcMap[Const.CharacterClass.Wizard] = function(characterClassTypeId) {
  return new Entity()
    .add(new CharacterClassComponent(Const.CharacterClass.Wizard, 'Wizard', 'Arcane adventurer.'))
    .add(new LevelUpRewardComponent(Const.Statistic.HitPoints, 1))
    .add(new LevelUpRewardComponent(Const.Statistic.MagicPoints, 3));
};

export function buildCharacterClass(characterClassTypeId, skillGroups, starterWeapons, starterArmors, starterItems) {
  const func = funcMap[characterClassTypeId];

  if (!func) {
    throw new Error(`"${characterClassTypeId}" is not a valid character class.`);
  }

  return func(characterClassTypeId)
    .setTags('character_class')
    .addRange(_.map(skillGroups, e => new EntityReferenceComponent('skill_group', e.id)))
    .addRange(_.map(starterWeapons, e => new EntityReferenceComponent('weapon', e.id)))
    .addRange(_.map(starterArmors, e => new EntityReferenceComponent('armor', e.id)))
    .addRange(_.map(starterItems, e => new EntityReferenceComponent('item', e.id)));
}
