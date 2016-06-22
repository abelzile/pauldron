import Component from '../component';


export default class WeaponComponent extends Component {

  constructor(weaponTypeId, handedness) {
    
    super();

    this.weaponTypeId = weaponTypeId;
    this.handedness = handedness;
    
  }

}