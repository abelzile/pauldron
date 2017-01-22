'use strict';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import * as ScreenUtils from '../utils/screen-utils';
import DialogHeaderComponent from '../components/dialog-header-component';
import Entity from '../entity';
import GraphicsComponent from '../components/graphics-component';

export function buildLevelMapGui(imageResources) {

  const dialogGuiTexture = imageResources['gui'].texture;

  const cornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(0, 0, 16, 16));

  const frames = [
    new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(16, 0, 7, 7))
  ];

  return new Entity(Const.EntityId.LevelMapGui)
    .add(new DialogHeaderComponent(ScreenUtils.buildHeading1Text('Map'), Const.HeaderTextStyle, 1, frames, cornerDecoTexture))
    .add(new GraphicsComponent())
    ;

}