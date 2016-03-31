import _ from 'lodash';
import Pixi from 'pixi.js';
import Component from '../component';
import * as ArrayUtils from '../utils/array-utils';


export default class TileMapComponent extends Component {

  constructor(collisionLayer, visualLayers, frames) {

    super();

    this._collisionLayer = collisionLayer;
    this._visualLayers = visualLayers;
    this._frames = frames;
    this._spriteLayers = [];

    _.each(this._visualLayers, (visualLayer) => {

      let spriteLayer = [];

      for (let y = 0; y < visualLayer.length; ++y) {

        let spriteRow = [];

        for (let x = 0; x < visualLayer[y].length; ++x) {

          let tileId = visualLayer[y][x];

          spriteRow.push(new Pixi.Sprite(frames[tileId]));

        }

        spriteLayer.push(spriteRow);

      }

      this._spriteLayers.push(spriteLayer);

    });

  }

  get collisionLayer() { return this._collisionLayer; }

  get spriteLayers() { return this._spriteLayers; }

  containsImpassible(minX, maxX, minY, maxY) {

    for (let y = minY; y <= maxY; ++y) {
      for (let x = minX; x <= maxX; ++x) {
        if (this._collisionLayer[y][x] > 0) {
          return true;
        }
      }
    }

    return false;

  }

  isWithinX(pos) {

    const collisionMinY = 0;
    const collisionMaxY = this._collisionLayer.length - 1;

    return collisionMinY < pos && pos < collisionMaxY;

  }

  isWithinY(pos) {

    const collisionMinX = 0;
    const collisionMaxX = this._collisionLayer[0].length - 1;

    return collisionMinX < pos && pos < collisionMaxX;

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
