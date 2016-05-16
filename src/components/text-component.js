import _ from 'lodash';
import Component from '../component';
import Pixi from 'pixi.js';


export default class TextComponent extends Component {

  constructor(text = '', style = {}) {

    super();

    this.sprite = new Pixi.Text(text || '', style);

  }

  clone() {
    throw new Error('Not implemented.');
  }
  
} 