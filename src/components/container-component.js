import Component from '../component';


export default class ContainerComponent extends Component {

  constructor(containerTypeId) {
    super();
    this._containerTypeId = containerTypeId;
  }

  get containerTypeId() { return this._containerTypeId; }

  clone() {
    return new ContainerComponent(this._containerTypeId);
  }

}
