import * as Pixi from 'pixi.js';
import Component from '../component';
import Vector from '../vector';

export default class InventorySlotComponent extends Component {
  constructor(slotType, text = '', style, scale) {
    super();

    this.slotType = slotType;
    this.style = style;
    this.position = new Vector();
    this.slotGraphics = new Pixi.Graphics();
    this.labelSprite = new Pixi.extras.BitmapText(text || this.slotType, style);
    this.labelSprite.scale.set(scale);
  }

  clone() {
    return new InventorySlotComponent(this.slotType, this.labelSprite.text, this.style, this.labelSprite.scale.x);
  }
}
