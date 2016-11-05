'use strict';
import * as Const from '../const';
import _ from 'lodash';
import BitmapTextComponent from '../components/bitmap-text-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import SkillGroupComponent from '../components/skill-group-component';


const skillGroups = Object.create(null);
skillGroups[Const.SkillGroup.ArcherSkills] = new SkillGroupComponent(Const.SkillGroup.ArcherSkills, 'Archer Skills');
skillGroups[Const.SkillGroup.FireMagic] = new SkillGroupComponent(Const.SkillGroup.FireMagic, 'Fire Magic');
skillGroups[Const.SkillGroup.IceMagic] = new SkillGroupComponent(Const.SkillGroup.IceMagic, 'Ice Magic');
skillGroups[Const.SkillGroup.LightningMagic] = new SkillGroupComponent(Const.SkillGroup.LightningMagic, 'Lightning Magic');
skillGroups[Const.SkillGroup.WarriorSkills] = new SkillGroupComponent(Const.SkillGroup.WarriorSkills, 'Warrior Skills');

export function buildSkillGroup(skillGroupTypeId, ...skills) {

  const comp = skillGroups[skillGroupTypeId];

  if (!comp) { throw new Error(`"${skillGroupTypeId}" is not a valid skill group.`); }

  return new Entity()
    .add(comp.clone())
    .addRange(_.map(skills, o => new EntityReferenceComponent('skill', o.id)))
    .add(new BitmapTextComponent(comp.name, Const.WorldMapButtonTextStyle));

}
