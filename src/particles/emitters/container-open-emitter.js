import * as Const from '../../const';
import * as Pixi from 'pixi.js';
import AgeParticleAction from '../particle-actions/age-particle-action';
import BlastCounter from '../counters/blast-counter';
import ColorInitializer from '../particle-initializers/color-initializer';
import DiscZone from '../zones/disc-zone';
import DragParticleAction from '../particle-actions/drag-particle-action';
import Emitter from '../emitter';
import FadeParticleAction from '../particle-actions/fade-particle-action';
import LifetimeInitializer from '../particle-initializers/lifetime-initializer';
import MoveParticleAction from '../particle-actions/move-particle-action';
import PointZone from '../zones/point-zone';
import PositionInitializer from '../particle-initializers/position-initializer';
import RotateToDirectionParticleAction from '../particle-actions/rotate-to-direction-particle-action';
import SpriteInitializer from '../particle-initializers/sprite-initializer';
import Vector from '../../vector';
import VelocityInitializer from '../particle-initializers/velocity-initializer';

export default class ContainerOpenEmitter extends Emitter {
  constructor(baseTexture) {
    super();

    this.counter = new BlastCounter(30);

    const min = Const.MsPerFrame * 10;
    const max = min * 2;

    this.addInitializer(new LifetimeInitializer(min, max))
      .addInitializer(new PositionInitializer(new PointZone(new Vector())))
      .addInitializer(new VelocityInitializer(new DiscZone(new Vector(), 0.1875)))
      .addInitializer(new SpriteInitializer(new Pixi.Texture(baseTexture, new Pixi.Rectangle(48, 80, 16, 16))))
      .addInitializer(new ColorInitializer(0xffffff, 0xfcfc80, 0xf0dc5c, 0xe0bc38));

    this.addParticleAction(new AgeParticleAction())
      .addParticleAction(new MoveParticleAction())
      .addParticleAction(new RotateToDirectionParticleAction())
      .addParticleAction(new DragParticleAction(0.90))
      .addParticleAction(new FadeParticleAction(0.7, 0));
  }
}
