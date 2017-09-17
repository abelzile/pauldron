import * as Pixi from 'pixi.js';
import AgeParticleAction from '../particle-actions/age-particle-action';
import ColorInitializer from '../particle-initializers/color-initializer';
import DiscZone from '../zones/disc-zone';
import Emitter from '../emitter';
import FadeParticleAction from '../particle-actions/fade-particle-action';
import FollowEntityEmitterAction from '../emitter-actions/follow-entity-emitter-action';
import LifetimeInitializer from '../particle-initializers/lifetime-initializer';
import PositionInitializer from '../particle-initializers/position-initializer';
import SpriteInitializer from '../particle-initializers/sprite-initializer';
import SteadyCounter from '../counters/steady-counter';
import Vector from '../../vector';

export default class LargeRockTrailEmitter extends Emitter {
  constructor(baseTexture, entity) {
    super();

    this.counter = new SteadyCounter(100);

    this.addInitializer(new LifetimeInitializer(500, 600))
      .addInitializer(new PositionInitializer(new DiscZone(new Vector(0.5, 0.5), 0.5)))
      .addInitializer(
        new SpriteInitializer(new Pixi.Texture(baseTexture, new Pixi.Rectangle(16, 0, 16, 16)), new Pixi.Point(0, 0))
      )
      .addInitializer(new ColorInitializer(0x8c7f69));

    this.addParticleAction(new AgeParticleAction()).addParticleAction(new FadeParticleAction(0.6, 0));

    this.addEmitterAction(new FollowEntityEmitterAction(entity));
  }

  destroy() {
    this.emitterActions[0].entity = null;
  }
}
