import * as Const from '../const';
import System from '../system';


export default class FinalInputSystem extends System {

  constructor() {
    super();
  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities, input, endState) {

    if (!input.isPressed(Const.Button.LeftMouse)) { return; }

    this.emit('final-input-system.reset');

  }

}