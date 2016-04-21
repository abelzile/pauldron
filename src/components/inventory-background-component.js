import GraphicsComponent from "./graphics-component";


export default class InventoryBackgroundComponent extends GraphicsComponent {

  constructor() {
    super();
  }

  clone() {
    return new InventoryBackgroundComponent();
  }

}