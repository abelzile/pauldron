import * as _ from 'lodash';
import * as ArrayUtils from '../utils/array-utils';
import * as EntityFinders from '../entity-finders';
import * as EntityUtils from '../utils/entity-utils';
import EntityReferenceComponent from '../components/entity-reference-component';
import System from '../system';

export default class LevelPickupSystem extends System {
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
    const items = EntityFinders.findItems(adjacentEntities);
    const mobs = EntityFinders.findMobs(adjacentEntities);
    const monies = EntityFinders.findMonies(adjacentEntities);

    this._pickupItems(gameTime, hero, items, mobs);
    this._pickupMoney(hero, monies);
  }

  _pickupItems(gameTime, hero, items, mobs) {
    if (_.isEmpty(items)) {
      return;
    }

    const entRefs = hero.getAll('EntityReferenceComponent');

    for (const mob of mobs) {
      ArrayUtils.append(entRefs, mob.getAll('EntityReferenceComponent'));
    }

    const carriedItems = EntityFinders.findReferencedIn(items, entRefs);
    const freeItems = _.difference(items, carriedItems);

    if (_.isEmpty(freeItems)) {
      return;
    }

    for (const freeItem of freeItems) {
      const delay = freeItem.get('InteractionDelayComponent');
      if (delay) {
        delay.currentInteractionDelayTime += gameTime;
      }
    }

    const heroPositionedBoundingRect = EntityUtils.getPositionedBoundingRect(hero);
    const pickupItems = freeItems.filter(item => {
      let isInteractable = true;
      const delay = item.get('InteractionDelayComponent');
      if (delay) {
        isInteractable = delay.isInteractable;
      }
      return isInteractable && EntityUtils.getPositionedBoundingRect(item).intersectsWith(heroPositionedBoundingRect);
    });

    for (const item of pickupItems) {
      const emptyBackpackRefs = hero
        .getAll('EntityReferenceComponent')
        .filter(EntityReferenceComponent.isEmptyBackpackSlot);

      if (_.isEmpty(emptyBackpackRefs)) {
        return;
      }

      emptyBackpackRefs[0].entityId = item.id;

      this._entityManager.removeLevelItemComponentRepresenting(item);

      this.emit('level-pickup-system.pick-up-item', item);
    }
  }

  _pickupMoney(hero, monies) {
    if (_.isEmpty(monies)) {
      return;
    }

    const heroPositionedBoundingRect = EntityUtils.getPositionedBoundingRect(hero);
    const heroMoney = hero.get('MoneyComponent');
    const pickupableMoney = monies.filter(money => {
      return EntityUtils.getPositionedBoundingRect(money).intersectsWith(heroPositionedBoundingRect);
    });

    for (const money of pickupableMoney) {
      const m = money.get('MoneyComponent');
      if (m) {
        heroMoney.amount += m.amount;
      }

      this.emit('level-pickup-system.pick-up-money', money);

      this._entityManager.remove(money);
    }
  }
}
