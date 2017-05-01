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

    for (let i = 0; i < items.length; ++i) {
      this._addSprites(items[i]);
    }

    const topLeftPos = this._entityManager.currentLevelEntity.get('TileMapComponent').topLeftPos;
    this._drawContainers(containers, topLeftPos);
    this._drawItems(items, topLeftPos);
  }

  processEntities(gameTime, entities, input) {
    const entitySpatialGrid = this._entityManager.entitySpatialGrid;
    const ents = entitySpatialGrid.getAdjacentEntities(this._entityManager.heroEntity);
    const containers = EntityFinders.findContainers(ents);
    const items = this._findFreeItems(ents);
    const topLeftPos = this._entityManager.currentLevelEntity.get('TileMapComponent').topLeftPos;
    this._drawContainers(containers, topLeftPos);
    this._drawItems(items, topLeftPos);
  }

  showLootFromContainer(loot) {
    this._addSprites(loot);
  }

  _findFreeItems(entities) {
    const hero = this._entityManager.heroEntity;
    const heroEntRefComps = hero.getAll('EntityReferenceComponent');
    const items = EntityFinders.findItems(entities);
    const itemsInHeroInventory = EntityFinders.findReferencedIn(items, heroEntRefComps);

    return _.difference(items, itemsInHeroInventory);
  }

  _drawContainers(containers, topLeftPos) {
    for (let i = 0; i < containers.length; ++i) {
      const container = containers[i];
      this._updateSprites(container, topLeftPos);
      container
        .get('AnimatedSpriteComponent')
        .animatedSprite.gotoAndStop(container.get('ContainerComponent').isClosed ? 0 : 1);
    }
  }

  _drawItems(items, topLeftPos) {
    for (let i = 0; i < items.length; ++i) {
      this._updateSprites(items[i], topLeftPos);
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

  _updateSprites(ent, topLeftPos) {
    const screenPosition = ScreenUtils.translateWorldPositionToScreenPosition(
      ent.get('PositionComponent').position,
      topLeftPos
    ).divide(Const.ScreenScale);
    const sprites = ent.getAllKeyed('SpriteComponent', 'id');
    if (sprites.hasOwnProperty('shadow')) {
      const shadow = sprites['shadow'].sprite;
      shadow.position.set(screenPosition.x, screenPosition.y + 2);
    }
    ent.get('AnimatedSpriteComponent').animatedSprite.position.set(screenPosition.x, screenPosition.y);
  }
}
