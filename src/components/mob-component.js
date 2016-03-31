import Component from '../component';


export default class MobComponent extends Component {

  constructor(mobTypeId) {
    super();
    this._mobTypeId = mobTypeId;
  }

  get mobTypeId() { return this._mobTypeId; }

  clone() {
    return new MobComponent(this._mobTypeId);
  }

}
