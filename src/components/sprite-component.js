import Component from '../component';
import Pixi from 'pixi.js';


export default class SpriteComponent extends Component {

  constructor(texture) {

    super();

    this._texture = texture;
    this._sprite = new Pixi.Sprite(this._texture);

  }

  get texture() { return this._texture; }

  get sprite() { return this._sprite; }

  clone() {
    return new SpriteComponent(this._texture);
  }


}