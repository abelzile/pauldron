import * as ColorUtils from '../../utils/color-utils';
import ParticleAction from './particle-action';

export default class ColorChangeParticleAction extends ParticleAction {
  constructor(startColor = 0xffffff, endColor = 0xffffff) {
    super();
    this._startColor = startColor;
    this._endColor = endColor;
  }

  update(emitter, particle, time) {
    particle.color = ColorUtils.interpolateColors(
      this._startColor,
      this._endColor,
      1 - particle.age / particle.lifetime
    );
  }
}
