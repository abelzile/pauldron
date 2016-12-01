import * as Const from './const';
import * as Pixi from 'pixi.js';
import Poolable from './poolable';
import Vector from './vector';


export default class Particle extends Poolable {

  constructor(position = new Vector(), velocity = new Vector(), acceleration = new Vector()) {

    super();

    this.position = position;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.sprite = new Pixi.extras.AnimatedSprite(Const.EmptyTextureArray);
    this.age = 0;
    this.deleted = false;

  }

  move() {

    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);

  }

  dispose() {

    this.position.zero();
    this.velocity.zero();
    this.acceleration.zero();

    this.sprite.textures = Const.EmptyTextureArray;
    this.sprite.updateTexture();

    this.age = 0;
    this.deleted = false;

  }

}