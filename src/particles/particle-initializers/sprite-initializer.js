import Initializer from './initializer';

export default class SpriteInitializer extends Initializer {

  constructor(texture) {
    super();
    this.texture = texture;
  }

  initialize(emitter, particle) {
    particle.sprite.texture = this.texture;
  }

}