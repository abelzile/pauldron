import * as Const from '../const';
import Vector from '../vector';

export function buildHeading1Text(text) {
  const leftDeco = Const.Char.WhiteLeftPointingSmallTriangle + Const.Char.WhiteDiamondContainingBlackSmallDiamond;
  const rightDeco = Const.Char.WhiteDiamondContainingBlackSmallDiamond + Const.Char.WhiteRightPointingSmallTriangle;
  const line = Const.Char.BoxDrawingsLightHorizontal.repeat(20);

  return line + ' ' + leftDeco + ' ' + text + ' ' + rightDeco + ' ' + line;
}

export function buildHeading2Text(text, underlineCharNum) {
  const halfLine = Const.Char.BoxDrawingsLightHorizontal.repeat(underlineCharNum / 2);

  return (
    text +
    '\n' +
    halfLine +
    Const.Char.WhiteLeftPointingSmallTriangle +
    Const.Char.WhiteDiamondContainingBlackSmallDiamond +
    Const.Char.WhiteRightPointingSmallTriangle +
    halfLine
  );
}

export function translateScreenPositionToWorldPosition(screenPosition, heroPosition) {
  const scaledTilePxSize = Const.TilePixelSize / Const.ScreenScale;
  const scaledTileWidth = Const.ScreenWidth / scaledTilePxSize;
  const scaledTileHeight = Const.ScreenHeight / scaledTilePxSize;

  const leftTile = heroPosition.x - scaledTileWidth / 2;
  const topTile = heroPosition.y - scaledTileHeight / 2;

  const worldPosX = leftTile + screenPosition.x / scaledTilePxSize;
  const worldPosY = topTile + screenPosition.y / scaledTilePxSize;

  return new Vector(worldPosX, worldPosY);
}

export function translateWorldPositionToScreenPosition(worldPos, screenTopLeftPos) {
  const worldPosX = worldPos.x;
  const worldPosY = worldPos.y;
  const screenTopLeftPxX = screenTopLeftPos.x;
  const screenTopLeftPxY = screenTopLeftPos.y;
  const scaledTilePxSize = Const.ScreenScale * Const.TilePixelSize;

  const topLeftTilePxX = screenTopLeftPxX * Const.ScreenScale;
  const topLeftTilePxY = screenTopLeftPxY * Const.ScreenScale;

  const pxPosX = worldPosX * scaledTilePxSize;
  const pxPosY = worldPosY * scaledTilePxSize;

  const screenPxPosX = pxPosX + topLeftTilePxX;
  const screenPxPosY = pxPosY + topLeftTilePxY;

  return new Vector(screenPxPosX, screenPxPosY);
}
