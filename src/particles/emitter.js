import Vector from '../vector';
import Particle from './particle';
import * as ArrayUtils from '../utils/array-utils';
import EventEmitter from 'eventemitter2';

export default class Emitter extends EventEmitter {
  constructor(position = new Vector(), rotation = 0) {
    super();

    this.position = position;
    this.rotation = rotation;

    this.particles = [];

    this.counter = null;
    this.initializers = [];
    this.emitterActions = [];
    this.particleActions = [];

    this._started = false;
    this._running = false;
    this._updating = false;
  }

  get x() {
    return this.position.x;
  }
  set x(value) {
    this.position.x = value;
  }

  get y() {
    return this.position.y;
  }
  set y(value) {
    this.position.y = value;
  }

  get hasParticles() {
    return this.particles.length > 0;
  }

  addInitializer(initializer) {
    initializer && this.initializers.push(initializer);
    return this;
  }

  addEmitterAction(emitterAction) {
    emitterAction && this.emitterActions.push(emitterAction);
    return this;
  }

  addParticleAction(particleAction) {
    particleAction && this.particleActions.push(particleAction);
    return this;
  }

  createParticle() {
    const particle = Particle.pnew();
    this.initParticle(particle);

    for (let i = 0; i < this.initializers.length; ++i) {
      this.initializers[i].initialize(this, particle);
    }

    this.particles.push(particle);

    this.emit('create-particle', particle);

    return particle;
  }

  initParticle(particle) {
    particle.position.x = this.position.x;
    particle.position.y = this.position.y;
    particle.rotation = this.rotation;
  }

  start() {
    this._started = true;
    this._running = true;

    for (let i = 0; i < this.emitterActions.length; ++i) {
      this.emitterActions[i].initialize(this);
    }

    const len = this.counter.startEmitter(this);
    for (let i = 0; i < len; ++i) {
      this.createParticle();
    }
  }

  update(time) {
    this._updating = true;

    if (this._running) {
      const len = this.counter.updateEmitter(this, time);
      for (let i = 0; i < len; ++i) {
        this.createParticle();
      }
    }

    //sortParticles();

    for (let i = 0; i < this.emitterActions.length; ++i) {
      this.emitterActions[i].update(this, time);
    }

    if (this.particles.length > 0) {
      for (let i = 0; i < this.particleActions.length; ++i) {
        for (let j = 0; j < this.particles.length; ++j) {
          this.particleActions[i].update(this, this.particles[j], time);
        }
      }

      // remove dead particles

      for (let i = this.particles.length; i-- > 0; ) {
        const particle = this.particles[i];

        if (particle.deleted) {
          this.particles.splice(i, 1);
          this.emit('remove-particle', particle);
          particle.pdispose();
        }
      }
    }

    this._updating = false;
  }

  pause() {
    this._running = false;
  }

  resume() {
    this._running = true;
  }

  stop() {
    this._started = false;
    this._running = false;
    this.killAllParticles();
  }

  killAllParticles() {
    for (const particle of this.particles) {
      this._killParticle(particle);
    }
    ArrayUtils.clear(this.particles);
  }

  _killParticle(particle) {
    this.emit('remove-particle', particle);
    particle.pdispose();
  }

  destroy() {
    this.stop();
  }
}
