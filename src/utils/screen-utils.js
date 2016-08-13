'use strict';
import * as Const from '../const';
import Point from '../point';


export function buildHeading1Text(text) {

  const leftDeco = Const.Char.WhiteLeftPointingSmallTriangle + Const.Char.WhiteDiamondContainingBlackSmallDiamond;
  const rightDeco = Const.Char.WhiteDiamondContainingBlackSmallDiamond + Const.Char.WhiteRightPointingSmallTriangle;
  const line = Const.Char.BoxDrawingsLightHorizontal.repeat(20);

  return line + ' ' + leftDeco + ' ' + text + ' ' + rightDeco + ' ' + line;

}

export function buildHeading2Text(text, underlineCharNum) {

  const halfLine = Const.Char.BoxDrawingsLightHorizontal.repeat(underlineCharNum / 2);

  return text +
    '\n' +
    halfLine +
    Const.Char.WhiteLeftPointingSmallTriangle +
    Const.Char.WhiteDiamondContainingBlackSmallDiamond +
    Const.Char.WhiteRightPointingSmallTriangle +
    halfLine;

}

export function translateScreenPositionToWorldPosition(screenPosition, heroPosition, renderer) {

  const screenTilePxSize = renderer.tilePxSize / renderer.globalScale;
  const screenTileWidth = renderer.width / screenTilePxSize;
  const screenTileHeight = renderer.height / screenTilePxSize;

  const leftTile = heroPosition.x - (screenTileWidth / 2);
  const topTile = heroPosition.y - (screenTileHeight / 2);

  const worldPosX = leftTile + (screenPosition.x / screenTilePxSize);
  const worldPosY = topTile + (screenPosition.y / screenTilePxSize);

  return new Point(worldPosX, worldPosY);

}


export function translateWorldPositionToScreenPosition(worldPos, screenTopLeftPos, scale, tilePxSize) {

  const worldPosX = worldPos.x;
  const worldPosY = worldPos.y;
  const screenTopLeftPxX = screenTopLeftPos.x;
  const screenTopLeftPxY = screenTopLeftPos.y;

  const topLeftTilePxX = screenTopLeftPxX * scale;
  const topLeftTilePxY = screenTopLeftPxY * scale;

  const pxPosX = worldPosX * scale * tilePxSize;
  const pxPosY = worldPosY * scale * tilePxSize;

  const screenPxPosX = pxPosX + topLeftTilePxX;
  const screenPxPosY = pxPosY + topLeftTilePxY;

  return new Point(screenPxPosX, screenPxPosY);

}
