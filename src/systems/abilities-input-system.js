import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import System from '../system';

export default class AbilitiesInputSystem extends System {
  constructor() {
    super();
  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities, input) {
    let exit = input.isPressed(Const.Button.X) || input.isPressed(Const.Button.Esc);

    if (!exit && input.isPressed(Const.Button.LeftMouse)) {
      const mousePosition = input.getMousePosition();
      const otherBtns = EntityFinders.findAbilitiesGui(entities).getAllKeyed('TextButtonComponent', 'id');

      if (otherBtns['close_btn'].containsCoords(mousePosition.x, mousePosition.y)) {
        exit = true;
      }
    }

    if (exit) {
      this.emit('close');
    }
  }
}
