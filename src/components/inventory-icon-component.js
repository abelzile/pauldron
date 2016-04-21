import SpriteComponent from './sprite-component';


export default class InventoryIconComponent extends SpriteComponent {

  constructor(texture, ...allowedSlotTypes) {

    super(texture);

    this._allowedSlotTypes = [];

    for (const s of allowedSlotTypes) {
      this._allowedSlotTypes.push(s);
    }

  }

  get allowedSlotTypes() { return this._allowedSlotTypes; }

  clone() {
    return new InventoryIconComponent(this.texture, ...this._allowedSlotTypes);
  }

}
