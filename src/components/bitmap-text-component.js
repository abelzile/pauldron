import Component from '../component';
import * as Pixi from 'pixi.js';


export default class BitmapTextComponent extends Component {

  constructor(text = '', style = {}, scale = 1, id = '') {

    super();

    this.id = id;
    this.sprite = new Pixi.extras.BitmapText(text, style);
    this.sprite.scale.set(scale);

  }

  get isVisible() {
    return this.sprite.visible;
  }

  get text() {
    return this.sprite.text;
  }
  set text(value) {
    this.sprite.text = value;
  }

  get alpha() {
    return this.sprite.alpha;
  }
  set alpha(value) {
    this.sprite.alpha = value;
    if (this.sprite.alpha <= 0) {
      this.hide();
    }
  }

  hide() {
    this.sprite.visible = false;
  }
  show() {
    this.sprite.alpha = 1;
    this.sprite.visible = true;
  }

}