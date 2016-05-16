import Component from '../component';
import GraphicsComponent from './graphics-component';
import SpriteComponent from './sprite-component';


export default class LevelStatisticBarComponent extends Component {

  constructor(statisticTypeId, iconTexture) {

    super();

    this.statisticTypeId = statisticTypeId;
    this.iconSpriteComponent = new SpriteComponent(iconTexture);
    this.barGraphicsComponent = new GraphicsComponent();

  }
  
  clone() {
    throw new Error('Not implemented.');
  }

}