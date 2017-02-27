export default class Initializer {

  constructor() {
  }

  initialize(emitter, particle) {
    throw new Error('initialize() must be overridden.');
  }

}