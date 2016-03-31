import Component from '../component';
import Pixi from 'pixi.js';


export default class InventoryIconComponent extends Component {

  constructor(texture, ...allowedSlotTypes) {

    super();

    this._texture = texture;
    this._iconSprite = new Pixi.Sprite(this._texture);
    this._allowedSlotTypes = [];

    for (const s of allowedSlotTypes) {
      this._allowedSlotTypes.push(s);
    }

  }

  get iconSprite() { return this._iconSprite; }

  get allowedSlotTypes() { return this._allowedSlotTypes; }

  clone() {
    return new InventoryIconComponent(this._texture, ...this._allowedSlotTypes);
  }

}
