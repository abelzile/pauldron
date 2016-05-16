import Component from '../component';


export default class MobComponent extends Component {

  constructor(mobTypeId) {

    super();

    this.mobTypeId = mobTypeId;
    
  }

  clone() {
    return new MobComponent(this.mobTypeId);
  }

}
