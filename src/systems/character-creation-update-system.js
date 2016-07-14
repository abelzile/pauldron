import System from '../system';


export default class CharacterCreationUpdateSystem extends System {

  constructor() {
    super();
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