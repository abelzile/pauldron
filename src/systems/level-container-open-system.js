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

      const loots = this._generateLoot(container);
      const containerPos = container.get('PositionComponent');
      const containerPosTrunc = new Vector(Math.trunc(containerPos.x), Math.trunc(containerPos.y));
      const neighborTiles = tileMap.getNeighborTiles(containerPosTrunc.x, containerPosTrunc.y, loots.length, false);

      container.get('ContainerComponent').isClosed = false;

      for (let i = 0; i < loots.length; ++i) {
        const loot = loots[i];
        const neighborTile = neighborTiles[i];
        loot.get('PositionComponent').position.set(neighborTile.x, neighborTile.y);
        this.emit('level-container-system.show-container-loot', loot);
      }

      this.emit('level-container-system.open-container', container);

      container.deleted = true;
      this._entityManager.removeLevelContainerComponentRepresenting(container);
    }
  }

  _generateLoot(containerEntity) {
    const container = containerEntity.get('ContainerComponent');
    const capacity = _.random(1, container.capacity);
    const newLoots = [];

    for (let i = 0; i < capacity; ++i) {
      const newLoot = this._entityManager.buildLoot(containerEntity);
      this._entityManager.add(newLoot);
      this._entityManager.entitySpatialGridAdd(newLoot);
      newLoots[i] = newLoot;
    }

    return newLoots;
  }
}
