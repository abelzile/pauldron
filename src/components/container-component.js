import Component from '../component';

export default class ContainerComponent extends Component {
  constructor(containerTypeId, dropTypeId, capacity, isClosed = true) {
    super();
    this.containerTypeId = containerTypeId;
    this.dropTypeId = dropTypeId;
    this.capacity = capacity;
    this.isClosed = isClosed;
  }

  clone() {
    return new ContainerComponent(this.containerTypeId);
  }
}
