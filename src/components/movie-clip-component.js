import _ from 'lodash';
import Component from '../component';
import Pixi from 'pixi.js';


export default class MovieClipComponent extends Component {

  constructor(frames) {
    super();
    this._frames = frames;
    this._movieClip = new Pixi.extras.MovieClip(frames);
  }

  get frames() { return this._frames; }

  get movieClip() { return this._movieClip; }

  clone() {

    return new MovieClipComponent(_.map(this._frames, (frame) => {

      const f = frame.frame;
      return new Pixi.Texture(frame.baseTexture, new Pixi.Rectangle(f.x, f.y, f.width, f.height));

    }));

  }

}
