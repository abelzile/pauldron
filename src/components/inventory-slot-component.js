import * as Const from '../const';
import Component from '../component';
import Pixi from 'pixi.js';
import Point from '../point';


export default class InventorySlotComponent extends Component {

  constructor(slotType, slotText = '', position = new Point(), slotGraphics = new Pixi.Graphics()) {

    super();

    const labelTextStyle = { font: '16px "silkscreennormal"', fill: '#ffffff' };
    const labelTextScale = 0.3333333333333333;

    this._slotType = slotType;
    this._position = position;
    this._slotGraphics = slotGraphics;

    this._slotText = slotText;

    this._labelSprite = new Pixi.Text(slotText || this._slotType, labelTextStyle);
    this._labelSprite.scale.set(labelTextScale);

  }

  get slotType() { return this._slotType; }

  get position() { return this._position; }

  get slotGraphics() { return this._slotGraphics; }

  get labelSprite() { return this._labelSprite; }

  clone() {
    return new InventorySlotComponent(this._slotType, this._slotText, this._position.clone(), this._slotGraphics.clone());
  }

}
