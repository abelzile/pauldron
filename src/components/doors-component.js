import * as ObjectUtils from '../utils/object-utils';
import Component from '../component';

export default class DoorsComponent extends Component {
  constructor(doors) {
    super();

    this.doors = doors;

    for (let i = 0; i < this.doors.length; ++i) {
      const door = this.doors[i];

      if (!door.lock) {
        continue;
      }

      switch (ObjectUtils.getTypeName(door.lock)) {
        case 'BossDoorLock':
          this.bossDoor = door;
          break;
        case 'ExitDoorLock':
          this.exitDoor = door;
          break;
      }
    }
  }
}
