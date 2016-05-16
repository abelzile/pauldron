import SpriteComponent from './sprite-component';


export default class InventoryIconComponent extends SpriteComponent {

  constructor(texture, ...allowedSlotTypes) {

    super(texture);

    this.allowedSlotTypes = [];

    for (const s of allowedSlotTypes) {
      this.allowedSlotTypes.push(s);
    }

  }

  clone() {
    return new InventoryIconComponent(this.texture, ...this.allowedSlotTypes);
  }

}
