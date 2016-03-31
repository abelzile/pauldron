import Component from '../component';
import Pixi from 'pixi.js';


export default class GraphicsComponent extends Component {

  constructor() {

    super();

    this._graphics = new Pixi.Graphics();

  }

  get graphics() { return this._graphics; }

}
