import * as ArrayUtils from '../utils/array-utils';
import * as HexGrid from '../hex-grid';
import _ from 'lodash';
import Component from '../component';
import * as Pixi from 'pixi.js';


export default class WorldMapComponent extends Component {

  constructor(worldData, visualLayers, frames) {

    super();

    this.worldData = worldData;
    this.visualLayers = visualLayers;
    this.frames = frames;
    this.spriteLayers = [];

    _.each(this.visualLayers, (visualLayer) => {

      let spriteLayer = [];

      for (let y = 0; y < visualLayer.length; ++y) {

        let spriteRow = [];

        for (let x = 0; x < visualLayer[y].length; ++x) {

          let tileId = visualLayer[y][x];

          spriteRow.push(new Pixi.Sprite(frames[tileId]));

        }

        spriteLayer.push(spriteRow);

      }

      this.spriteLayers.push(spriteLayer);

    });

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