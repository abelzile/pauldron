import Component from '../component';

export default class DoorsComponent extends Component {

  constructor(doors, toBossDoor = undefined, toExitDoor = undefined) {
    super();
    this.doors = doors;
    this.toBossDoor = toBossDoor;
    this.toExitDoor = toExitDoor;
  }

}