import Component from '../component';
import Pixi from 'pixi.js';


export default class InventoryBackgroundComponent extends Component {

  constructor() {

    super();

    this._backgroundGraphics = new Pixi.Graphics();

  }

  get backgroundGraphics() { return this._backgroundGraphics; }

  clone() {
    return new InventoryBackgroundComponent();
  }

}
