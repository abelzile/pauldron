import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as ScreenUtils from '../utils/screen-utils';
import System from '../system';

export default class LevelLootRenderSystem extends System {
  constructor(pixiContainer, renderer, entityManager) {
    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    const containers = EntityFinders.findContainers(entities);

    for (let i = 0; i < containers.length; ++i) {
      this._addSprites(containers[i]);
    }

    const items = this._findFreeItems(entities);

    for (const item of items) {
      this._addSprites(item);
    }

    const monies = EntityFinders.findMonies(entities);

    for (const money of monies) {
      this._addSprites(money);
    }

    const topLeftPos = this._entityManager.currentLevelEntity.get('TileMapComponent').topLeftPos;
    this._drawContainers(containers, topLeftPos);
    this._drawItems(items, topLeftPos);
  }

  processEntities(gameTime, entities, input) {
    //const entitySpatialGrid = this._entityManager.entitySpatialGrid;
    const ents = this._entityManager.getEntitiesAdjacentToHero();
    const containers = EntityFinders.findContainers(ents);
    const items = this._findFreeItems(ents);
    const monies = EntityFinders.findMonies(ents);
    const topLeftPos = this._entityManager.currentLevelEntity.get('TileMapComponent').topLeftPos;
    this._drawContainers(containers, topLeftPos);
    this._drawItems(items, topLeftPos);
    this._drawMonies(monies, topLeftPos);
  }

  showContainerLoot(loot) {
    this._addSprites(loot);
  }

  showMoney(money) {
    this._addSprites(money);
  }

  _findFreeItems(entities) {
    const hero = this._entityManager.heroEntity;
    const heroEntRefComps = hero.getAll('EntityReferenceComponent');
    const items = EntityFinders.findItems(entities);
    const itemsInHeroInventory = EntityFinders.findReferencedIn(items, heroEntRefComps);

    return _.difference(items, itemsInHeroInventory);
  }

  _drawContainers(containers, topLeftPos) {
    for (const container of containers) {
      this._updateSprites(container, topLeftPos);
      container
        .get('AnimatedSpriteComponent')
        .animatedSprite.gotoAndStop(container.get('ContainerComponent').isClosed ? 0 : 1);
    }
  }

  _drawItems(items, topLeftPos) {
    for (const item of items) {
      this._updateSprites(item, topLeftPos);
    }
  }

  _drawMonies(monies, topLeftPos) {
    for (const money of monies) {
      this._updateSprites(money, topLeftPos, -4);
    }
  }

  _addSprites(ent) {
    const sprites = ent.getAllKeyed('SpriteComponent', 'id');
    if (sprites.hasOwnProperty('shadow')) {
      const shadow = sprites['shadow'].sprite;
      shadow.alpha = 0.1;
      this._pixiContainer.addChild(shadow);
    }
    this._pixiContainer.addChild(ent.get('AnimatedSpriteComponent').animatedSprite);
  }

  _updateSprites(ent, topLeftPos, shadowYOffset = 2) {
    const screenPosition = this._pixiContainer
      .translateWorldPositionToScreenPosition(ent.get('PositionComponent').position, topLeftPos)
      .divide(Const.ScreenScale);
    const sprites = ent.getAllKeyed('SpriteComponent', 'id');
    if (sprites.hasOwnProperty('shadow')) {
      const shadow = sprites['shadow'].sprite;
      shadow.position.set(screenPosition.x, screenPosition.y + shadowYOffset);
    }
    ent.get('AnimatedSpriteComponent').animatedSprite.position.set(screenPosition.x, screenPosition.y);
  }
}
