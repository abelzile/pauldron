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

    if (!input.isPressed(Const.Button.LeftMouse)) { return; }

    const mousePosition = input.getMousePosition();

    const gui = EntityFinders.findAbilitiesGui(entities);

    const otherBtns = gui.getAllKeyed('TextButtonComponent', 'id');

    if (otherBtns['close_btn'].containsCoords(mousePosition.x, mousePosition.y)) {
      this.emit('close');
    }

  }

}