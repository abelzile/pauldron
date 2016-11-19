import System from '../system';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';


export default class SpellBookInputSystem extends System {

  constructor() {
    super();
  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities, input) {

    let exit = input.isPressed(Const.Button.X) || input.isPressed(Const.Button.Esc);

    if (!exit && input.isPressed(Const.Button.LeftMouse)) {

      const spellBookEnt = EntityFinders.findSpellBook(entities);
      const closeBtnMc = spellBookEnt.get('DialogHeaderComponent').closeButtonMcComponent.AnimatedSprite;

      exit = closeBtnMc.containsPoint(input.getMousePosition());

    }

    if (exit) {
      this.emit('spell-book-input-system.exit', entities);
    }

  }

}