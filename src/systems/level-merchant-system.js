import * as _ from 'lodash';
import * as EntityFinders from '../entity-finders';
import * as EntityUtils from '../utils/entity-utils';
import System from '../system';

export default class LevelMerchantSystem extends System {
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
    const adjacentEntities = this._entityManager.getEntitiesAdjacentToHero();
    const merchants = EntityFinders.findMerchantMobs(adjacentEntities);

    if (_.isEmpty(merchants)) {
      return;
    }

    const heroPositionedBoundingRect = EntityUtils.getPositionedBoundingRect(hero);
    for (const merchant of merchants) {
      merchant.get('MerchantComponent').isVisitable = EntityUtils.getPositionedBoundingRect(merchant).intersectsWith(
        heroPositionedBoundingRect
      );
    }
  }
}
