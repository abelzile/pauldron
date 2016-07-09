import Component from '../component';
import Pixi from 'pixi.js'


export default class BitmapTextComponent extends Component {

  constructor(text = '', style = {}, scale = 1) {

    super();

    this.sprite = new Pixi.extras.BitmapText(text, style);
    this.sprite.scale.set(scale);

  }

}