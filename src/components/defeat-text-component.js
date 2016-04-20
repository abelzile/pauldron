import _ from 'lodash';
import TextComponent from './text-component';


export default class DefeatTextComponent extends TextComponent {
  
  constructor(text, style) {
    super(text, style);
  }
  
  clone() {
    return new DefeatTextComponent(this.sprite.text, _.clone(this.sprite.style));
  }
  
}