import Component from '../component';
import Pixi from 'pixi.js';


export default class GraphicsComponent extends Component {

  constructor() {

    super();

    this.graphics = new Pixi.Graphics();

  }

  clone() {
    return new GraphicsComponent();
  }

}
