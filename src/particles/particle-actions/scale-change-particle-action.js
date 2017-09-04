import ParticleAction from './particle-action';

export default class ScaleChangeParticleAction extends ParticleAction{
  constructor(startScale = 1, endScale = 1) {
    super();
    this.startScale = startScale;
    this.endScale = endScale;
  }

  update(emitter, particle, delta) {
    if (this.startScale === this.endScale) {
      particle.scale.set(this.startScale);
    } else {
      const perc = particle.age / particle.lifetime;
      let scale = 1;

      if (this.startScale < this.endScale) {
        const diff = this.endScale - this.startScale;
        scale = this.startScale + (diff * perc);
      } else if (this.startScale > this.endScale) {
        const diff = this.startScale - this.endScale;
        scale = this.startScale - (diff * perc);
      }

      particle.scale.set(scale);
    }
  }
}