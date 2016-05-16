import _ from 'lodash';
import Component from '../component';
import Pixi from 'pixi.js';


export default class MovieClipComponent extends Component {

  constructor(frames) {
    super();
    this.frames = frames;
    this.movieClip = new Pixi.extras.MovieClip(frames);
  }

  clone() {

    return new MovieClipComponent(_.map(this.frames, (frame) => {

      const f = frame.frame;
      return new Pixi.Texture(frame.baseTexture, new Pixi.Rectangle(f.x, f.y, f.width, f.height));

    }));

  }

}
