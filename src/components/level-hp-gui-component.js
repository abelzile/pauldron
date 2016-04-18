import BarGuiComponent from './bar-gui-component';


export default class LevelHpGuiComponent extends BarGuiComponent {

  constructor(texture) {
    super(texture);
  }

  clone() {
    return new LevelHpGuiComponent(this.texture);
  }

}