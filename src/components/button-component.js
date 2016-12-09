import * as Const from '../const';
import * as Pixi from 'pixi.js';
import Component from '../component';


export default class ButtonComponent extends Component {

  constructor(id = '', cornerDecoTexture, hPadding, vPadding) {

    super();

    this.Alpha = .4;

    this.id = id;
    this._hPadding = hPadding;
    this._vPadding = vPadding;

    this._logMsgText = undefined;

    this._tl = new Pixi.Sprite(cornerDecoTexture);

    this._tr = new Pixi.Sprite(cornerDecoTexture);
    this._tr.rotation = Const.RadiansOf90Degrees;

    this._br = new Pixi.Sprite(cornerDecoTexture);
    this._br.rotation = Const.RadiansOf180Degrees;

    this._bl = new Pixi.Sprite(cornerDecoTexture);
    this._bl.rotation = Const.RadiansOf270Degrees;

    this._bg = new Pixi.Graphics();

  }

  get width() { return !this._bg ? 0 : this._bg.width; }

  get height() { return !this._bg ? 0 : this._bg.height; }

  initialize(pixiContainer, x = 0, y = 0) {

    if (!pixiContainer) { throw new Error('pixiContainer must be supplied.'); }
    if (!this._logMsgText) { throw new Error('sprite must be set before calling initialize.'); }

    this._bg
        .clear()
        .beginFill(Const.Color.Black)
        .drawRect(0, 0, this._logMsgText.width + (this._hPadding * 2), this._logMsgText.height + (this._vPadding * 2))
        .endFill();

    this._bg.interactive = true;
    this._bg.buttonMode = true;

    pixiContainer.addChild(this._bg, this._tl, this._tr, this._br, this._bl, this._logMsgText);

    this.setPosition(x, y);

    return this;

  }

  setPosition(x, y) {

    this._bg.position.x = x;
    this._bg.position.y = y;

    this._logMsgText.position.x = this._bg.position.x + Math.floor(this._hPadding);
    this._logMsgText.position.y = this._bg.position.y + Math.floor(this._vPadding);

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

    return this._logMsgText.getBounds().contains(x, y);

  }

}