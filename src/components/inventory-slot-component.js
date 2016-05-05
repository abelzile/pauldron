import * as Const from '../const';
import Component from '../component';
import Pixi from 'pixi.js';
import Point from '../point';
import _ from 'lodash';


export default class InventorySlotComponent extends Component {

  constructor(slotType, text = '', style, scale) {

    super();

    this._slotType = slotType;
    this._style = style;
    this._position = new Point();
    this._slotGraphics = new Pixi.Graphics();
    this._labelSprite = new Pixi.extras.BitmapText(text || this._slotType, style);
    this._labelSprite.scale.set(scale);

  }

  get slotType() { return this._slotType; }

  get position() { return this._position; }

  get slotGraphics() { return this._slotGraphics; }

  get labelSprite() { return this._labelSprite; }

  clone() {
    return new InventorySlotComponent(this._slotType,
                                      this._labelSprite.text,
                                      _.clone(this._style),
                                      this._labelSprite.scale.x);
  }

}
