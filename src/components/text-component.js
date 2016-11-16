import Component from '../component';
import * as Pixi from 'pixi.js';


export default class TextComponent extends Component {

  constructor(text = '', style = {}) {

    super();

    this.sprite = new Pixi.Text(text || '', style);

  }

  clone() {
    throw new Error('Not implemented.');
  }
  
} 