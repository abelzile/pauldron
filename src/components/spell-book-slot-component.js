import Component from '../component';
import Pixi from 'pixi.js';
import Point from '../point';


export default class SpellBookSlotComponent extends Component {

  constructor(slotType, text = '', style, scale) {

    super();

    this.slotType = slotType;
    this.style = style;
    this.position = new Point();
    this.slotGraphics = new Pixi.Graphics();
    this.labelSprite = new Pixi.extras.BitmapText(text || this.slotType, style);
    this.labelSprite.scale.set(scale);

  }

  clone() {
    return new SpellBookSlotComponent(this.slotType, this.labelSprite.text, this.style, this.labelSprite.scale.x);
  }

}
