import _ from 'lodash';
import * as Pixi from 'pixi.js';
import Component from '../component';


export default class DarknessOverlayComponent extends Component {

  constructor(frames) {

    // this may become more generic (could be used for fog or something like that). pass in textureName.

    super();

    this._frames = frames;
    this._overlaySprite = new Pixi.Sprite(_.find(frames, (frame) => frame.textureName === 'darkness'));

  }

  get overlaySprite() { return this._overlaySprite; }

}
