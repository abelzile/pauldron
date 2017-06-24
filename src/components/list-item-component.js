import * as Pixi from 'pixi.js';
import Component from '../component';

export default class ListItemComponent extends Component {
  constructor(value, text, style = {}, scale = 1) {
    super();

    this.value = value;
    this.sprite = new Pixi.extras.BitmapText(text, style);
    this.sprite.scale.set(scale);
    this.sprite.interactive = true;
    this.sprite.buttonMode = true;
    this.on = this.sprite.on.bind(this.sprite);
    this.once = this.sprite.once.bind(this.sprite);
    this.removeAllListeners = this.sprite.removeAllListeners.bind(this.sprite);
  }

  containsCoords(x, y) {
    return this.sprite.getBounds().contains(x, y);
  }
}
