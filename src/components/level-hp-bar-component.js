import GraphicsComponent from './graphics-component';


export default class LevelHpBarComponent extends GraphicsComponent {
  
  constructor() {
    super();
  }
  
  clone() {
    return new LevelHpBarComponent();
  }
  
}