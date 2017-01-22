import System from '../system';

export default class LevelMapUpdateSystem extends System {

  constructor() {
    super();
  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities, input) {
  }

}