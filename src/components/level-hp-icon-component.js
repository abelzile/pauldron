import SpriteComponent from './sprite-component';


export default class LevelHpIconComponent extends SpriteComponent {

  constructor(texture) {
    super(texture);
  }

  clone() {
    return new LevelHpIconComponent(this.texture);
  }

}