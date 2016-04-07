import Component from '../component';
import Pixi from 'pixi.js';


export default class WorldMapButtonComponent extends Component {

  constructor(text) {

    super();

    this._text = text;

    this._sprite = new Pixi.Text(
      this._text,
      { font: '12px "silkscreennormal"', fill: '#ffffff' });

  }

  get text() { return this._text; }

  get sprite() { return this._sprite; }

  clone() {
    return new WorldMapButtonComponent(this._text);
  }


}