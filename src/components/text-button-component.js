import * as Pixi from 'pixi.js';
import ButtonComponent from './button-component';


export default class TextButtonComponent extends ButtonComponent {

  constructor(id = '', cornerDecoTexture, text, style, scale = 1) {

    super(id, cornerDecoTexture, 4, 1.5);

    this._logMsgText = new Pixi.extras.BitmapText(text, style);
    this._logMsgText.scale.set(scale);

  }

}