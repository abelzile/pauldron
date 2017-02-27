import * as _ from 'lodash';
import Initializer from './initializer';

export default class LifetimeInitializer extends Initializer {

  constructor(minLifetime = Number.MAX_SAFE_INTEGER, maxLifetime = Number.NaN) {
    super();
    this.minLifetime = minLifetime;
    this.maxLifetime = maxLifetime;
  }

  initialize(emitter, particle) {
    if (Number.isNaN(this.maxLifetime)) {
      particle.lifetime = this.minLifetime;
    } else {
      particle.lifetime = _.random(this.minLifetime, this.maxLifetime, false);
    }
  }

}
