import * as _ from "lodash";
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import * as ScreenUtils from '../utils/screen-utils';
import Entity from '../entity';
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

  const worldLevelTypes = _.values(Const.WorldLevelType);
  const worldData = [];

  for (let y = 0; y < height; ++y) {

    const worldDataRow = [];

    for (let x = 0; x < width; ++x) {

      const levelNum = (y * height) + x;
      const difficulty = x + y;

      worldDataRow.push(
        {
          levelName: 'world_' + levelNum,
          levelNum: levelNum,
          levelType: _.sample(worldLevelTypes),
          difficulty: difficulty,
          levelEntityId: '',
          isVisited: false,
          isComplete: false,
        }
      );

    }

    worldData.push(worldDataRow);

  }

  const visualLayers = [];

  const visualLayer1 = [];
  visualLayers.push(visualLayer1);

  for (let y = 0; y < height; ++y) {

    const visualLayerRow = [];
    visualLayer1.push(visualLayerRow);

    for (let x = 0; x < width; ++x) {
      visualLayerRow.push(1); //TODO: map to proper tile texture that represents levelType value.
    }

  }

  return new Entity(Const.EntityId.World)
    .add(new WorldMapComponent(worldData, visualLayers, tileFrames));

}

export function buildWorldMapGuiEntity(imageResources) {

  const worldTexture = imageResources['world'].texture;
  const dialogGuiTexture = imageResources['gui'].texture;
  const buttonCornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(104, 0, 4, 4));

  const pointerFrames = [
    new Pixi.Texture(worldTexture, new Pixi.Rectangle(0, 0, 16, 18))
  ];

  const worldMapPointerComponent = new WorldMapPointerComponent(pointerFrames);
  worldMapPointerComponent.pointedToHex = { q: 0, r: -0, s: 0 };

  return new Entity()
    .add(new ScreenHeaderComponent(ScreenUtils.buildHeading1Text('The World'), Const.HeaderTextStyle, 1))
    .add(new TextButtonComponent('travel', buttonCornerDecoTexture, Const.WorldButtonText.Travel, Const.WorldMapButtonTextStyle, 1))
    .add(new TextButtonComponent('cancel', buttonCornerDecoTexture, Const.WorldButtonText.Cancel, Const.WorldMapButtonTextStyle, 1))
    .add(worldMapPointerComponent);

}