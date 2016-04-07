import * as ArrayUtils from '../utils/array-utils';
import * as HexGrid from '../hex-grid';
import _ from 'lodash';
import Component from '../component';
import Pixi from 'pixi.js';


export default class WorldMapComponent extends Component {

  constructor(worldData, visualLayers, frames) {

    super();

    this._worldData = worldData;
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

  get worldData() { return this._worldData; }

  get visualLayers() { return this._visualLayers; }

  get spriteLayers() { return this._spriteLayers; }

  getHexWithLevelEntityId(id) {

    for (let y = 0; y < this._worldData.length; ++y) {

      const row = this._worldData[y];

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