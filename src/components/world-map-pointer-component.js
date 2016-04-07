import MovieClipComponent from './movie-clip-component';

export default class WorldMapPointerComponent extends MovieClipComponent {

  constructor(frames) {

    super(frames);

    this._pointedToHex = undefined;

  }

  get pointedToHex() { return this._pointedToHex; }
  set pointedToHex(value) { this._pointedToHex = value; }
  
  clone() {
    const newComp = new super.clone();
    newComp.pointedToHex = this._pointedToHex;
    return newComp;
  }
  
}