import * as Const from '../const';
import * as Pixi from 'pixi.js';
import Poolable from '../poolable';
import Vector from '../vector';

export default class Particle extends Poolable {

  constructor() {

    super();

    this.position = null;
    this.velocity = null;
    this.rotation = 0;
    this.sprite = null;
    this.age = 0;
    this.lifetime = 0;
    this.deleted = false;

    this._init();

  }

  dispose() {
    this._init();
  }

  _init() {

    if (!this.position) {
      this.position = new Vector();
    }
    this.position.zero();

    if (!this.velocity) {
      this.velocity = new Vector();
    }
    this.velocity.zero();

    this.rotation = 0;

    if (!this.sprite) {
      this.sprite = new Pixi.Sprite();
    }
    this.sprite.texture = Pixi.Texture.EMPTY;
    //this.sprite.updateTexture();
    this.age = 0;
    this.lifetime = 0;
    this.deleted = false;

  }

}