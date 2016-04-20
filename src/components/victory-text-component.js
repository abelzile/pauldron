import _ from 'lodash';
import TextComponent from './text-component';


export default class VictoryTextComponent extends TextComponent {

  constructor(text, style) {
    super(text, style);
  }

  clone() {
    return new VictoryTextComponent(this.sprite.text, _.clone(this.sprite.style));
  }

}