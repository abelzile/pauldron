import EventEmitter from 'eventemitter2';


export default class System extends EventEmitter {

  constructor() {
    super();
  }

  checkProcessing() {
    throw new Error('checkProcessing must be overridden to return true if this system should process its entities; false, if not.');
  }

  process(gameTime, entities, input) {

    if (this.checkProcessing()) {

      this.begin();
      this.processEntities(gameTime, entities, input);
      this.end();

    }

  }

  initialize(entities) {
  }

  begin() {
  }

  processEntities(gameTime, entities, input) {
    throw new Error('processEntities must be overridden to process each entity.');
  }

  end() {
  }

  unload(entities) {
  }

}
