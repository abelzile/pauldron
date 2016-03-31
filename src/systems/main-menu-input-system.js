import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import System from '../system';


export default class MainMenuInputSystem extends System {

  constructor(entityManager) {

    super();

    this._entityManager = entityManager;

  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities, input) {

    if (!input.isPressed(Const.Button.LeftMouse)) { return; }

    const menuItemEnts = EntityFinders.findMainMenuItems(entities);

    for (const mainMenuEnt of menuItemEnts) {

      const spriteComp = mainMenuEnt.get('MainMenuItemSpriteComponent');

      if (spriteComp.sprite.containsPoint(input.getMousePosition())) {

        switch (spriteComp.text) {

          case 'New Game':

            this._entityManager.currentLevelEntity = EntityFinders.findLevels(entities)[0];
            this.emit('main-menu-input-system.show-new-game');

            return;

        }

      }

    }

  }

}
