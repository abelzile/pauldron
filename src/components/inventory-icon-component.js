import SpriteComponent from './sprite-component';
import * as _ from 'lodash';

export default class InventoryIconComponent extends SpriteComponent {
  constructor(texture, ...allowedSlotTypes) {
    super(texture);
    this.allowedSlotTypes = _.clone(allowedSlotTypes);
  }

  clone() {
    return new InventoryIconComponent(this.texture, ...this.allowedSlotTypes);
  }
}
