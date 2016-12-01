import * as _ from 'lodash';
import * as Pixi from 'pixi.js';
import Component from '../component';
import Particle from '../particle';
import Vector from '../vector';


export default class ParticleEmitterComponent extends Component {

  constructor(textureFrames,
              position = new Vector(),
              velocity = new Vector(),
              acceleration = 0.05,
              spread = Math.PI / 16,
              maxParticles = 200,
              emissionRate = 1,
              maxParticleAge = 200,
              moving = true,
              fadeOutAlpha = true) {

    super();

    this.textureFrames = textureFrames;
    this.position = position;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.spread = spread;
    this.maxParticles = maxParticles;
    this.emissionRate = emissionRate;
    this.maxParticleAge = maxParticleAge;
    this.moving = moving;
    this.fadeOutAlpha = fadeOutAlpha;

    this.particles = [];

  }

  tryAddParticle() {

    if (this.particles.length > this.maxParticles) { return false; }

    // Use an angle randomized over the spread so we have more of a "spray"
    const angle = this.velocity.angle + this.spread - (Math.random() * this.spread * 2);

    const magnitude = this.velocity.magnitude;

    const position = new Vector(
      _.random(this.position.x - 0.10, this.position.x + 0.10, true),
      _.random(this.position.y - 0.10, this.position.y + 0.10, true));

    const velocity = Vector.fromAngle(angle, magnitude);

    const newParticle = Particle.pnew(position, velocity);
    newParticle.sprite.textures = this.textureFrames;
    newParticle.sprite.updateTexture();

    this.particles.push(newParticle);

    return true;

  }

  clone() {
    return new ParticleEmitterComponent(
      this.textureFrames,
      this.position,
      this.velocity,
      this.acceleration,
      this.spread,
      this.maxParticles,
      this.emissionRate,
      this.maxParticleAge,
      this.moving,
      this.fadeOutAlpha);
  }

}