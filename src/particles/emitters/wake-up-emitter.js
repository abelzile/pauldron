import * as _ from 'lodash';
import * as Const from '../../const';
import * as Pixi from 'pixi.js';
import AccelerationParticleAction from '../particle-actions/acceleration-particle-action';
import AgeParticleAction from '../particle-actions/age-particle-action';
import BlastCounter from '../counters/blast-counter';
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
import Vector from '../../vector';
import VelocityInitializer from '../particle-initializers/velocity-initializer';
import PointZone from '../zones/point-zone';

export default class WakeUpEmitter extends Emitter {
  constructor(baseTexture, entity) {
    super();

    this.counter = new BlastCounter(1);

    this.addInitializer(new LifetimeInitializer(800, 1000))
      .addInitializer(new PositionInitializer(new PointZone(new Vector(0.5, 0))))
      .addInitializer(new VelocityInitializer(new DiscZone(new Vector(), 0.015)))
      .addInitializer(new SpriteInitializer(new Pixi.Texture(baseTexture, new Pixi.Rectangle(32, 160, 16, 16))))
      .addInitializer(new ColorInitializer(0xffff00, 0xffffff));

    this.addParticleAction(new AgeParticleAction())
      .addParticleAction(new MoveParticleAction())
      .addParticleAction(new AccelerationParticleAction(0, -0.004))
      .addParticleAction(new DragParticleAction(0.95))
      .addParticleAction(new FadeParticleAction(0.6, 0));

    this.addEmitterAction(new FollowEntityEmitterAction(entity));
  }
}
