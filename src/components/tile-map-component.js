import Component from '../component';
import Vector from '../vector';
import * as ArrayUtils from '../utils/array-utils';

export default class TileMapComponent extends Component {
  constructor(collisionLayer, visualLayers, fogOfWarLayer, textureMap, visualLayerSprites, fogOfWarSprites) {
    super();

    this.collisionLayer = collisionLayer;
    this.visualLayers = visualLayers;
    this.fogOfWarLayer = fogOfWarLayer;
    this.textureMap = textureMap;
    this.spriteLayers = visualLayerSprites;
    this.fogOfWarSpriteLayer = fogOfWarSprites;
    this.topLeftPos = new Vector();
  }

  containsImpassible(minX, maxX, minY, maxY) {
    for (let y = minY; y <= maxY; ++y) {
      for (let x = minX; x <= maxX; ++x) {
        if (this.isImpassible(x, y)) {
          return true;
        }
      }
    }
    return false;
  }

  isImpassible(x, y) {
    return this.collisionLayer[y][x] > 0;
  }

  isWithinY(pos) {
    return 0 < pos && pos < this.collisionLayer.length - 1;
  }

  isWithinX(pos) {
    return 0 < pos && pos < this.collisionLayer[0].length - 1;
  }

  clearFogOfWar(rect) {
    for (let y = rect.y; y < rect.y + rect.height; ++y) {
      for (let x = rect.x; x < rect.x + rect.width; ++x) {
        this.fogOfWarLayer[y][x] = 0;
      }
    }
  }

  findSurroundingPassibleTiles(x0, y0, radius, includeOrigin = true) {
    const points = [];
    const radiusSquared = radius * radius;

    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        if (x * x + y * y <= radiusSquared) {
          const newX = x0 + x;
          const newY = y0 + y;

          if (!includeOrigin && newX === x0 && newY === y0) {
            continue;
          }

          if (!this.isImpassible(newX, newY)) {
            points.push(new Vector(newX, newY));
          }
        }
      }
    }

    return points;
  }

  getNeighborTiles(x0, y0, requiredTileNum, includeOrigin = true) {
    let radius = 0;
    let neighborTiles = null;

    do {
      radius++;
      neighborTiles = this.findSurroundingPassibleTiles(x0, y0, radius, includeOrigin);
    } while (neighborTiles.length < requiredTileNum);

    return neighborTiles;
  }
}
