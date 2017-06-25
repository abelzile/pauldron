import Component from '../component';

export default class RoomsComponent extends Component {
  constructor(rooms, startRoom = undefined, bossRoom = undefined, exitRoom = undefined) {
    super();
    this.rooms = rooms;
    this.startRoom = startRoom;
    this.bossRoom = bossRoom;
    this.exitRoom = exitRoom;
  }
}
