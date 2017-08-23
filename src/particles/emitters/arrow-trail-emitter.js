import * as Pixi from 'pixi.js';
import AgeParticleAction from '../particle-actions/age-particle-action';
import ColorInitializer from '../particle-initializers/color-initializer';
import DiscZone from '../zones/disc-zone';
import DragParticleAction from '../particle-actions/drag-particle-action';
import Emitter from '../emitter';
import FadeParticleAction from '../particle-actions/fade-particle-action';
import FollowEntityEmitterAction from '../emitter-actions/follow-entity-emitter-action';
import LifetimeInitializer from '../particle-initializers/lifetime-initializer';
import MoveParticleAction from '../particle-actions/move-particle-action';
import PositionInitializer from '../particle-initializers/position-initializer';
import SpriteInitializer from '../particle-initializers/sprite-initializer';
import SteadyCounter from '../counters/steady-counter';
import Vector from '../../vector';
import VelocityInitializer from '../particle-initializers/velocity-initializer';

export default class ArrowTrailEmitter extends Emitter {
  constructor(baseTexture, entity) {
    super();

    this.counter = new SteadyCounter(100);

    this.addInitializer(new LifetimeInitializer(300, 400))
      .addInitializer(new PositionInitializer(new DiscZone(new Vector(0.5, 0.5), 0.125)))
      .addInitializer(new VelocityInitializer(new DiscZone(new Vector(), 0.03)))
      .addInitializer(new SpriteInitializer(new Pixi.Texture(baseTexture, new Pixi.Rectangle(0, 0, 16, 16))))
      .addInitializer(new ColorInitializer(0xffffff));

    this.addParticleAction(new AgeParticleAction())
      .addParticleAction(new MoveParticleAction())
      .addParticleAction(new DragParticleAction(0.95))
      .addParticleAction(new FadeParticleAction(0.6, 0));

    this.addEmitterAction(new FollowEntityEmitterAction(entity));
  }

  destroy() {
    this.emitterActions[0].entity = null;
  }
}
