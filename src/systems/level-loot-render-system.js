import * as _ from 'lodash';
import * as ArrayUtils from '../utils/array-utils';
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
      const container = containers[i];
      const sprites = container.getAllKeyed('SpriteComponent', 'id');

      const shadow = sprites['shadow'].sprite;
      shadow.alpha = 0.1;

      this._pixiContainer.addChild(shadow, container.get('AnimatedSpriteComponent').animatedSprite);
    }

    const items = this._findFreeItems(entities);

    for (let i = 0; i < items.length; ++i) {
      this._pixiContainer.addChild(items[i].get('AnimatedSpriteComponent').animatedSprite);
    }

    this._drawContainers(containers);
    this._drawItems(items);
  }

  _findFreeItems(entities) {
    const hero = this._entityManager.heroEntity;
    const heroEntRefComps = hero.getAll('EntityReferenceComponent');
    const items = EntityFinders.findItems(entities);
    const itemsInHeroInventory = EntityFinders.findReferencedIn(items, heroEntRefComps);

    return _.difference(items, itemsInHeroInventory);
  }

  processEntities(gameTime, entities, input) {
    const entitySpatialGrid = this._entityManager.entitySpatialGrid;
    const ents = entitySpatialGrid.getAdjacentEntities(this._entityManager.heroEntity);
    const containers = EntityFinders.findContainers(ents);
    const items = this._findFreeItems(ents);

    this._drawContainers(containers);
    this._drawItems(items);
  }

  _drawContainers(containers) {
    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
    const topLeftPos = tileMap.topLeftPos;

    for (let i = 0; i < containers.length; ++i) {
      const container = containers[i];
      const position = container.get('PositionComponent');
      const screenPosition = ScreenUtils.translateWorldPositionToScreenPosition(position.position, topLeftPos).divide(
        Const.ScreenScale
      );

      const sprites = container.getAllKeyed('SpriteComponent', 'id');
      const shadow = sprites['shadow'].sprite;
      shadow.position.set(screenPosition.x, screenPosition.y + 2);

      const isClosed = container.get('ContainerComponent').isClosed;
      const animatedSprite = container.get('AnimatedSpriteComponent').animatedSprite;
      animatedSprite.position.set(screenPosition.x, screenPosition.y);
      animatedSprite.gotoAndStop(isClosed ? 0 : 1);
    }
  }

  _drawItems(items) {
    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
    const topLeftPos = tileMap.topLeftPos;

    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      const position = item.get('PositionComponent');
      const screenPosition = ScreenUtils.translateWorldPositionToScreenPosition(position.position, topLeftPos).divide(
        Const.ScreenScale
      );

      item.get('AnimatedSpriteComponent').animatedSprite.position.set(screenPosition.x, screenPosition.y);
    }
  }

  showLootFromContainer(loot) {
    this._pixiContainer.addChild(loot.get('AnimatedSpriteComponent').animatedSprite);
  }
}
