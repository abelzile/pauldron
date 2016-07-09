import BitmapTextComponent from './bitmap-text-component';
import Component from '../component';
import MovieClipComponent from './movie-clip-component';
import SpriteComponent from "./sprite-component";
import * as Const from "../const";


export default class DialogHeaderComponent extends Component {

  constructor(text = '', style = {}, scale = 1, closeButtonFrames, cornerDecoTexture) {

    super();

    if (style.font) {
      this.headerTextComponent = new BitmapTextComponent(text, style, scale);
    } else {
      this.headerTextComponent = undefined;
    }

    if (closeButtonFrames) {
      this.closeButtonMcComponent = new MovieClipComponent(closeButtonFrames);
    } else {
      this.closeButtonMcComponent = undefined;
    }

    this.topLeftDecoSpriteComponent = new SpriteComponent(cornerDecoTexture);

    this.topRightDecoSpriteComponent = new SpriteComponent(cornerDecoTexture.clone());
    this.topRightDecoSpriteComponent.sprite.rotation = Const.RadiansOf90Degrees;

    this.bottomRightDecoSpriteComponent = new SpriteComponent(cornerDecoTexture.clone());
    this.bottomRightDecoSpriteComponent.sprite.rotation = Const.RadiansOf180Degrees;

    this.bottomLeftDecoSpriteComponent = new SpriteComponent(cornerDecoTexture.clone());
    this.bottomLeftDecoSpriteComponent.sprite.rotation = Const.RadiansOf270Degrees;

  }

}