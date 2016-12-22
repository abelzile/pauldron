import * as ArrayUtils from '../utils/array-utils';
import * as HexGrid from '../hex-grid';
import Component from '../component';
import * as Pixi from 'pixi.js';


export default class WorldMapComponent extends Component {

  constructor(worldData, visualLayers, frames) {

    super();

    this.worldData = worldData;
    this.visualLayers = visualLayers;
    this.frames = frames;
    this.spriteLayers = [];

    for (let i = 0; i < this.visualLayers.length; ++i) {

      const visualLayer = this.visualLayers[i];
      const spriteLayer = [];

      for (let y = 0; y < visualLayer.length; ++y) {

        const spriteRow = [];

        for (let x = 0; x < visualLayer[y].length; ++x) {

          const tileId = visualLayer[y][x];

          spriteRow.push(new Pixi.Sprite(frames[tileId]));

        }

        spriteLayer.push(spriteRow);

      }

      this.spriteLayers.push(spriteLayer);

    }

  }

  get worldTileCount() {
    return this.worldData.length * this.worldData[0].length;
  }

  getWorldDataByName(levelName) {
    return this._getWorldData(WorldMapComponent._findByName, levelName);
  }

  getWorldDataByNum(levelNum) {
    return this._getWorldData(WorldMapComponent._findByNum, levelNum);
  }

  _getWorldData(finder, toFind) {

    for (let y = 0; y < this.worldData.length; ++y) {

      const row = this.worldData[y];

      for (let x = 0; x < row.length; ++x) {

        const data = row[x];

        if (finder(data, toFind)) {
          return data;
        }

      }

    }

    return null;

  }

  static _findByName(data, val) {
    return data.levelName === val;
  }

  static _findByNum(data, val) {
    return data.levelNum === val;
  }

  getHexWithLevelEntityId(id) {

    for (let y = 0; y < this.worldData.length; ++y) {

      const row = this.worldData[y];

      for (let x = 0; x < row.length; ++x) {

        const data = row[x];

        if (data.levelEntityId === id) {
          return HexGrid.Hex(x, y);
        }

      }

    }

    return HexGrid.Hex(0, 0);

  }

}