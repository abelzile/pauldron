import BitmapTextComponent from './bitmap-text-component';
import Component from '../component';


export default class ListItemComponent extends Component {

  constructor(value, text, style = {}, scale = 1) {

    super();

    this.value = value;
    this.bitmapTextComponent = new BitmapTextComponent(text, style, scale);
    this.selected = false;

  }

  containsCoords(x, y) {
    return this.bitmapTextComponent.sprite.getBounds().contains(x, y);
  }

}