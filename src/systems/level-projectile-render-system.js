import * as EntityFinders from '../entity-finders';
import System from '../system';


export default class LevelProjectileRenderSystem extends System {

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

    for (const projectileEnt of EntityFinders.findProjectiles(entities)) {
      this._pixiContainer.addChild(projectileEnt.get('MovieClipComponent').movieClip);
    }

  }

  processEntities(gameTime, entities) {

    const projectileEnts = EntityFinders.findProjectiles(entities);

    this._drawProjectiles(projectileEnts);

  }

  _drawProjectiles(projectileEnts) {

    if (projectileEnts.length === 0) { return; }

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;
    const tilePxSize = this._renderer.tilePxSize;

    const centerScreenX = screenWidth / scale / 2.0;
    const centerScreenY = screenHeight / scale / 2.0;

    const heroEnt = this._entityManager.heroEntity;
    const heroPosComp = heroEnt.get('PositionComponent');

    for (const projectileEnt of projectileEnts) {

      const projectilePosComp = projectileEnt.get('PositionComponent');
      const offsetX = projectilePosComp.position.x - heroPosComp.position.x;
      const offsetY = projectilePosComp.position.y - heroPosComp.position.y;

      const offsetPxX = offsetX * tilePxSize;
      const offsetPxY = offsetY * tilePxSize;

      const posX = centerScreenX + offsetPxX;
      const posY = centerScreenY + offsetPxY;

      const movieClip = projectileEnt.get('MovieClipComponent').movieClip;

      if (!movieClip.parent) {
        this._pixiContainer.addChild(movieClip);
      }
      //movieClip.position.set(Math.floor(posX), Math.floor(posY));
      movieClip.position.set(posX, posY);

    }

  }

}
