import SpriteComponent from './sprite-component';


export default class LevelIconComponent extends SpriteComponent {

  constructor(texture) {
    super(texture);
  }

  clone() {
    return new LevelIconComponent(this._texture);
  }

}