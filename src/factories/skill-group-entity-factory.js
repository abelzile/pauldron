'use strict';
import * as Const from '../const';
import _ from 'lodash';
import BitmapTextComponent from '../components/bitmap-text-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import SkillGroupComponent from '../components/skill-group-component';


const sgHash = Object.create(null);
sgHash[Const.SkillGroup.FireMagic] = new SkillGroupComponent(Const.SkillGroup.FireMagic, 'Fire Magic');
sgHash[Const.SkillGroup.IceMagic] = new SkillGroupComponent(Const.SkillGroup.IceMagic, 'Ice Magic');
sgHash[Const.SkillGroup.LightningMagic] = new SkillGroupComponent(Const.SkillGroup.LightningMagic, 'Lightning Magic');

export function buildSkillGroup(skillGroupTypeId, ...skills) {

  const comp = sgHash[skillGroupTypeId];

  if (!comp) { throw new Error(`"${skillGroupTypeId}" is not a valid skill group.`); }

  const sg = new Entity()
    .add(comp.clone())
    .addRange(_.map(skills, o => new EntityReferenceComponent('skill', o.id)))
    .add(new BitmapTextComponent(comp.name, Const.WorldMapButtonTextStyle))
    ;

  return sg;

}
