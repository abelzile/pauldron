import * as Const from '../const';
import * as ScreenUtils from '../utils/screen-utils';
import _ from "lodash";
import Entity from '../entity';
import Pixi from 'pixi.js';
import ScreenHeaderComponent from "../components/screen-header-component";
import TextButtonComponent from '../components/text-button-component';
import WorldMapComponent from '../components/world-map-component';
import WorldMapPointerComponent from '../components/world-map-pointer-component';


export function buildWorldEntity(width, height, imageResources) {

  const worldTexture = imageResources['world'].texture;

  const tileFrames = [
    new Pixi.Texture(worldTexture, new Pixi.Rectangle(0, 0, 16, 18)), // blank
    new Pixi.Texture(worldTexture, new Pixi.Rectangle(16, 0, 16, 18))
  ];

  const worldData = [];

  for (let y = 0; y < height; ++y) {

    const worldDataRow = [];
    worldData.push(worldDataRow);

    for (let x = 0; x < width; ++x) {

      const difficulty = x + y;

      worldDataRow.push({
                          levelType: 1,
                          difficulty: difficulty,
                          levelEntityId: ''
                        });

    }

  }

  const visualLayers = [];

  const visualLayer1 = [];
  visualLayers.push(visualLayer1);

  for (let y = 0; y < height; ++y) {

    const visualLayerRow = [];
    visualLayer1.push(visualLayerRow);

    for (let x = 0; x < width; ++x) {
      visualLayerRow.push(worldData[y][x].levelType);
    }

  }

  return new Entity().add(new WorldMapComponent(worldData, visualLayers, tileFrames));

}

export function buildWorldMapGuiEntity(imageResources) {

  const worldTexture = imageResources['world'].texture;

  const pointerFrames = [
    new Pixi.Texture(worldTexture, new Pixi.Rectangle(0, 0, 16, 18))
  ];

  return new Entity()
    .add(new ScreenHeaderComponent(ScreenUtils.buildHeading1Text('The World'), Const.HeaderTextStyle, 1))
    .add(new TextButtonComponent(Const.WorldButtonText.Travel, Const.WorldMapButtonTextStyle))
    .add(new TextButtonComponent(Const.WorldButtonText.Cancel, Const.WorldMapButtonTextStyle))
    .add(new WorldMapPointerComponent(pointerFrames));

}