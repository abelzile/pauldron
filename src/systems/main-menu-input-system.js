import * as EntityFinders from '../entity-finders';
import System from '../system';

export default class MainMenuInputSystem extends System {
  constructor(entityManager) {
    super();
    this._entityManager = entityManager;
  }

  initialize(entities) {
    const gui = EntityFinders.findMainMenu(entities);
    const newGame = gui.get('TextButtonComponent', c => c.id === 'new_game');
    newGame.once('mousedown', () => this.emit('show-new-game'));

    return this;
  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities, input) {
  }
}
