import GraphicsComponent from './graphics-component';


export default class HotbarGuiComponent extends GraphicsComponent {

  constructor() {
    super();
  }

  clone() {
    return new HotbarGuiComponent();
  }

}