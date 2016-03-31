import Pixi from 'pixi.js';
import Component from '../component';


export default class MainMenuItemSpriteComponent extends Component {

  constructor(text) {
    super();
    this._text = text;
    this._sprite = new Pixi.Text(
      this._text,
      { font: '10px \'Press Start 2P\'', fill: '#ff0000' });
  }

  get text() { return this._text; }

  get sprite() { return this._sprite; }

  clone() {
    return new MainMenuItemSpriteComponent(this._text);
  }

}
