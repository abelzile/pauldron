import System from '../system';
import * as Const from '../const';


export default class InventoryInputSystem extends System {

  constructor() {
    super();
  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities, input) {

    if (input.isPressed(Const.Button.X) || input.isPressed(Const.Button.Esc)) {
      this.emit('inventory-input-system.exit', entities);
    }

  }

}
