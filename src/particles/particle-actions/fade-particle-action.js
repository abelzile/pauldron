import ParticleAction from './particle-action';

export default class FadeParticleAction extends ParticleAction {

  constructor(startAlpha = 1, endAlpha = 0) {
    super();
    this._startAlpha = startAlpha;
    this._endAlpha = endAlpha;
    this._diffAlpha = this._startAlpha - this._endAlpha;
  }

  update( emitter, particle, time) {
    particle.sprite.alpha = this._endAlpha + (this._diffAlpha - this._diffAlpha * (particle.age / particle.lifetime));
  }

}