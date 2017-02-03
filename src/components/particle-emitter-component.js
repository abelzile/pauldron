// See https://software.intel.com/en-us/html5/hub/blogs/build-a-javascript-particle-system-in-200-lines
import * as _ from 'lodash';
import * as MathUtils from '../utils/math-utils';
import Component from '../component';
import Particle from '../particle';
import Vector from '../vector';
import Circle from '../circle';

export default class ParticleEmitterComponent extends Component {

  constructor(
    textureFrames,
    position = new Vector(),
    velocity = new Vector(),
    acceleration = 0.05,
    angle = 0,
    offset = new Vector(),
    spread = 0,
    maxParticles = Number.MAX_SAFE_INTEGER,
    emissionRate = 1,
    maxParticleAge = 200,
    moving = true,
    fadeOutAlpha = true,
    tints = [ 0xffffff ],
    activeFrames = [],
    alpha = 1,
    creationRadius = 1
  ) {

    super();

    this.textureFrames = textureFrames;
    this.position = position;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.angle = angle;
    this.offset = offset;
    this.spread = spread;
    this.maxParticles = maxParticles;
    this.emissionRate = emissionRate;
    this.maxParticleAge = maxParticleAge;
    this.moving = moving;
    this.fadeOutAlpha = fadeOutAlpha;
    this.tints = tints;
    this.activeFrames = activeFrames;
    this.alpha = alpha;
    this.creationRadius = creationRadius;
    this.creationZone = new Circle(this.position.clone(), this.creationRadius);

    this.particles = [];

  }

  tryAddParticle() {

    if (this.particles.length > this.maxParticles) {
      return false;
    }

    // Use an angle randomized over the spread so we have more of a "spray"
    //console.log(this.spread);
    //const angle = this.velocity.angle + this.spread - (Math.random() * this.spread * 2);

    const halfSpread = this.spread / 2;
    const angle = _.random(this.velocity.angle - halfSpread, this.velocity.angle + halfSpread, true);

    //add 0.10 as a property. maybe rather have a radius value and pick a random point in a circle centered on position with that radius

    /*const position = new Vector(
      _.random(this.position.x - 0.10, this.position.x + 0.10, true),
      _.random(this.position.y - 0.10, this.position.y + 0.10, true)
    );*/
    const position = this.creationZone.getRandomPoint();
    const velocity = Vector.fromAngle(angle, this.velocity.magnitude);

    const newParticle = Particle.pnew(position, velocity);
    newParticle.sprite.textures = this.textureFrames;
    newParticle.sprite.updateTexture();
    newParticle.sprite.tint = _.sample(this.tints);
    newParticle.sprite.alpha = this.alpha;

    this.particles.push(newParticle);

    return true;

  }

  init(position, angle = -Number.MAX_SAFE_INTEGER) {

    this.setPosition(position);

    const ang = (angle === -Number.MAX_SAFE_INTEGER) ? this.angle : angle;
    this.angle = ang;

    _.assign(
      this.velocity,
      Vector.fromAngle(
        MathUtils.normalizeAngle(ang + Math.PI, Math.PI),
        this.acceleration
      )
    );

    this.active = true;

  }

  setPosition(position) {
    this.position.x = position.x + this.offset.x;
    this.position.y = position.y + this.offset.y;
    this.creationZone.origin.setFrom(this.position);
  }

  clone() {

    return new ParticleEmitterComponent(
      this.textureFrames,
      this.position.clone(),
      this.velocity.clone(),
      this.acceleration,
      this.angle,
      this.offset.clone(),
      this.spread,
      this.maxParticles,
      this.emissionRate,
      this.maxParticleAge,
      this.moving,
      this.fadeOutAlpha,
      this.tints,
      this.activeFrames,
      this.alpha,
      this.creationRadius
    );

  }

}