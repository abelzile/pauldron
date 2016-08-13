import * as Const from '../const';
import _ from 'lodash';
import Component from '../component';
import Pixi from 'pixi.js';


export default class MovieClipComponent extends Component {

  constructor(frames, id) {
    super();
    this.id = id;
    this.frames = frames;
    this.movieClip = new Pixi.extras.MovieClip(frames);
  }

  get visible() { return this.movieClip.visible; }
  set visible(value) { this.movieClip.visible = value; }

  get position() { return this.movieClip.position; }

  get animationSpeed() { return this.movieClip.animationSpeed; }
  set animationSpeed(value) { this.movieClip.animationSpeed = value; }

  get anchor() { return this.movieClip.anchor; }

  get pivot() { return this.movieClip.pivot; }

  get rotation() { return this.movieClip.rotation; }
  set rotation(value) { this.movieClip.rotation = value; }

  get scale() { return this.movieClip.scale; }

  setFacing(facing, centerScreenX, extraOffsetX, rotation) {

    this.movieClip.scale.x = (facing === Const.Direction.West) ? -1 : 1;
    this.movieClip.position.x = (centerScreenX - this.movieClip.scale.x * this.movieClip.width / 2) + (this.movieClip.width / 2);

    if (extraOffsetX) {
      this.movieClip.position.x += this.movieClip.scale.x * extraOffsetX;
    }

    if (rotation) {

      let r = rotation * this.movieClip.scale.x;

      if (r < 0) {
        r = 6.28 + r;
      }

      this.movieClip.rotation = r;

    }

  }

  clone() {

    const mc = new MovieClipComponent(_.map(this.frames, (frame) => {

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

    return mc;

  }

}
