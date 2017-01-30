import Component from '../component';
import Vector from '../vector';

export default class LevelContainerComponent extends Component{

  constructor(containerTypeId, x, y) {

    super();

    this.containerTypeId = containerTypeId;
    this.startPosition = new Vector(x, y);
    this.currentEntityId = '';

  }

  clone() {
    throw new Error('Not implemented.');
  }

}
