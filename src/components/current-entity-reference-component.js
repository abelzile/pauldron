import EntityReferenceComponent from './entity-reference-component';

export default class CurrentEntityReferenceComponent extends EntityReferenceComponent {
  constructor() {
    super();
    this.data = '';
  }

  empty() {
    super.empty();
    this.data = '';
  }
}
