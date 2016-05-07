import BitmapTextComponent from './bitmap-text-component';
import Component from '../component';
import GraphicsComponent from './graphics-component';
import SpriteComponent from './sprite-component';


export default class ScreenHeaderComponent extends Component {

  constructor(text, style, scale, leftDecorationTexture, rightDecorationTexture, dividerDecorationTexture) {

    super();

    this._headerTextComponent = new BitmapTextComponent(text, style, scale);
    this._dividerGraphicsComponent = new GraphicsComponent();
    this._textDecorationLeftSpriteComponent = new SpriteComponent(leftDecorationTexture);
    this._textDecorationRightSpriteComponent = new SpriteComponent(rightDecorationTexture);
    this._dividerDecorationSpriteComponent = new SpriteComponent(dividerDecorationTexture);

  }

  get headerTextComponent() { return this._headerTextComponent; }

  get dividerGraphicsComponent() { return this._dividerGraphicsComponent; }

  get textDecorationLeftSpriteComponent() { return this._textDecorationLeftSpriteComponent; }

  get textDecorationRightSpriteComponent() { return this._textDecorationRightSpriteComponent; }

  get dividerDecorationSpriteComponent() { return this._dividerDecorationSpriteComponent; }

  clone() {
    throw new Error('Not implemented.');
  }

}