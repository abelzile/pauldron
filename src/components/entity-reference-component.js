import Component from '../component';


export default class EntityReferenceComponent extends Component {

  constructor(typeId = '', entityId = '') {

    super();

    this.typeId = typeId;
    this.entityId = entityId;

  }

  clone() {
    return new EntityReferenceComponent(this.typeId, this.entityId);
  }

}
