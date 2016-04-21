import GraphicsComponent from './graphics-component';


export default class InventoryHpBarComponent extends GraphicsComponent {

  constructor() {
    super();
  }

  clone() {
    return new InventoryHpBarComponent();
  }

}