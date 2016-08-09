import Pixi from 'pixi.js';
import ButtonComponent from './button-component';


export default class SpriteButtonComponent extends ButtonComponent {

  constructor(id = '', cornerDecoTexture, texture) {

    super(id, cornerDecoTexture, 3, 3);

    this._sprite = new Pixi.Sprite(texture);

  }

}