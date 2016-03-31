import _ from 'lodash';
import Point from '../point';
import System from '../system';
import * as ArrayUtils from '../utils/array-utils';
import * as EntityFinders from '../entity-finders';


export default class LevelMobRenderSystem extends System {

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

    //TODO:Add weapon movieclips.

    const mobEnts = EntityFinders.findMobs(entities);
    const weaponEnts = EntityFinders.findWeapons(entities);

    for (const mobEnt of mobEnts) {
      this._pixiContainer.addChild(mobEnt.get('MovieClipComponent').movieClip);
    }

    this._drawMobs(mobEnts, weaponEnts); //Draw all mobds initially because some may not be adjac and will be stuck on screen.

  }

  processEntities(gameTime, entities) {

    const mobEntitySpatialGrid = this._entityManager.entitySpatialGrid;
    const mobEnts = EntityFinders.findMobs(mobEntitySpatialGrid.getAdjacentEntities(this._entityManager.heroEntity));
    const weaponEnts = EntityFinders.findWeapons(entities);

    this._drawMobs(mobEnts, weaponEnts);

  }

  _drawMobs(mobEnts, weaponEnts) {

    //TODO:Draw mob weapons

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;
    const tilePxSize = this._renderer.tilePxSize;

    const centerScreenX = screenWidth / scale / 2.0;
    const centerScreenY = screenHeight / scale / 2.0;

    const heroPosComp = this._entityManager.heroEntity.get('PositionComponent');

    for (const mobEnt of mobEnts) {

      const mobPosComp = mobEnt.get('PositionComponent');

      const offsetX = mobPosComp.position.x - heroPosComp.position.x;
      const offsetY = mobPosComp.position.y - heroPosComp.position.y;

      const offsetPxX = offsetX * tilePxSize;
      const offsetPxY = offsetY * tilePxSize;

      const posX = centerScreenX + offsetPxX;
      const posY = centerScreenY + offsetPxY;

      mobEnt.get('MovieClipComponent').movieClip.position.set(posX, posY);

    }

  }

}
