import _ from 'lodash';
import Component from '../component';
import Pixi from 'pixi.js';


export default class BitmapTextComponent extends Component {

  constructor(text = '', style = {}, scale = 1) {

    super();

    this._sprite = new Pixi.extras.BitmapText(text, style);
    this._sprite.scale.set(scale);

  }

  get sprite() { return this._sprite; }

}