import Component from '../component';
import GraphicsComponent from './graphics-component';
import SpriteComponent from './sprite-component';

export default class LevelStatisticBarComponent extends Component {
  constructor(statisticTypeId, iconTexture) {
    super();

    this.statisticTypeId = statisticTypeId;
    this.iconComponent = new SpriteComponent(iconTexture);
    this.barComponent = new GraphicsComponent();
  }
}
