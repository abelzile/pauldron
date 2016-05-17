import EntityReferenceComponent from './entity-reference-component';


export default class CurrentEntityReferenceComponent extends EntityReferenceComponent {

  constructor() {
    super();
  }
  
  clone() {
    throw new Error('Not implemented.');
  }

}