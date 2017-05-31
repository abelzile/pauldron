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
    const scaleScreenWidth = Const.ScreenWidth / Const.ScreenScale;
    const scaleScreenHeight = Const.ScreenHeight / Const.ScreenScale;
    let startPosY = 0.4;

    const mainMenuEnt = EntityFinders.findMainMenu(entities);

    this.drawDialogHeader(mainMenuEnt.get('DialogHeaderComponent'));

    const mainMenuItemComps = mainMenuEnt.getAll('MainMenuItemSpriteComponent');

    for (const menuItemComp of mainMenuItemComps) {
      menuItemComp.sprite.position.x = (scaleScreenWidth - menuItemComp.sprite.width) / 2;
      menuItemComp.sprite.position.y = scaleScreenHeight * startPosY;

      this._pixiContainer.addChild(menuItemComp.sprite);

      startPosY += 0.1;
    }
  }

  processEntities(gameTime, entities) {}
}
