import System from '../system';
import * as EntityFinders from '../entity-finders';
import _ from 'lodash';
import * as Const from '../const';
import EntityReferenceComponent from '../components/entity-reference-component';


export default class AbilitiesUpdateSystem extends System {

  constructor(renderer, entityManager) {

    super();

    this._renderer = renderer;
    this._entityManager = entityManager;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    /*this._initItems(entities);*/

  }

  processEntities(gameTime, entities) {
  }

  unload(entities) {
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

    console.log('memorize ' + skillId);

    const hero = this._entityManager.heroEntity;
    const memory = hero.getAll('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory)[0];

    console.log(memory);

    memory.entityId = skillId;

  }

  /*_initItems(entities) {

    const hero = this._entityManager.heroEntity;
    const characterClassTypeId = hero.get('CharacterClassComponent').typeId;
    const characterClasses = EntityFinders.findCharacterClasses(entities);
    const heroCharClass = _.find(characterClasses, c => c.get('CharacterClassComponent').typeId === characterClassTypeId);

    const skillGroupRefs = heroCharClass.getAll('EntityReferenceComponent', c => c.entityId && c.typeId === 'skill_group');
    const skillGroups = _.map(skillGroupRefs, c => EntityFinders.findById(entities, c.entityId));

    const heroSkillRefs = hero.getAll('EntityReferenceComponent', c => c.entityId && c.typeId === 'skill');
    const heroSkills = _.map(heroSkillRefs, c => EntityFinders.findById(entities, c.entityId));

    _.forEach(skillGroups, (skillGroup) => {

      const skillRefs = skillGroup.getAll('EntityReferenceComponent', c => c.typeId === 'skill');
      _.forEach(skillRefs, (c, i) => {

        const skill = EntityFinders.findById(entities, c.entityId);

        const icon = skill.get('InventoryIconComponent');

        const iconSprite = icon.sprite;

        iconSprite.interactive = true;
        iconSprite.buttonMode = false;
        iconSprite
          .on('mousedown', (eventData) => this._mouseDownOnSkill(skill))
          .on('mouseover', (eventData) => { this._setCurrentItem(skill); })
          .on('mouseout', (eventData) => { this._setCurrentItem(); })
        /!*.on('mousemove', (eventData) => this._onDrag(eventData, iconSprite))
         .on('mouseup', (eventData) => this._onDragEnd(eventData, inventoryIconComp))
         .on('mouseupoutside', (eventData) => this._onDragEnd(eventData, inventoryIconComp))*!/
        ;
      });

    });


  }
*/


}