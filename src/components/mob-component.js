import Component from '../component';

export default class MobComponent extends Component {
  constructor(mobTypeId, isHostile = false, isFlying = false) {
    super();
    this.mobTypeId = mobTypeId;
    this.isHostile = isHostile;
    this.isFlying = isFlying;
  }

  clone() {
    return new MobComponent(this.mobTypeId, this.isHostile, this.isFlying);
  }
}
