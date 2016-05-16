import Component from '../component';
import Pixi from 'pixi.js';


export default class MainMenuItemSpriteComponent extends Component {

  constructor(text) {

    super();

    this.text = text;
    this.sprite = new Pixi.Text(this.text, { font: '10px \'Press Start 2P\'', fill: '#ff0000' });
  }

  clone() {
    return new MainMenuItemSpriteComponent(this.text);
  }

}
