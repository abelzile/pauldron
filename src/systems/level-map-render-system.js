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

          this._pixiContainer.addChild(row[x]);

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

    const heroPosComponent = this._entityManager.heroEntity.get('PositionComponent');

    for (const layer of this._entityManager.currentLevelEntity.get('TileMapComponent').spriteLayers) {

      for (let y = 0; y < layer.length; ++y) {

        const row = layer[y];

        for (let x = 0; x < row.length; ++x) {

          const offsetX = x - heroPosComponent.position.x;
          const offsetY = y - heroPosComponent.position.y;

          const offsetPxX = offsetX * tilePxSize;
          const offsetPxY = offsetY * tilePxSize;

          const posX = centerScreenX + offsetPxX;
          const posY = centerScreenY + offsetPxY;

          const sprite = row[x];
          sprite.position.set(posX, posY);

        }

      }

    }

  }

}
