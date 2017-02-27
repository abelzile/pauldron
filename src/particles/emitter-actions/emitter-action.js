export default class EmitterAction {

  constructor() {
  }

  initialize(emitter) {
  }

  update(emitter, time) {
    throw new Error('update() must be overridden.');
  }

}
