import Component from '../component';


export default class ColorComponent extends Component {

  constructor(color, id) {
    super();
    this.id = id;
    this.color = color;
  }

  clone() {
    return new ColorComponent(this.color, this.id);
  }

}