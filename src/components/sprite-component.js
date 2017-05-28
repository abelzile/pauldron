import * as Pixi from 'pixi.js';
import Component from '../component';

export default class SpriteComponent extends Component {
  constructor(texture, id = '') {
    super();

    this.texture = texture;
    this.id = id;
    this.sprite = new Pixi.Sprite(this.texture);
  }

  containsCoords(x, y) {
    return this.sprite.containsPoint(new Pixi.Point(x, y));
  }

  clone() {
    return new SpriteComponent(this.texture, this.id);
  }
}
