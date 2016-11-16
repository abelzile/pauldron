import Component from '../component';
import * as Pixi from 'pixi.js';


export default class BitmapTextComponent extends Component {

  constructor(text = '', style = {}, scale = 1, id = '') {

    super();

    this.id = id;
    this.sprite = new Pixi.extras.BitmapText(text, style);
    this.sprite.scale.set(scale);

  }

}