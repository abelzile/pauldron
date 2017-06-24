import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import EntityReferenceComponent from '../components/entity-reference-component';
import System from '../system';

export default class AbilitiesUpdateSystem extends System {
  constructor(renderer, entityManager) {
    super();

    this._renderer = renderer;
    this._entityManager = entityManager;

    this.RelevantHeroSlotTypes = Object.keys(Const.MagicSpellSlot).map(v => Const.MagicSpellSlot[v]);

    this._relevantHeroEntRefs = this._entityManager.heroEntity
      .getAll('EntityReferenceComponent')
      .filter(c => this.RelevantHeroSlotTypes.includes(c.typeId));
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {}

  processEntities(gameTime, entities) {}

  unload(entities, levelPixiContainer) {
    this._relevantHeroEntRefs
      .map(c => EntityFinders.findById(entities, c.entityId))
      .filter(e => e && e.has('InventoryIconComponent'))
      .forEach(e => {
        const isVisible =
          this._relevantHeroEntRefs.find(c => c.entityId === e.id).typeId === Const.MagicSpellSlot.Memory;

        if (e.has('MeleeAttackComponent')) {
          const g = e.get('MeleeAttackComponent').graphics;

          levelPixiContainer.removeChild(g);
          levelPixiContainer.addChild(g);

          g.visible = isVisible;
        }
      });
  }

  learnSkill(skillId) {
    const hero = this._entityManager.heroEntity;
    const stats = hero.getAllKeyed('StatisticComponent', 'name');

    const skillPointsStat = stats[Const.Statistic.SkillPoints];

    if (skillPointsStat.currentValue <= 0) {
      return;
    }

    --skillPointsStat.currentValue;

    hero.add(new EntityReferenceComponent('skill', skillId));
  }

  setCurrentSkill(entityId) {
    EntityFinders.findAbilitiesGui(this._entityManager.entities).get(
      'CurrentEntityReferenceComponent'
    ).entityId = entityId;
  }

  setMemorizedSkill(skillId) {
    const hero = this._entityManager.heroEntity;
    const memory = hero.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory);

    memory.entityId = skillId;
  }

  incrementAttribute(attributeName) {
    const hero = this._entityManager.heroEntity;
    const stats = hero.getAllKeyed('StatisticComponent', 'name');

    const attributePointsStat = stats[Const.Statistic.AttributePoints];

    if (attributePointsStat.currentValue <= 0) {
      return;
    }

    const attributeStat = stats[attributeName];

    if (!attributeStat) {
      throw new Error('Attribute "' + attributeName + '" not found on hero.');
    }

    attributePointsStat.currentValue--;
    attributeStat.maxValue++;
    attributeStat.currentValue = attributeStat.maxValue;
  }
}
