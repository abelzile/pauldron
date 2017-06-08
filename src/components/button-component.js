import * as Const from '../const';
import * as Pixi from 'pixi.js';
import Component from '../component';

export default class ButtonComponent extends Component {
  constructor(id = '', cornerDecoTexture, hPadding, vPadding) {
    super();

    this.alpha = 0.4;
    this._visible = true;

    this.id = id;
    this._hPadding = hPadding;
    this._vPadding = vPadding;

    this.sprite = null;

    if (cornerDecoTexture) {
      this._tl = new Pixi.Sprite(cornerDecoTexture);
      this._tr = new Pixi.Sprite(cornerDecoTexture);
      this._tr.rotation = Const.RadiansOf90Degrees;
      this._br = new Pixi.Sprite(cornerDecoTexture);
      this._br.rotation = Const.RadiansOf180Degrees;
      this._bl = new Pixi.Sprite(cornerDecoTexture);
      this._bl.rotation = Const.RadiansOf270Degrees;
    } else {
      this._tl = null;
      this._tr = null;
      this._br = null;
      this._bl = null;
    }

    this._bg = new Pixi.Graphics();

    this.on = this._bg.on.bind(this._bg);
    this.once = this._bg.once.bind(this._bg);
    this.removeAllListeners = this._bg.removeAllListeners.bind(this._bg);
  }

  get width() {
    return !this._bg ? 0 : this._bg.width;
  }

  get height() {
    return !this._bg ? 0 : this._bg.height;
  }

  get visible() {
    return this._visible;
  }
  set visible(value) {
    this._visible = value;
    this._bg.visible = this._visible;
    if (this._tl) {
      this._tl.visible = this._visible;
    }
    if (this._tr) {
      this._tr.visible = this._visible;
    }
    if (this._br) {
      this._br.visible = this._visible;
    }
    if (this._bl) {
      this._bl.visible = this._visible;
    }
    if (this.sprite) {
      this.sprite.visible = this._visible;
    }
  }

  initialize(pixiContainer, x = 0, y = 0) {
    if (!pixiContainer) {
      throw new Error('pixiContainer must be supplied.');
    }
    if (!this.sprite) {
      throw new Error('sprite must be set before calling initialize.');
    }

    this._bg
      .clear()
      .beginFill(Const.Color.Black)
      .drawRect(0, 0, this.sprite.width + this._hPadding * 2, this.sprite.height + this._vPadding * 2)
      .endFill();

    this._bg.interactive = true;
    this._bg.buttonMode = true;

    pixiContainer.addChild(this._bg, this.sprite);
    this._tl && pixiContainer.addChild(this._tl);
    this._tr && pixiContainer.addChild(this._tr);
    this._br && pixiContainer.addChild(this._br);
    this._bl && pixiContainer.addChild(this._bl);

    this.setPosition(x, y);

    return this;
  }

  setPosition(x, y) {
    this._bg.position.x = x;
    this._bg.position.y = y;

    this.sprite.position.x = this._bg.position.x + Math.floor(this._hPadding);
    this.sprite.position.y = this._bg.position.y + Math.floor(this._vPadding);

    if (this._tl) {
      this._tl.position.x = this._bg.position.x;
      this._tl.position.y = this._bg.position.y;
      this._tl.alpha = this.alpha;
    }

    if (this._tr) {
      this._tr.position.x = this._bg.position.x + this._bg.width;
      this._tr.position.y = this._bg.position.y;
      this._tr.alpha = this.alpha;
    }

    if (this._br) {
      this._br.position.x = this._bg.position.x + this._bg.width;
      this._br.position.y = this._bg.position.y + this._bg.height;
      this._br.alpha = this.alpha;
    }

    if (this._bl) {
      this._bl.position.x = this._bg.position.x;
      this._bl.position.y = this._bg.position.y + this._bg.height;
      this._bl.alpha = this.alpha;
    }

    return this;
  }

  containsCoords(x, y) {
    if (this._bg) {
      return this._bg.getBounds().contains(x, y);
    }

    return this.sprite.getBounds().contains(x, y);
  }
}
