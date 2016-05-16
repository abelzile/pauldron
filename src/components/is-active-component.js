import Component from '../component';


export default class IsActiveComponent extends Component {

  constructor(isActive = false) {

    super();

    this.isActive = isActive;

  }

  clone() {
    return new IsActiveComponent(this.isActive);
  }

}
