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

    this.RelevantHeroSlotTypes = _.toArray(Const.MagicSpellSlot);

    this._relevantHeroEntRefs = _.filter(this._entityManager.heroEntity.getAll('EntityReferenceComponent'),
                                                c => _.includes(this.RelevantHeroSlotTypes, c.typeId));

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
  }

  processEntities(gameTime, entities) {
  }

  unload(entities, levelPixiContainer) {

    _.chain(this._relevantHeroEntRefs)
     .map(c => EntityFinders.findById(entities, c.entityId))
     .filter(e => e && e.has('InventoryIconComponent'))
     .each(e => {

       const isVisible = _.find(this._relevantHeroEntRefs, c => c.entityId === e.id).typeId === Const.MagicSpellSlot.Memory;

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