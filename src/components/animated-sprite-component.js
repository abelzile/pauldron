import * as Const from '../const';
import _ from 'lodash';
import Component from '../component';
import * as Pixi from 'pixi.js';


export default class AnimatedSpriteComponent extends Component {

  constructor(frames, id) {
    super();
    this.id = id;
    this.frames = frames;
    this.AnimatedSprite = new Pixi.extras.AnimatedSprite(frames);
  }

  get visible() { return this.AnimatedSprite.visible; }
  set visible(value) { this.AnimatedSprite.visible = value; }

  get position() { return this.AnimatedSprite.position; }

  get animationSpeed() { return this.AnimatedSprite.animationSpeed; }
  set animationSpeed(value) { this.AnimatedSprite.animationSpeed = value; }

  get anchor() { return this.AnimatedSprite.anchor; }

  get pivot() { return this.AnimatedSprite.pivot; }

  get rotation() { return this.AnimatedSprite.rotation; }
  set rotation(value) { this.AnimatedSprite.rotation = value; }

  get scale() { return this.AnimatedSprite.scale; }

  get width() { return this.AnimatedSprite.width; }
  set width(value) { this.AnimatedSprite.width = value; }

  get height() { return this.AnimatedSprite.height; }
  set height(value) { this.AnimatedSprite.height = value; }

  setFacing(facing, x, offsetX, rotation) {

    this.AnimatedSprite.scale.x = (facing === Const.Direction.West) ? -1 : 1;
    this.AnimatedSprite.position.x = (x - this.AnimatedSprite.scale.x * this.AnimatedSprite.width / 2) + (this.AnimatedSprite.width / 2);

    if (offsetX) {
      this.AnimatedSprite.position.x += this.AnimatedSprite.scale.x * offsetX;
    }

    if (rotation) {

      let r = rotation * this.AnimatedSprite.scale.x;

      if (r < 0) {
        r = 6.28 + r;
      }

      this.AnimatedSprite.rotation = r;

    }

  }

  clone() {

    const mc = new AnimatedSpriteComponent(_.map(this.frames, (frame) => {

      const f = frame.frame;
      return new Pixi.Texture(frame.baseTexture, new Pixi.Rectangle(f.x, f.y, f.width, f.height));

    }), this.id);

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
