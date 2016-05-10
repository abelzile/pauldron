import Component from '../component';
import GraphicsComponent from './graphics-component';
import SpriteComponent from './sprite-component';


export default class LevelStatisticBarComponent extends Component {

  constructor(statisticTypeId, iconTexture) {

    super();

    this._statisticTypeId = statisticTypeId;
    this._iconSpriteComponent = new SpriteComponent(iconTexture);
    this._barGraphicsComponent = new GraphicsComponent();

  }
  
  get statisticTypeId() { return this._statisticTypeId; }
  
  get iconSpriteComponent() { return this._iconSpriteComponent; }
  
  get barGraphicsComponent() { return this._barGraphicsComponent; }
  
  clone() {
    throw new Error('Not implemented.');
  }

}