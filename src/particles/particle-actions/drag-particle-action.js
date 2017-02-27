import ParticleAction from './particle-action';

export default class DragParticleAction extends ParticleAction {

  constructor(drag = 0) {
    super();
    this._drag = drag;
  }

  update(emitter, particle, delta) {
    particle.velocity.x *= this._drag;
    particle.velocity.y *= this._drag;
  }

}