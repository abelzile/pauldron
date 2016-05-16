import Component from '../component';
import Point from '../point';


export default class LevelContainerComponent extends Component{

  constructor(containerTypeId, x, y) {

    super();

    this.containerTypeId = containerTypeId;
    this.startPosition = new Point(x, y);
    this.currentEntityId = '';

  }

  clone() {
    throw new Error('Not implemented.');
  }

}
