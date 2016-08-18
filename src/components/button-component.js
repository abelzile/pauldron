import Component from '../component';
import Pixi from 'pixi.js';
import * as Const from '../const';


export default class ButtonComponent extends Component {

  constructor(id = '', cornerDecoTexture, hPadding, vPadding) {

    super();

    this.Alpha = .4;

    this.id = id;
    this._hPadding = hPadding;
    this._vPadding = vPadding;

    this._sprite = undefined;

    this._tl = new Pixi.Sprite(cornerDecoTexture);

    this._tr = new Pixi.Sprite(cornerDecoTexture);
    this._tr.rotation = Const.RadiansOf90Degrees;

    this._br = new Pixi.Sprite(cornerDecoTexture);
    this._br.rotation = Const.RadiansOf180Degrees;

    this._bl = new Pixi.Sprite(cornerDecoTexture);
    this._bl.rotation = Const.RadiansOf270Degrees;

    this._bgGraphics = new Pixi.Graphics();

    this._bg = undefined;

  }

  get width() { return !this._bg ? 0 : this._bg.width; }

  get height() { return !this._bg ? 0 : this._bg.height; }

  initialize(pixiContainer, x = 0, y = 0) {

    if (!pixiContainer) { throw new Error('pixiContainer must be supplied.'); }
    if (!this._sprite) { throw new Error('sprite must be set before calling initialize.'); }

    this._bgGraphics
        .clear()
        .beginFill(Const.Color.Black)
        .drawRect(0, 0, this._sprite.width + (this._hPadding * 2), this._sprite.height + (this._vPadding * 2))
        .endFill();

    this._bg = new Pixi.Sprite(this._bgGraphics.generateTexture(null, 1, 1));
    this._bg.interactive = true;
    this._bg.buttonMode = true;

    pixiContainer.addChild(this._bg, this._tl, this._tr, this._br, this._bl, this._sprite);

    this.setPosition(x, y);

    return this;

  }

  setPosition(x, y) {

    this._bg.position.x = x;
    this._bg.position.y = y;

    this._sprite.position.x = this._bg.position.x + Math.floor(this._hPadding);
    this._sprite.position.y = this._bg.position.y + Math.floor(this._vPadding);

    this._tl.position.x = this._bg.position.x;
    this._tl.position.y = this._bg.position.y;
    this._tl.alpha = this.Alpha;

    this._tr.position.x = this._bg.position.x + this._bg.width;
    this._tr.position.y = this._bg.position.y;
    this._tr.alpha = this.Alpha;

    this._br.position.x = this._bg.position.x + this._bg.width;
    this._br.position.y = this._bg.position.y + this._bg.height;
    this._br.alpha = this.Alpha;

    this._bl.position.x = this._bg.position.x;
    this._bl.position.y = this._bg.position.y + this._bg.height;
    this._bl.alpha = this.Alpha;

    return this;

  }

  containsCoords(x, y) {

    if (this._bg) { return this._bg.getBounds().contains(x, y); }

    return this._sprite.getBounds().contains(x, y);

  }

}