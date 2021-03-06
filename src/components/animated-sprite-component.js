import * as _ from 'lodash';
import * as Const from '../const';
import * as MathUtils from '../utils/math-utils';
import * as Pixi from 'pixi.js';
import Component from '../component';

export default class AnimatedSpriteComponent extends Component {
  constructor(frames, id) {
    super();
    this.id = id;
    this.frames = frames;
    this.animatedSprite = new Pixi.extras.AnimatedSprite(frames);
  }

  get visible() {
    return this.animatedSprite.visible;
  }
  set visible(value) {
    this.animatedSprite.visible = value;
  }

  get position() {
    return this.animatedSprite.position;
  }

  get animationSpeed() {
    return this.animatedSprite.animationSpeed;
  }
  set animationSpeed(value) {
    this.animatedSprite.animationSpeed = value;
  }

  get anchor() {
    return this.animatedSprite.anchor;
  }

  get pivot() {
    return this.animatedSprite.pivot;
  }

  get rotation() {
    return this.animatedSprite.rotation;
  }
  set rotation(value) {
    this.animatedSprite.rotation = value;
  }

  get scale() {
    return this.animatedSprite.scale;
  }

  get width() {
    return this.animatedSprite.width;
  }
  set width(value) {
    this.animatedSprite.width = value;
  }

  get height() {
    return this.animatedSprite.height;
  }
  set height(value) {
    this.animatedSprite.height = value;
  }

  setFacing(facing, x, offsetX, rotation, diffX = 0) {
    if (facing === Const.Direction.West) {
      this.animatedSprite.scale.x = -1;
    } else {
      this.animatedSprite.scale.x = 1;
    }

    this.animatedSprite.position.x = x -
      this.animatedSprite.scale.x * this.animatedSprite.width / 2 +
      this.animatedSprite.width / 2;

    if (offsetX) {
      this.animatedSprite.position.x += this.animatedSprite.scale.x * offsetX;
    }

    if (facing === Const.Direction.West) {
      this.animatedSprite.position.x += diffX;
    }

    if (rotation) {
      this.animatedSprite.rotation = MathUtils.normalizeAngle(rotation * this.animatedSprite.scale.x, Math.PI);
    }
  }

  clone() {
    const mc = new AnimatedSpriteComponent(
      _.map(this.frames, frame => {
        const f = frame.frame;
        return new Pixi.Texture(frame.baseTexture, new Pixi.Rectangle(f.x, f.y, f.width, f.height));
      }),
      this.id
    );

    mc.visible = this.visible;
    mc.position.x = this.position.x;
    mc.position.y = this.position.y;
    mc.animationSpeed = this.animationSpeed;
    mc.anchor.x = this.anchor.x;
    mc.anchor.y = this.anchor.y;
    mc.pivot.x = this.pivot.x;
    mc.pivot.y = this.pivot.y;
    mc.rotation = this.rotation;
    mc.scale.x = this.scale.x;
    mc.scale.y = this.scale.y;
    mc.width = this.width;
    mc.height = this.height;

    return mc;
  }
}
