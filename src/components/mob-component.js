import Component from '../component';

export default class MobComponent extends Component {
  constructor(mobTypeId, isHostile = false) {
    super();
    this.mobTypeId = mobTypeId;
    this.isHostile = isHostile;
  }

  clone() {
    return new MobComponent(this.mobTypeId, this.isHostile);
  }
}
