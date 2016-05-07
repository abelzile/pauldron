import Component from '../component';
import BitmapTextComponent from './bitmap-text-component';
import GraphicsComponent from './graphics-component';


export default class TextButtonComponent extends Component {

  constructor(text, style, scale = 1) {

    super();

    this._bitmapTextComponent = new BitmapTextComponent(text, style, scale);
    this._graphicsComponent = new GraphicsComponent();

  }

  get bitmapTextComponent() { return this._bitmapTextComponent; }

  get graphicsComponent() { return this._graphicsComponent; }

  clone() {
    throw new Error('Not implemented.');
  }

}