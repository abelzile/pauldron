import _ from 'lodash';
import Component from '../component';
import Pixi from 'pixi.js';


export default class TextComponent extends Component {

  constructor(text, style) {

    super();

    this._sprite = new Pixi.Text(text, style);

  }

  get sprite() { return this._sprite; }

  clone() {
    return new TextComponent(this._sprite.text, _.clone(this._sprite.style));
  }

}