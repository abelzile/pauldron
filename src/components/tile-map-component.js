import * as ArrayUtils from '../utils/array-utils';
import _ from 'lodash';
import Component from '../component';
import * as Pixi from 'pixi.js';


export default class TileMapComponent extends Component {

  constructor(collisionLayer, visualLayers, frames, spriteLayers, rooms, hallways, doors) {

    super();

    this.collisionLayer = collisionLayer;
    this.visualLayers = visualLayers;
    this.frames = frames;
    this.spriteLayers = spriteLayers; //TODO: spriteLayer is no longer accurate. Some tiles are movieclips.

    this.rooms = [];

    for (let i = 0; i < rooms.length; ++i) {
      this.rooms.push({ explored: false, grid: rooms[i] });
    }

    this.hallways = [];

    for (let i = 0; i < hallways.length; ++i) {
      this.hallways.push({ explored: false, grid: hallways[i] });
    }

    this.doors = [];

    for (let i = 0; i < doors.length; ++i) {
      this.doors.push({ position: doors[i] });
    }

  }

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

  openDoor(x, y) {

    this.collisionLayer[y][x] = 0;

    if (this.visualLayers[1][y][x] === 1000) {
      this.visualLayers[1][y][x] = 1001;
    }

    if (this.visualLayers[1][y][x] === 1002) {
      this.visualLayers[1][y][x] = 1003;
    }

    const mc = this.spriteLayers[1][y][x];
    mc.gotoAndStop(1);

  }

  static buildFromRandomDungeonGenerator(randomDungeonGenerator, levelName, levelResources, imageResources) {

    const terrainData = levelResources['dungeon'];
    const imageTexture = imageResources['dungeon'].texture;

    const grid = randomDungeonGenerator.grid;

    const collisionLayer = ArrayUtils.create2d(grid.length, grid[0].length, 1);
    const visualHallwayLayer = ArrayUtils.create2d(grid.length, grid[0].length, 0);
    const visualRoomLayer = ArrayUtils.create2d(grid.length, grid[0].length, 0);
    const visualExtrasLayer = ArrayUtils.create2d(grid.length, grid[0].length, 0);

    const hallways = randomDungeonGenerator.hallways;

    _.each(hallways, (hallway) => {
      _.each(hallway, (hallwayPoint) => {

        collisionLayer[hallwayPoint.x][hallwayPoint.y] = 0;
        visualHallwayLayer[hallwayPoint.x][hallwayPoint.y] = _.findIndex(terrainData.frames, (f) => f.name === 'floor');

      });
    });

    const rooms = randomDungeonGenerator.rooms;

    _.each(rooms, (room) => {
      for (let y = room.y; y < room.y + room.height; ++y) {
        for (let x = room.x; x < room.x + room.width; ++x) {
          collisionLayer[y][x] = 0;
          visualRoomLayer[y][x] = _.findIndex(terrainData.frames, (f) => f.name === 'floor');
        }
      }
    });

    visualExtrasLayer[randomDungeonGenerator.entrancePos.y][randomDungeonGenerator.entrancePos.x] = _.findIndex(terrainData.frames, (f) => f.name === 'stairs-up');

    return new TileMapComponent(
      collisionLayer,
      [
        visualHallwayLayer,
        visualRoomLayer,
        visualExtrasLayer
      ],
      _.map(terrainData.frames,
            rect => new Pixi.Texture(imageTexture, new Pixi.Rectangle(rect.x, rect.y, rect.width, rect.height)))
    );

  }

  static buildFromRandomCaveGenerator(randomCaveGenerator, levelName, levelResources, imageResources) {

    const terrainData = levelResources['cave'];
    const imageTexture = imageResources['cave'].texture;

    const collisionLayer = [];
    const visualDirtLayer = [];
    const visualExtrasLayer = [];

    const grid = randomCaveGenerator.grid;

    _.each(grid, (row) => {

      const collisionRow = [];
      const dirtRow = [];
      const extrasRow = [];

      for (let i = 0; i < row.length; ++i) {

        const tile = row[i];

        collisionRow.push(tile);
        dirtRow.push((tile === 0) ? 1 : 0);
        extrasRow.push(0);
      }

      collisionLayer.push(collisionRow);
      visualDirtLayer.push(dirtRow);
      visualExtrasLayer.push(extrasRow);

    });

    visualExtrasLayer[randomCaveGenerator.entrancePos.y][randomCaveGenerator.entrancePos.x] = _.findIndex(terrainData.frames, (f) => f.name === 'stairs-up');

    return new TileMapComponent(
      collisionLayer,
      [
        visualDirtLayer,
        visualExtrasLayer
      ],
      _.map(terrainData.frames,
            rect => new Pixi.Texture(imageTexture, new Pixi.Rectangle(rect.x, rect.y, rect.width, rect.height)))
    );

  }

  static __debug2dArray(array2d) {
    let html = '';
    for (let y = 0; y < array2d.length; ++y) {
      const row = array2d[y];
      for (let x = 0; x < row.length; ++x) {
        html += row[x];
      }
      html += '<br/>';
    }
    document.getElementById('thingy').innerHTML = html;
  }

}
