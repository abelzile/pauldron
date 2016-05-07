import * as Const from '../const';
import _ from "lodash";
import Entity from '../entity';
import Pixi from 'pixi.js';
import TextButtonComponent from '../components/text-button-component';
import WorldMapComponent from '../components/world-map-component';
import WorldMapPointerComponent from '../components/world-map-pointer-component';
import ScreenHeaderComponent from "../components/screen-header-component";


export function buildWorld(width, height, imageResources) {

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

export function buildWorldMapGui(imageResources) {

  const dialogGuiTexture = imageResources['screen_gui'].texture;

  const leftDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(0, 0, 7, 5));
  const rightDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(7, 0, 7, 5));
  const dividerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(14, 0, 3, 3));
  
  const worldTexture = imageResources['world'].texture;

  const pointerFrames = [
    new Pixi.Texture(worldTexture, new Pixi.Rectangle(0, 0, 16, 18))
  ];

  return new Entity()
    .add(new ScreenHeaderComponent('The World', _.clone(Const.HeaderTextStyle), 1, leftDecoTexture, rightDecoTexture, dividerDecoTexture))
    .add(new TextButtonComponent(Const.WorldButtonText.Travel, _.clone(Const.WorldMapButtonTextStyle)))
    .add(new TextButtonComponent(Const.WorldButtonText.Cancel, _.clone(Const.WorldMapButtonTextStyle)))
    .add(new WorldMapPointerComponent(pointerFrames));

}