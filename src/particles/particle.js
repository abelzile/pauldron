import * as Pixi from 'pixi.js';
import Poolable from '../poolable';
import Vector from '../vector';

export default class Particle extends Poolable {
  constructor() {
    super();

    this.position = new Vector();
    this.velocity = new Vector();
    this.sprite = new Pixi.Sprite();
    this.age = 0;
    this.lifetime = 0;
    this.deleted = false;

    this.pinitialize();
  }

  get color() {
    return this.sprite ? this.sprite.tint : 0xffffff;
  }
  set color(value) {
    if (this.sprite) {
      this.sprite.tint = value;
    }
  }

  get rotation() {
    return this.sprite ? this.sprite.rotation : 0;
  }
  set rotation(value) {
    if (this.sprite) {
      this.sprite.rotation = value;
    }
  }

  get scale() {
    return this.sprite ? this.sprite.scale : null;
  }

  pinitialize() {
    this._reset();
  }

  dispose() {
  }

  _reset() {
    this.position.zero();
    this.velocity.zero();
    this.sprite.texture = Pixi.Texture.EMPTY;
    this.sprite.tint = 0xffffff;
    this.sprite.rotation = 0;
    this.sprite.scale.set(1);
    //this.sprite.updateTexture();
    this.age = 0;
    this.lifetime = 0;
    this.deleted = false;
  }
}
