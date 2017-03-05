import Initializer from './initializer';

export default class ColorInitializer extends Initializer {

  constructor(color = 0xFFFFFF) {
    super();
    this._color = color;
  }

  initialize(emitter, particle) {
    particle.color = this._color;
  }

}