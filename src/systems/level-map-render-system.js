import _ from 'lodash';
import System from '../system';
import * as Const from '../const';
import Vector from '../vector';


export default class LevelMapRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

    this._pos = new Vector();
    this._centerScreen = new Vector();

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    this._centerScreen.x = Const.ScreenWidth / Const.ScreenScale / 2;
    this._centerScreen.y = Const.ScreenHeight / Const.ScreenScale / 2;
    this._pos.zero();

    const spriteLayers = this._entityManager.currentLevelEntity.get('TileMapComponent').spriteLayers;

    for (let i = 0; i < spriteLayers.length; ++i) {

      const layer = spriteLayers[i];

      for (let y = 0; y < layer.length; ++y) {

        const row = layer[y];

        for (let x = 0; x < row.length; ++x) {

          const sprite = row[x];
          sprite.visible = false;
          this._pixiContainer.addChild(sprite);

        }

      }

    }

  }

  processEntities(gameTime, entities) {

    this._drawTiles();

  }

  _drawTiles() {

    const heroPosition = this._entityManager.heroEntity.get('PositionComponent');
    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');

    const lenX = tileMap.collisionLayer[0].length;
    const lenY = tileMap.collisionLayer.length;
    const minX = _.clamp(Math.floor(heroPosition.x) - 16, 0, lenX);
    const maxX = _.clamp(Math.ceil(heroPosition.x) + 16, 0, lenX);
    const minY = _.clamp(Math.floor(heroPosition.y) - 10, 0, lenY);
    const maxY = _.clamp(Math.ceil(heroPosition.y) + 10, 0, lenY);

    const spriteLayers = tileMap.spriteLayers;

    for (let i = 0; i < spriteLayers.length; ++i) {

      const layer = spriteLayers[i];

      // position 0, 0 tile because it's used in other positioning of mobs and projectiles.

      this._calculatePxPos(this._pos, heroPosition, 0, 0);

      const sprite = layer[0][0];
      sprite.position.x = this._pos.x;
      sprite.position.y = this._pos.y;
      sprite.visible = _.inRange(0, minX, maxX) && _.inRange(0, minY, maxY);

      for (let y = minY; y < maxY; ++y) {

        const row = layer[y];

        for (let x = minX; x < maxX; ++x) {

          this._calculatePxPos(this._pos, heroPosition, x, y);

          const sprite = row[x];
          sprite.position.x = this._pos.x;
          sprite.position.y = this._pos.y;
          sprite.visible = _.inRange(x, minX, maxX) && _.inRange(y, minY, maxY);

        }

      }

    }

  }

  _calculatePxPos(outPos, heroPosition, x, y) {

    const offsetX = x - heroPosition.position.x;
    const offsetY = y - heroPosition.position.y;

    const offsetPxX = offsetX * Const.TilePixelSize;
    const offsetPxY = offsetY * Const.TilePixelSize;

    outPos.x = this._centerScreen.x + offsetPxX;
    outPos.y = this._centerScreen.y + offsetPxY;

  }

}
