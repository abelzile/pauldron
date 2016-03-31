import Component from '../component';


export default class TemplateComponent extends Component {

  constructor() {
    super();
  }

  clone() {
    return new TemplateComponent();
  }

}
