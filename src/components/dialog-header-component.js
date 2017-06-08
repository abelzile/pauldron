import * as Const from '../const';
import AnimatedSpriteComponent from './animated-sprite-component';
import BitmapTextComponent from './bitmap-text-component';
import Component from '../component';
import SpriteComponent from './sprite-component';

export default class DialogHeaderComponent extends Component {
  constructor(text = '', style = {}, scale = 1, closeButtonFrames, cornerDecoTexture) {
    super();

    if (style.font) {
      this.headerTextComponent = new BitmapTextComponent(text, style, scale);
    } else {
      this.headerTextComponent = null;
    }

    if (closeButtonFrames) {
      this.closeButtonMcComponent = new AnimatedSpriteComponent(closeButtonFrames);
      this.closeButtonMcComponent.animatedSprite.interactive = true;
      this.closeButtonMcComponent.animatedSprite.buttonMode = true;
      this.closeButtonOn = this.closeButtonMcComponent.animatedSprite.on.bind(this.closeButtonMcComponent.animatedSprite);
    } else {
      this.closeButtonMcComponent = null;
      this.closeButtonOn = null;
    }

    this.topLeftDecoSpriteComponent = new SpriteComponent(cornerDecoTexture);

    this.topRightDecoSpriteComponent = new SpriteComponent(cornerDecoTexture.clone());
    this.topRightDecoSpriteComponent.sprite.rotation = Const.RadiansOf90Degrees;

    this.bottomRightDecoSpriteComponent = new SpriteComponent(cornerDecoTexture.clone());
    this.bottomRightDecoSpriteComponent.sprite.rotation = Const.RadiansOf180Degrees;

    this.bottomLeftDecoSpriteComponent = new SpriteComponent(cornerDecoTexture.clone());
    this.bottomLeftDecoSpriteComponent.sprite.rotation = Const.RadiansOf270Degrees;
  }

  removeAllListeners() {
    if (this.closeButtonMcComponent && this.closeButtonMcComponent.animatedSprite) {
      this.closeButtonMcComponent.animatedSprite.removeAllListeners();
    }
  }
}
