import Component from '../component';
import BitmapTextComponent from './bitmap-text-component';
import GraphicsComponent from './graphics-component';


export default class TextButtonComponent extends Component {

  constructor(text, style, scale = 1) {

    super();

    this.bitmapTextComponent = new BitmapTextComponent(text, style, scale);
    this.graphicsComponent = new GraphicsComponent();

  }

  clone() {
    throw new Error('Not implemented.');
  }

}