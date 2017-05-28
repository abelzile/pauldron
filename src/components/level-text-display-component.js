import * as Const from '../const';
import BitmapTextComponent from './bitmap-text-component';
import Component from '../component';
import SpriteComponent from './sprite-component';

export default class LevelTextDisplayComponent extends Component {
  constructor(iconTexture, text = '', textStyle = {}, id = '') {
    super();
    this.id = id;
    this.iconComponent = new SpriteComponent(iconTexture);
    this.textComponent = new BitmapTextComponent(text, textStyle);
  }

  get isVisible() {
    return this.iconComponent.sprite.visible;
  }

  get text() {
    return this.textComponent.sprite.text;
  }
  set text(value) {
    this.textComponent.sprite.text = value;
  }

  show() {
    this.iconComponent.sprite.visible = true;
    this.textComponent.sprite.visible = true;
  }

  hide() {
    this.iconComponent.sprite.visible = false;
    this.textComponent.sprite.visible = false;
  }

  setPosition(x, y) {
    const iconSprite = this.iconComponent.sprite;
    iconSprite.position.set(x, y);
    this.textComponent.sprite.position.set(iconSprite.x + 10, iconSprite.y);
  }
}
