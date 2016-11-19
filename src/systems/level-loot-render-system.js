import * as ArrayUtils from '../utils/array-utils';
import * as EntityFinders from '../entity-finders';
import _ from 'lodash';
import System from '../system';


// Will probably be used to render more than loot, but maybe not. Rename later if needed.
export default class LevelLootRenderSystem extends System {

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

    const heroEnt = this._entityManager.heroEntity;
    const heroEntRefComps = heroEnt.getAll('EntityReferenceComponent');

    const itemEnts = EntityFinders.findItems(entities);
    const itemEntsInInventory = EntityFinders.findReferencedIn(itemEnts, heroEntRefComps);

    const freeItemEnts = _.difference(itemEnts, itemEntsInInventory);
    const containerEnts = EntityFinders.findContainers(entities);
    
    const allEnts = [].concat(containerEnts, freeItemEnts);

    for (const ents of allEnts) {
      this._pixiContainer.addChild(ents.get('AnimatedSpriteComponent').AnimatedSprite);
    }

    this._drawItems(allEnts);

  }

  processEntities(gameTime, entities, input) {

    const entitySpatialGrid = this._entityManager.entitySpatialGrid;

    const heroEnt = this._entityManager.heroEntity;
    const heroEntRefComps = heroEnt.getAll('EntityReferenceComponent');

    const itemEnts = EntityFinders.findItems(entitySpatialGrid.getAdjacentEntities(this._entityManager.heroEntity));
    const itemEntsInBackpack = EntityFinders.findReferencedIn(itemEnts, heroEntRefComps);

    const freeItemEnts = _.difference(itemEnts, itemEntsInBackpack);
    const containerEnts = EntityFinders.findContainers(entitySpatialGrid.getAdjacentEntities(this._entityManager.heroEntity));

    const allEnts = [].concat(containerEnts, freeItemEnts);

    this._drawItems(allEnts);

  }

  _drawItems(ents) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;
    const tilePxSize = this._renderer.tilePxSize;

    const centerScreenX = screenWidth / scale / 2.0;
    const centerScreenY = screenHeight / scale / 2.0;

    const heroPosComp = this._entityManager.heroEntity.get('PositionComponent');

    for (const ent of ents) {

      const entPosComp = ent.get('PositionComponent');

      const offsetX = entPosComp.position.x - heroPosComp.position.x;
      const offsetY = entPosComp.position.y - heroPosComp.position.y;

      const offsetPxX = offsetX * tilePxSize;
      const offsetPxY = offsetY * tilePxSize;

      const posX = centerScreenX + offsetPxX;
      const posY = centerScreenY + offsetPxY;

      ent.get('AnimatedSpriteComponent').AnimatedSprite.position.set(posX, posY);

    }

  }

}
