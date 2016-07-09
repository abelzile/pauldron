import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import _ from 'lodash';
import DialogRenderSystem from './dialog-render-system';


export default class MainMenuRenderSystem extends DialogRenderSystem {

  constructor(pixiContainer, renderer) {

    super(pixiContainer, renderer);

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;
    const scaleScreenWidth = screenWidth / scale;
    const scaleScreenHeight = screenHeight / scale;
    let startPosY = 0.4;

    const mainMenuEnt = EntityFinders.findMainMenu(entities);

    this.drawFrame(mainMenuEnt);
    
    const mainMenuItemComps = mainMenuEnt.getAll('MainMenuItemSpriteComponent');

    for (const menuItemComp of mainMenuItemComps) {

      menuItemComp.sprite.position.x = (scaleScreenWidth - menuItemComp.sprite.width) / 2;
      menuItemComp.sprite.position.y = scaleScreenHeight * startPosY;

      this._pixiContainer.addChild(menuItemComp.sprite);

      startPosY += 0.1;

    }

  }

  processEntities(gameTime, entities) {
  }

  
}
