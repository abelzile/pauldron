import Component from '../component';

export default class WeaponComponent extends Component {
  constructor(weaponTypeId, weaponMaterialTypeId, handedness) {
    super();

    this.weaponTypeId = weaponTypeId;
    this.weaponMaterialTypeId = weaponMaterialTypeId;
    this.handedness = handedness;
  }
}
