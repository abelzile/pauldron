import BitmapTextComponent from './bitmap-text-component';
import Component from '../component';
import MovieClipComponent from './movie-clip-component';


export default class DialogHeaderComponent extends Component {

  constructor(text, style, scale, closeButtonFrames) {

    super();

    this.headerTextComponent = new BitmapTextComponent(text, style, scale);
    this.closeButtonMcComponent = new MovieClipComponent(closeButtonFrames)
 
  }
  
  clone() {
    throw new Error('Not implemented.');
  }

}