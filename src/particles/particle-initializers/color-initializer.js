import Initializer from './initializer';
import * as _ from 'lodash';

export default class ColorInitializer extends Initializer {
  constructor(...colors) {
    super();
    this._colors = colors;
    if (this._colors.length === 0) {
      this._colors.push(0xffffff);
    }
  }

  initialize(emitter, particle) {
    particle.color = _.sample(this._colors);
  }
}
