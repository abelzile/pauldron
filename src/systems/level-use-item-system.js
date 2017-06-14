import * as EntityFinders from '../entity-finders';
import EntityReferenceComponent from '../components/entity-reference-component';
import System from '../system';

export default class LevelUseItemSystem extends System {
  constructor(renderer, entityManager) {
    super();
    this._renderer = renderer;
    this._entityManager = entityManager;
  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities, input) {
    const hero = this._entityManager.heroEntity;
    const useComp = hero.getAll('EntityReferenceComponent').find(EntityReferenceComponent.isInventoryUseSlot);

    if (!useComp.entityId) {
      return;
    }

    const item = EntityFinders.findById(entities, useComp.entityId);
    this._useItem(hero, item);

    useComp.empty();

    this._entityManager.remove(item);
  }

  _useItem(hero, item) {
    const statistics = hero.getAll('StatisticComponent');
    for (const effectComp of item.getAll('StatisticEffectComponent')) {
      for (const statisticComp of statistics) {
        if (statisticComp.apply(effectComp)) {
          break;
        }
      }
    }
  }
}