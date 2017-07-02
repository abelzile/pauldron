import * as Pixi from 'pixi.js';
import Initializer from './initializer';

export default class SpriteInitializer extends Initializer {
  constructor(texture, anchor = new Pixi.Point()) {
    super();
    this.texture = texture;
    this.anchor = anchor;
  }

  initialize(emitter, particle) {
    particle.sprite.texture = this.texture;
    particle.sprite.anchor.set(this.anchor.x, this.anchor.y);
  }
}
