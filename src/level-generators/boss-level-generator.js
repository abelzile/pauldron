import Door from './door';
import Hall from './hall';
import LevelGenerator from './level-generator';
import Room from './room';
import Vector from '../vector';
import ExitDoorLock from './exit-door-lock';

export default class BossLevelGenerator extends LevelGenerator {

  constructor(width = 30, height = 60) {

    super();

    this.width = width;
    this.height = height;
    this.rooms = [];
    this.halls = [];
    this.doors = [];
    this.grid = [];
    this.topRightRoom = null;
    this.bottomRightRoom = null;
    this.topLeftRoom = null;
    this.bottomLeftRoom = null;

    this._initGrid();

  }

  generate() {

    const bossRoom = new Room(
      5,
      this.height / 2,
      this.width - 10,
      this.height / 2 - 5,
      true
    );

    const exitRoom = new Room(
      Math.ceil((this.width - 5) / 2),
      bossRoom.top - 5 - 5,
      5,
      5
    );

    const hall = new Hall(
      Math.floor(this.width / 2),
      exitRoom.bottom,
      1,
      bossRoom.top - exitRoom.bottom
    );

    const exitDoor = new Door(
      new Vector(hall.x, hall.bottom - 1),
      bossRoom,
      hall,
      new ExitDoorLock()
    );

    const anotherDoor = new Door(
      new Vector(hall.x, hall.y),
      exitRoom,
      hall
    );

    this.rooms.push(exitRoom, bossRoom);
    this.halls.push(hall);
    this.doors.push(exitDoor, anotherDoor);

    this.drawRooms(this.grid, this.rooms);
    this.drawHalls(this.grid, this.halls);

    this.topLeftRoom = this.topRightRoom = exitRoom;
    this.bottomLeftRoom = this.bottomRightRoom = bossRoom;


  }

  _initGrid() {

    for (let y = 0; y < this.height; ++y) {

      const row = [];

      for (let x = 0; x < this.width; ++x) {
        row[x] = 1;
      }

      this.grid[y] = row;

    }

  }

}