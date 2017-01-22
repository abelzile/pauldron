import Component from '../component';
import Vector from '../vector';

export default class TileMapComponent extends Component {

  constructor(
    collisionLayer,
    visualLayers,
    fogOfWarLayer,
    textureMap,
    visualLayerSprites,
    fogOfWarSprites,
    dungeon
  ) {

    super();

    this.collisionLayer = collisionLayer;
    this.visualLayers = visualLayers;
    this.fogOfWarLayer = fogOfWarLayer;
    this.spriteLayers = visualLayerSprites;
    this.fogOfWarSpriteLayer = fogOfWarSprites;
    this.dungeon = dungeon;
    this.topLeftPos = new Vector();
    this.textureMap = textureMap;

    for (let i = 0; i < this.dungeon.rooms.length; ++i) {
      this.dungeon.rooms[i].explored = (this.dungeon.rooms[i] === this.dungeon.startRoom);
    }

    for (let i = 0; i < this.dungeon.hallways.length; ++i) {
      this.dungeon.hallways[i].explored = false;
    }

    for (let i = 0; i < this.dungeon.doors.length; ++i) {
      this.dungeon.doors[i].open = false;
    }

  }

  get rooms() { return this.dungeon.rooms; }

  get hallways() { return this.dungeon.hallways; }

  get doors() { return this.dungeon.doors; }


  containsImpassible(minX, maxX, minY, maxY) {

    for (let y = minY; y <= maxY; ++y) {
      for (let x = minX; x <= maxX; ++x) {
        if (this.collisionLayer[y][x] > 0) {
          return true;
        }
      }
    }

    return false;

  }

  isWithinY(pos) {

    const collisionMinY = 0;
    const collisionMaxY = this.collisionLayer.length - 1;

    return collisionMinY < pos && pos < collisionMaxY;

  }

  isWithinX(pos) {

    const collisionMinX = 0;
    const collisionMaxX = this.collisionLayer[0].length - 1;

    return collisionMinX < pos && pos < collisionMaxX;

  }

  clearFogOfWar(rect) {

    for (let y = rect.y; y < rect.y + rect.height; ++y) {

      for (let x = rect.x; x < rect.x + rect.width; ++x) {

        this.fogOfWarLayer[y][x] = 0;
        //this.fogOfWarSpriteLayer[y][x].alpha = 0;
        /*this.fogOfWarSpriteLayer[y][x].play();*/
      }

    }

  }

}
