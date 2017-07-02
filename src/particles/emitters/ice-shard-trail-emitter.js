import * as Pixi from 'pixi.js';
import AgeParticleAction from '../particle-actions/age-particle-action';
import DiscZone from '../zones/disc-zone';
import Emitter from '../emitter';
import FadeParticleAction from '../particle-actions/fade-particle-action';
import FollowEntityEmitterAction from '../emitter-actions/follow-entity-emitter-action';
import LifetimeInitializer from '../particle-initializers/lifetime-initializer';
import PositionInitializer from '../particle-initializers/position-initializer';
import SpriteInitializer from '../particle-initializers/sprite-initializer';
import SteadyCounter from '../counters/steady-counter';
import Vector from '../../vector';
import ColorInitializer from '../particle-initializers/color-initializer';

export default class IceShardTrailEmitter extends Emitter {
  constructor(baseTexture, entity) {
    super();

    this.counter = new SteadyCounter(50);

    this.addInitializer(new LifetimeInitializer(500, 600))
      .addInitializer(new PositionInitializer(new DiscZone(new Vector(0.5, 0.5), 0.25)))
      .addInitializer(
        new SpriteInitializer(
          new Pixi.Texture(baseTexture, new Pixi.Rectangle(16, 144, 16, 16)),
          new Pixi.Point(1 / 16, 1 / 16)
        )
      )
      .addInitializer(new ColorInitializer(0xffffff, 0xf1feff, 0xccf8fe));

    this.addParticleAction(new AgeParticleAction()).addParticleAction(new FadeParticleAction(0.6, 0));

    this.addEmitterAction(new FollowEntityEmitterAction(entity));
  }
}
