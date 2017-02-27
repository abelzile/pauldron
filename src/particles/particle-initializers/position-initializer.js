import Initializer from './initializer';

export default class PositionInitializer extends Initializer {

  constructor(zone) {
    super();
    this.zone = zone;
  }

  initialize(emitter, particle) {
    particle.position.add(this.zone.getRandomPoint());
  }

}