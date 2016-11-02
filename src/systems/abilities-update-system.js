import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import _ from 'lodash';
import EntityReferenceComponent from '../components/entity-reference-component';
import System from '../system';


export default class AbilitiesUpdateSystem extends System {

  constructor(renderer, entityManager) {

    super();

    this._renderer = renderer;
    this._entityManager = entityManager;

    this.RelevantSlotTypes = _.toArray(Const.MagicSpellSlot);

    this._relevantHeroReferenceComps = _.filter(this._entityManager.heroEntity.getAll('EntityReferenceComponent'),
                                                c => _.includes(this.RelevantSlotTypes, c.typeId));

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
  }

  processEntities(gameTime, entities) {
  }

  unload(entities, levelPixiContainer) {

    _.chain(this._relevantHeroReferenceComps)
     .map(c => EntityFinders.findById(entities, c.entityId))
     .filter(e => e && e.has('InventoryIconComponent'))
     .each(e => {

       const isVisible = _.find(this._relevantHeroReferenceComps, c => c.entityId === e.id).typeId === Const.MagicSpellSlot.Memory;

       if (e.has('MeleeAttackComponent')) {

         const g = e.get('MeleeAttackComponent').graphics;

         levelPixiContainer.removeChild(g);
         levelPixiContainer.addChild(g);

         g.visible = isVisible;

       }

     })
     .value();

  }

  learnSkill(skillId) {

    const hero = this._entityManager.heroEntity;
    const stats = hero.getAllKeyed('StatisticComponent', 'name');

    const skillPointsStat = stats[Const.Statistic.SkillPoints];

    if (skillPointsStat.currentValue <= 0) { return; }

    --skillPointsStat.currentValue;

    hero.add(new EntityReferenceComponent('skill', skillId));

  }

  setCurrentSkill(entityId) {
    EntityFinders.findAbilitiesGui(this._entityManager.entities).get('CurrentEntityReferenceComponent').entityId = entityId;
  }

  setMemorizedSkill(skillId) {

    const hero = this._entityManager.heroEntity;
    const memory = hero.getAll('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory)[0];

    memory.entityId = skillId;

  }

}