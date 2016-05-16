import Component from '../component';
import Pixi from 'pixi.js';


export default class SpriteComponent extends Component {

  constructor(texture) {

    super();

    this.texture = texture;
    this.sprite = new Pixi.Sprite(this.texture);

  }

  clone() {
    return new SpriteComponent(this.texture);
  }

}