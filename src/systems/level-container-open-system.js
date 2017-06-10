import * as _ from 'lodash';
import * as EntityFinders from '../entity-finders';
import * as EntityUtils from '../utils/entity-utils';
import System from '../system';
import Vector from '../vector';

export default class LevelContainerOpenSystem extends System {
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
    const containers = EntityFinders.findContainers(adjacentEntities);

    this._openContainers(hero, containers);
  }

  _openContainers(hero, containers) {
    if (_.isEmpty(containers)) {
      return;
    }

    const heroPositionedBoundingRect = EntityUtils.getPositionedBoundingRect(hero);
    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');

    for (const container of containers) {
      if (
        !container.get('ContainerComponent').isClosed ||
        !EntityUtils.getPositionedBoundingRect(container).intersectsWith(heroPositionedBoundingRect)
      ) {
        continue;
      }

      const loots = this._entityManager.openContainer(container);
      const containerPos = container.get('PositionComponent');
      const containerPosTrunc = new Vector(Math.trunc(containerPos.x), Math.trunc(containerPos.y));
      const neighborTiles = tileMap.getNeighborTiles(
        containerPosTrunc.x,
        containerPosTrunc.y,
        loots.length,
        false
      );

      container.get('ContainerComponent').isClosed = false;

      for (let i = 0; i < loots.length; ++i) {
        const loot = loots[i];
        loot.get('PositionComponent').position.set(neighborTiles[i].x, neighborTiles[i].y);
        this._entityManager.add(loot);
        this._entityManager.entitySpatialGridAdd(loot);
        this.emit('level-container-system.show-container-loot', loot);
      }

      this.emit('level-container-system.open-container', container);
    }
  }
}