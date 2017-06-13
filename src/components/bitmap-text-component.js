import * as Pixi from 'pixi.js';
import Component from '../component';

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

  get position() {
    return this.sprite.position;
  }

  get x() {
    return this.sprite.position.x;
  }
  set x(value) {
    this.sprite.position.x = value;
  }

  get y() {
    return this.sprite.position.y;
  }
  set y(value) {
    this.sprite.position.y = value;
  }

  get width() {
    return this.sprite.width;
  }
  set width(value) {
    this.sprite.width = value;
  }

  get height() {
    return this.sprite.height;
  }
  set height(value) {
    this.sprite.height = value;
  }

  hide() {
    this.sprite.visible = false;
  }
  show() {
    this.sprite.alpha = 1;
    this.sprite.visible = true;
  }
}
