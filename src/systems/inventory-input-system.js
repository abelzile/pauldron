import System from '../system';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';


export default class InventoryInputSystem extends System {

  constructor() {
    super();
  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities, input) {

    let exit = input.isPressed(Const.Button.X) || input.isPressed(Const.Button.Esc);

    if (!exit && input.isPressed(Const.Button.LeftMouse)) {

      const inventoryEnt = EntityFinders.findInventory(entities);
      const closeBtnMc = inventoryEnt.get('DialogHeaderComponent').closeButtonMcComponent.animatedSprite;

      exit = closeBtnMc.containsPoint(input.getMousePosition());

    }

    if (exit) {
      this.emit('inventory-input-system.exit', entities);
    }

  }

}