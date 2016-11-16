import BitmapTextComponent from './bitmap-text-component';
import Component from '../component';
import * as Pixi from 'pixi.js';


export default class ListItemComponent extends Component {

  constructor(value, text, style = {}, scale = 1) {

    super();

    this.value = value;
    this.sprite = new Pixi.extras.BitmapText(text, style);
    this.sprite.scale.set(scale);
    this.sprite.interactive = true;
    this.sprite.buttonMode = true;

  }

  containsCoords(x, y) {
    return this.sprite.getBounds().contains(x, y);
  }

}