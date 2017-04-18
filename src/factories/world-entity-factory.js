'use strict';
import * as _ from 'lodash';
import * as ArrayUtils from '../utils/array-utils';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import * as ScreenUtils from '../utils/screen-utils';
import Entity from '../entity';
import ScreenHeaderComponent from '../components/screen-header-component';
import TextButtonComponent from '../components/text-button-component';
import WorldMapComponent from '../components/world-map-component';
import WorldMapPointerComponent from '../components/world-map-pointer-component';
import WorldMapTileComponent from '../components/world-map-tile-component';

export function buildWorldEntity(width, height, imageResources) {
  const worldLevelTypes = _.shuffle(_.values(Const.WorldLevelType));
  ArrayUtils.remove(worldLevelTypes, Const.WorldLevelType.Woodland);
  ArrayUtils.remove(worldLevelTypes, Const.WorldLevelType.Lava);
  worldLevelTypes.unshift(Const.WorldLevelType.Woodland);
  worldLevelTypes.push(Const.WorldLevelType.Lava);

  if (worldLevelTypes.length !== width * height) {
    throw new Error(
      `Not enough world types available (${worldLevelTypes.length}) to fill desired world size (${width}x${height})`
    );
  }

  const worldTexture = imageResources['world'].texture;
  const tileFrames = Object.create(null);
  tileFrames[Const.WorldLevelType.Woodland] = [new Pixi.Texture(worldTexture, new Pixi.Rectangle(16, 0, 16, 16))];
  tileFrames[Const.WorldLevelType.Desert] = [new Pixi.Texture(worldTexture, new Pixi.Rectangle(32, 0, 16, 16))];
  tileFrames[Const.WorldLevelType.Graveyard] = [new Pixi.Texture(worldTexture, new Pixi.Rectangle(48, 0, 16, 16))];
  tileFrames[Const.WorldLevelType.Lava] = [new Pixi.Texture(worldTexture, new Pixi.Rectangle(64, 0, 16, 16))];
  tileFrames[Const.WorldLevelType.Mushroom] = [new Pixi.Texture(worldTexture, new Pixi.Rectangle(80, 0, 16, 16))];
  tileFrames[Const.WorldLevelType.Ruins] = [new Pixi.Texture(worldTexture, new Pixi.Rectangle(96, 0, 16, 16))];
  tileFrames[Const.WorldLevelType.Stone] = [new Pixi.Texture(worldTexture, new Pixi.Rectangle(112, 0, 16, 16))];
  tileFrames[Const.WorldLevelType.Swamp] = [new Pixi.Texture(worldTexture, new Pixi.Rectangle(128, 0, 16, 16))];
  tileFrames[Const.WorldLevelType.Winter] = [new Pixi.Texture(worldTexture, new Pixi.Rectangle(144, 0, 16, 16))];

  const unvisitedFrame = new Pixi.Texture(worldTexture, new Pixi.Rectangle(0, 0, 16, 16));

  _.forOwn(tileFrames, value => {
    value.unshift(unvisitedFrame);
  });

  const world = new Entity(Const.EntityId.World).add(new WorldMapComponent(width, height));

  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const levelNum = y * height + x;
      const levelType = worldLevelTypes[levelNum];
      const difficulty = x + y;

      world.add(new WorldMapTileComponent('world_' + levelNum, levelNum, levelType, difficulty, tileFrames[levelType]));
    }
  }

  return world;

  /*
  const worldData = [];

  for (let y = 0; y < height; ++y) {
    const worldDataRow = [];

    for (let x = 0; x < width; ++x) {
      const levelNum = y * height + x;
      const levelType = y === 0 && x === 0 ? Const.WorldLevelType.Ruins : _.sample(worldLevelTypes);
      const difficulty = x + y;

      worldDataRow.push({
        levelName: 'world_' + levelNum,
        levelNum: levelNum,
        levelType: levelType,
        difficulty: difficulty,
        levelEntityId: '',
        isVisited: false,
        isComplete: false
      });
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

  return new Entity(Const.EntityId.World).add(new WorldMapComponent(worldData, visualLayers, tileFrames));
  */
}

export function buildWorldMapGuiEntity(imageResources) {
  const worldTexture = imageResources['world'].texture;
  const dialogGuiTexture = imageResources['gui'].texture;
  const buttonCornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(104, 0, 4, 4));

  return new Entity(Const.EntityId.WorldMapGui)
    .add(new ScreenHeaderComponent(ScreenUtils.buildHeading1Text('The World'), Const.HeaderTextStyle, 1))
    .add(
      new TextButtonComponent(
        'travel',
        buttonCornerDecoTexture,
        Const.WorldButtonText.Travel,
        Const.WorldMapButtonTextStyle,
        1
      )
    )
    .add(
      new TextButtonComponent(
        'cancel',
        buttonCornerDecoTexture,
        Const.WorldButtonText.Cancel,
        Const.WorldMapButtonTextStyle,
        1
      )
    )
    .add(new WorldMapPointerComponent([new Pixi.Texture(worldTexture, new Pixi.Rectangle(0, 16, 20, 20))]));
}
