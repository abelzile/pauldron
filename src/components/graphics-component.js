import * as Pixi from 'pixi.js';
import Component from '../component';

export default class GraphicsComponent extends Component {
  constructor(id = '') {
    super();

    this.id = id;
    this.graphics = new Pixi.Graphics();
  }

  clone() {
    return new GraphicsComponent(this.id);
  }
}
