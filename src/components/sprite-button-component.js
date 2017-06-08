import * as Pixi from 'pixi.js';
import ButtonComponent from './button-component';

export default class SpriteButtonComponent extends ButtonComponent {
  constructor(id = '', cornerDecoTexture, texture, hPadding = 3, vPadding = 3) {
    super(id, cornerDecoTexture, hPadding, vPadding);

    this.sprite = new Pixi.Sprite(texture);
  }
}
