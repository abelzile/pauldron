import * as _ from 'lodash';
import * as Const from '../const';
import System from '../system';
import Vector from '../vector';

export default class LevelRenderSystem extends System {
  constructor(pixiContainer, renderer, entityManager) {
    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

    this._centerScreen = new Vector();
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    this._centerScreen.x = Const.ScreenWidth / Const.ScreenScale / 2;
    this._centerScreen.y = Const.ScreenHeight / Const.ScreenScale / 2;

    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
    const spriteLayers = tileMap.spriteLayers;

    for (let i = 0; i < spriteLayers.length; ++i) {
      const spriteLayer = spriteLayers[i];

      for (let j = 0; j < spriteLayer.length; ++j) {
        this._pixiContainer.addChild(spriteLayer[j]);
      }
    }

    this._calculatePxPos(this._entityManager.heroEntity.get('PositionComponent'), 0, 0, tileMap.topLeftPos);
  }

  processEntities(gameTime, entities) {
    this._drawTiles();
  }

  _drawTiles() {
    const heroPosition = this._entityManager.heroEntity.get('PositionComponent');
    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');

    const lenX = tileMap.collisionLayer[0].length;
    const lenY = tileMap.collisionLayer.length;
    const minX = _.clamp(Math.floor(heroPosition.x) - Const.ViewPortTileWidth / 2, 0, lenX);
    const maxX = _.clamp(minX + Const.ViewPortTileWidth, 0, lenX);
    const minY = _.clamp(Math.floor(heroPosition.y) - Const.ViewPortTileHeight / 2, 0, lenY);
    const maxY = _.clamp(minY + Const.ViewPortTileHeight, 0, lenY);

    this._calculatePxPos(heroPosition, 0, 0, tileMap.topLeftPos);

    const textureMap = tileMap.textureMap;
    const visualLayers = tileMap.visualLayers;
    const spriteLayers = tileMap.spriteLayers;

    let idx = 0;
    const pos = Vector.pnew();

    for (let y = minY; y < maxY; ++y) {
      for (let x = minX; x < maxX; ++x) {
        this._calculatePxPos(heroPosition, x, y, pos);

        for (let i = 0; i < visualLayers.length; ++i) {
          const visualLayer = visualLayers[i];
          const spriteLayer = spriteLayers[i];

          const sprite = spriteLayer[idx];
          sprite.texture = textureMap[visualLayer[y][x]];
          sprite.position.x = pos.x;
          sprite.position.y = pos.y;
        }

        idx++;
      }
    }

    pos.pdispose();
  }

  _calculatePxPos(heroPosition, x, y, outPos) {
    const offsetX = x - heroPosition.position.x;
    const offsetY = y - heroPosition.position.y;

    const offsetPxX = offsetX * Const.TilePixelSize;
    const offsetPxY = offsetY * Const.TilePixelSize;

    outPos.x = this._centerScreen.x + offsetPxX;
    outPos.y = this._centerScreen.y + offsetPxY;
  }
}
