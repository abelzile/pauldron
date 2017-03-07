import Initializer from './initializer';
import * as ArrayUtils from '../../utils/array-utils';

export default class ColorInitializer extends Initializer {
  constructor(...colors) {
    super();
    this._colors = colors;
    if (this._colors.length === 0) {
      this._colors.push(0xffffff);
    }
  }

  initialize(emitter, particle) {
    particle.color = ArrayUtils.sample(this._colors);
  }
}
