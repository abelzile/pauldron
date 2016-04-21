import BarGuiComponent from './bar-gui-component';


export default class InventoryHpGuiComponent extends BarGuiComponent {

  constructor(texture) {
    super(texture);
  }

  clone() {
    return new InventoryHpGuiComponent(this.texture);
  }
  
}