import AnimatedSpriteComponent from './animated-sprite-component';

export default class WorldMapPointerComponent extends AnimatedSpriteComponent {

  constructor(frames) {

    super(frames);

    this.pointedToHex = undefined;

  }

  clone() {
    throw new Error('Not implemented.');
  }
  
}