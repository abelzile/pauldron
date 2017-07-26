'use strict';
import * as _ from 'lodash';
import * as ArrayUtils from '../utils/array-utils';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import * as ScreenUtils from '../utils/screen-utils';
import Entity from '../entity';
import TextButtonComponent from '../components/text-button-component';
import TextComponent from '../components/text-component';
import WorldMapComponent from '../components/world-map-component';
import WorldMapPointerComponent from '../components/world-map-pointer-component';
import WorldMapTileComponent from '../components/world-map-tile-component';

export function buildWorld(width, height, imageResources) {
  const worldLevelTypes = _.shuffle(_.values(Const.WorldLevelType));
  _setFirstLevelType(worldLevelTypes, Const.WorldLevelType.Woodland);
  _setLastLevelType(worldLevelTypes, Const.WorldLevelType.Lava);

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
      const tier = x + y;

      world.add(new WorldMapTileComponent('world_' + levelNum, levelNum, levelType, tier, tileFrames[levelType]));
    }
  }

  return world;
}

export function buildWorldMapGui(imageResources) {
  const worldTexture = imageResources['world'].texture;
  const dialogGuiTexture = imageResources['gui'].texture;
  const buttonCornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(104, 0, 4, 4));

  return new Entity(Const.EntityId.WorldMapGui)
    .add(new TextComponent(ScreenUtils.buildHeading1Text('The World'), Const.HeaderTextStyle, 1, 'header'))
    .add(
      new TextButtonComponent('travel', buttonCornerDecoTexture, Const.WorldButtonText.Travel, Const.BasicTextStyle, 1)
    )
    .add(
      new TextButtonComponent('cancel', buttonCornerDecoTexture, Const.WorldButtonText.Cancel, Const.BasicTextStyle, 1)
    )
    .add(new WorldMapPointerComponent([new Pixi.Texture(worldTexture, new Pixi.Rectangle(0, 16, 20, 20))]));
}

function _setFirstLevelType(worldLevelTypes, worldType) {
  ArrayUtils.remove(worldLevelTypes, worldType);
  worldLevelTypes.unshift(worldType);
}

function _setLastLevelType(worldLevelTypes, worldType) {
  ArrayUtils.remove(worldLevelTypes, worldType);
  worldLevelTypes.push(worldType);
}
