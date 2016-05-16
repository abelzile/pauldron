import Component from '../component';


export default class ContainerComponent extends Component {

  constructor(containerTypeId) {
    super();
    this.containerTypeId = containerTypeId;
  }

  clone() {
    return new ContainerComponent(this.containerTypeId);
  }

}
