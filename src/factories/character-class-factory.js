'use strict';
import * as Const from '../const';
import CharacterClassComponent from '../components/character-class-component';
import Entity from '../entity';


const ccMap = Object.create(null);
const archer = ccMap[Const.CharacterClass.Archer] = new CharacterClassComponent(Const.CharacterClass.Archer, 'Archer', 'Long range fighter.');
const warrior = ccMap[Const.CharacterClass.Warrior] = new CharacterClassComponent(Const.CharacterClass.Warrior, 'Warrior', 'Master of melee.');
const wizard = ccMap[Const.CharacterClass.Wizard] = new CharacterClassComponent(Const.CharacterClass.Wizard, 'Wizard', 'Arcane traveler.')

export function buildCharacterClass(characterClassTypeId) {

  const comp = ccMap[characterClassTypeId];

  if (!comp) { throw new Error(`"${characterClassTypeId}" is not a valid character class.`); }

  return new Entity().add(comp.clone());

}