import System from '../system';


export default class CharacterCreationUpdateSystem extends System {

  constructor(renderer, entityManager) {

    super();

    this._renderer = renderer;
    this._entityManager = entityManager;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
  }

  processEntities(gameTime, entities) {
  }

  unload(entities) {
  }
  
}