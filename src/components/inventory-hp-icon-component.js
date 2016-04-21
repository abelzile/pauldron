import SpriteComponent from './sprite-component';


export default class InventoryHpIconComponent extends SpriteComponent {

  constructor(texture) {
    super(texture);
  }

  clone() {
    return new InventoryHpIconComponent(this.texture);
  }

}