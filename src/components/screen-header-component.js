import BitmapTextComponent from './bitmap-text-component';
import Component from '../component';


export default class ScreenHeaderComponent extends Component {

  constructor(text, style, scale) {

    super();

    this.headerTextComponent = new BitmapTextComponent(text, style, scale);

  }

}