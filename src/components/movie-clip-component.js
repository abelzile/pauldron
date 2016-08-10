import * as Const from '../const';
import _ from 'lodash';
import Component from '../component';
import Pixi from 'pixi.js';


export default class MovieClipComponent extends Component {

  constructor(frames, id, animationSpeed = 1) {
    super();
    this.id = id;
    this.frames = frames;
    this.movieClip = new Pixi.extras.MovieClip(frames);
    this.movieClip.animationSpeed = animationSpeed;
  }

  get visible() { return this.movieClip.visible; }
  set visible(value) { this.movieClip.visible = value; }

  get position() { return this.movieClip.position; }

  setFacing(facing, centerScreenX) {

    this.movieClip.scale.x = (facing === Const.Direction.West) ? -1 : 1;
    this.movieClip.position.x = (centerScreenX - this.movieClip.scale.x * this.movieClip.width / 2) + (this.movieClip.width / 2);

  }

  clone() {

    return new MovieClipComponent(_.map(this.frames, (frame) => {

      const f = frame.frame;
      return new Pixi.Texture(frame.baseTexture, new Pixi.Rectangle(f.x, f.y, f.width, f.height));

    }), this.id, this.movieClip.animationSpeed);

  }

}
