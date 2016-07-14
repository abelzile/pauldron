import Component from '../component';
import BitmapTextComponent from './bitmap-text-component';


export default class TextButtonComponent extends Component {

  constructor(text, style, scale = 1, id = '') {

    super();
    
    this.id = id;
    this.bitmapTextComponent = new BitmapTextComponent(text, style, scale);

  }

  containsCoords(x, y) {
    return this.bitmapTextComponent.sprite.getBounds().contains(x, y);
  }

}