import _ from 'lodash';
import System from '../system';
import * as EntityFinders from '../entity-finders';


export default class MainMenuRenderSystem extends System {

  constructor(pixiContainer, renderer) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    let startPosY = 0.4;
    for (const menuItemEnt of EntityFinders.findMainMenuItems(entities)) {

      const spriteComp = menuItemEnt.get('MainMenuItemSpriteComponent');
      spriteComp.sprite.position.x = screenWidth / scale / 2.0;
      spriteComp.sprite.position.y = screenHeight / scale * startPosY;
      spriteComp.sprite.anchor.x = 0.5;

      this._pixiContainer.addChild(spriteComp.sprite);

      startPosY += 0.1;

    }

  }

  processEntities(gameTime, entities) {
  }

}
