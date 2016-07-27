'use strict';
import * as Const from '../const';
import _ from 'lodash';
import CharacterClassComponent from '../components/character-class-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';


const ccMap = Object.create(null);
ccMap[Const.CharacterClass.Archer] = new CharacterClassComponent(Const.CharacterClass.Archer, 'Archer', 'Long range fighter.');
ccMap[Const.CharacterClass.Warrior] = new CharacterClassComponent(Const.CharacterClass.Warrior, 'Warrior', 'Master of melee.');
ccMap[Const.CharacterClass.Wizard] = new CharacterClassComponent(Const.CharacterClass.Wizard, 'Wizard', 'Arcane traveler.');

export function buildCharacterClass(characterClassTypeId, ...skillGroups) {

  const comp = ccMap[characterClassTypeId];

  if (!comp) { throw new Error(`"${characterClassTypeId}" is not a valid character class.`); }

  const cc = new Entity()
    .add(comp.clone())
    .addRange(_.map(skillGroups, o => new EntityReferenceComponent('skill_group', o.id)))
    ;

  /*for (const sg of skillGroups) {
    cc.add(new EntityReferenceComponent('skill_group', sg.id));
  }*/

  return cc;

}