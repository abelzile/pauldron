import _ from 'lodash';
import System from '../system';


export default class LevelMapRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    for (const layer of this._entityManager.currentLevelEntity.get('TileMapComponent').spriteLayers) {

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

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;
    const tilePxSize = this._renderer.tilePxSize;

    const centerScreenX = screenWidth / scale / 2.0;
    const centerScreenY = screenHeight / scale / 2.0;

    const heroPosition = this._entityManager.heroEntity.get('PositionComponent');
    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');

    const lenX = tileMap.collisionLayer[0].length;
    const lenY = tileMap.collisionLayer.length;
    const minX = _.clamp(Math.floor(heroPosition.x) - 15, 0, lenX);
    const maxX = _.clamp(Math.floor(heroPosition.x) + 15, 0, lenX);
    const minY = _.clamp(Math.floor(heroPosition.y) - 9, 0, lenY);
    const maxY = _.clamp(Math.floor(heroPosition.y) + 9, 0, lenY);

    for (const layer of tileMap.spriteLayers) {

      for (let y = 0; y < layer.length; ++y) {

        const row = layer[y];

        for (let x = 0; x < row.length; ++x) {

          const offsetX = x - heroPosition.position.x;
          const offsetY = y - heroPosition.position.y;

          const offsetPxX = offsetX * tilePxSize;
          const offsetPxY = offsetY * tilePxSize;

          const posX = centerScreenX + offsetPxX;
          const posY = centerScreenY + offsetPxY;

          const sprite = row[x];
          sprite.position.x = posX;
          sprite.position.y = posY;
          sprite.visible = !!(_.inRange(x, minX, maxX) && _.inRange(y, minY, maxY));

        }

      }

    }

  }

}
