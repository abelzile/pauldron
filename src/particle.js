import Vector from './vector';

export default class Particle {

  constructor(sprite, position = new Vector(), velocity = new Vector(), acceleration = new Vector()) {

    this.sprite = sprite;
    this.position = position;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.age = 0;
    this.deleted = false;

  }

  move() {

    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);

  }

}