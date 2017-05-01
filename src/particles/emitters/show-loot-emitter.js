import * as Pixi from 'pixi.js';
import AccelerationParticleAction from '../particle-actions/acceleration-particle-action';
import AgeParticleAction from '../particle-actions/age-particle-action';
import BlastCounter from '../counters/blast-counter';
import ColorInitializer from '../particle-initializers/color-initializer';
import DiscZone from '../zones/disc-zone';
import DragParticleAction from '../particle-actions/drag-particle-action';
import Emitter from '../emitter';
import FadeParticleAction from '../particle-actions/fade-particle-action';
import LifetimeInitializer from '../particle-initializers/lifetime-initializer';
import MoveParticleAction from '../particle-actions/move-particle-action';
import PositionInitializer from '../particle-initializers/position-initializer';
import SpriteInitializer from '../particle-initializers/sprite-initializer';
import Vector from '../../vector';
import VelocityInitializer from '../particle-initializers/velocity-initializer';

export default class ShowLootEmitter extends Emitter {
  constructor(baseTexture, size = 1) {
    super();

    const startCount = Math.ceil(size * 100 / 3);
    const minAge = 500;
    const maxAge = 600;

    this.counter = new BlastCounter(startCount);

    this.addInitializer(new LifetimeInitializer(minAge, maxAge))
      .addInitializer(new PositionInitializer(new DiscZone(new Vector(), size / 2)))
      .addInitializer(new VelocityInitializer(new DiscZone(new Vector(), 0.0625)))
      .addInitializer(new SpriteInitializer(new Pixi.Texture(baseTexture, new Pixi.Rectangle(144, 16, 16, 16))))
      .addInitializer(new ColorInitializer(0xffffff));

    this.addParticleAction(new AgeParticleAction())
      .addParticleAction(new MoveParticleAction())
      .addParticleAction(new AccelerationParticleAction(0, -0.004))
      .addParticleAction(new DragParticleAction(0.95))
      .addParticleAction(new FadeParticleAction(0.4, 0));
  }
}
