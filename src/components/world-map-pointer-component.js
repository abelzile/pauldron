import MovieClipComponent from './movie-clip-component';

export default class WorldMapPointerComponent extends MovieClipComponent {

  constructor(frames) {

    super(frames);

    this.pointedToHex = undefined;

  }

  clone() {
    throw new Error('Not implemented.');
  }
  
}