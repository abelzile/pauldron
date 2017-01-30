import _ from 'lodash';
import Point from '../../point';
import Rectangle from '../../rectangle';
import { astar, Graph } from 'javascript-astar';
import * as ArrayUtils from '../../utils/array-utils';
import * as EnumUtils from '../../utils/enum-utils';
import Vector from '../../vector';


export default class RandomDungeonGenerator {

  constructor({
      mapWidth: mapWidth = 100,
      mapHeight: mapHeight = 100,
      roomCount: roomCount = 20,
      minRoomSize: minRoomSize = 6,
      maxRoomSize: maxRoomSize = 15
    } = {}) {

    this.RoomBorder = 3; // minimum spacing around each room.
    this.TileType = EnumUtils.create({
      Impassible: 0,
      Diggable: 1,
      Room: 2
    });

    this._mapWidth = mapWidth;
    this._mapHeight = mapHeight;
    this._roomCount = roomCount;
    this._minRoomSize = minRoomSize;
    this._maxRoomSize = maxRoomSize;

    this._map = undefined;
    this._rooms = undefined;
    this._hallways = undefined;
    this._graph = undefined;
    this._entranceRoom = undefined;
    this._entrancePos = undefined;

  }

  get rooms() { return this._rooms; }

  get hallways() { return this._hallways; }

  get grid() { return this._graph.grid; }

  get entranceRoom() { return this._entranceRoom; }

  get entrancePos() { return this._entrancePos; }

  generate() {

    this._initMap();
    this._generateRooms();
    this._generateHallways();

    this._graph = new Graph(this._map);

  }

  _initMap() {
    this._map = ArrayUtils.create2d(this._mapHeight, this._mapHeight, this.TileType.Diggable);
  }

  _generateRooms() {

    //TODO: add a retry limit.

    this._rooms = [];

    while (this._rooms.length < this._roomCount) {

      const width = _.random(this._minRoomSize, this._maxRoomSize, false);
      const height = _.random(this._minRoomSize, this._maxRoomSize, false);

      const newRoom = new Rectangle(
        _.random(1, this._mapWidth - 1 - width, false),
        _.random(1, this._mapHeight - 1 - height, false),
        width,
        height);

      if (this._rooms.length === 0) {
        this._rooms.push(newRoom);
        continue;
      }

      const newRoowWithBuffer = Rectangle.inflate(newRoom, this.RoomBorder);

      let good = true;

      for (let i = 0; i < this._rooms.length && good; ++i) {

        const existingRoom = this._rooms[i];

        if (newRoowWithBuffer.intersectsWith(existingRoom)) {
          good = false;
          break;
        }

      }

      if (good) {
        this._rooms.push(newRoom);
      }

    }

    for (const room of this._rooms) {

      let door = (room.x + (Math.round((room.width - 1) / 2)));

      for (let x = room.x - 1; x <= room.x + room.width; ++x) {

        if (x === door) { continue; }

        this._map[room.y - 1][x] = this.TileType.Impassible;
        this._map[room.y + room.height][x] = this.TileType.Impassible;

      }

      door = (room.y + (Math.round((room.height - 1) / 2)));

      for (let y = room.y - 1; y <= room.y + room.height; ++y) {

        if (y === door) { continue; }

        this._map[y][room.x - 1] = this.TileType.Impassible;
        this._map[y][room.x + room.width] = this.TileType.Impassible;

      }

      for (let y = room.y; y < room.y + room.height; ++y) {
        for (let x = room.x; x < room.x + room.width; ++x) {
          this._map[y][x] = this.TileType.Room;
        }
      }

    }

  }

  _generateHallways() {

    this._entranceRoom = RandomDungeonGenerator._findStartRoom(this._rooms);
    this._entrancePos = new Vector(this._entranceRoom.x + 2, this._entranceRoom.y + 2);

    const joinedRooms = [ this._entranceRoom ];
    const unjoinedRooms = _.filter(this._rooms, room => room !== this._entranceRoom);

    let i = unjoinedRooms.length;

    while (i--) {

      const roomToJoin = joinedRooms[joinedRooms.length - 1];
      const roomToJoinCenter = roomToJoin.getCenter();

      _.each(unjoinedRooms, (potentialRoom) => {
        if (potentialRoom !== roomToJoin) {
          potentialRoom.dist = Point.distanceSquared(roomToJoinCenter, potentialRoom.getCenter());
        }
      });

      unjoinedRooms.sort(function(a, b) { return a.dist - b.dist; });

      joinedRooms.push(unjoinedRooms.shift());

    }

    this._hallways = [];

    for (let k = 1; k < joinedRooms.length; ++k) {
      this._hallways.push(this._generateHallway(joinedRooms[k - 1], joinedRooms[k]));
    }

  }

  _generateHallway(room1, room2) {

    const room1Center = room1.getCenter();
    const room2Center = room2.getCenter();

    const graph = new Graph(this._map);
    const start = graph.grid[Math.round(room1Center.y)][Math.round(room1Center.x)];
    const end = graph.grid[Math.round(room2Center.y)][Math.round(room2Center.x)];

    return astar.search(graph, start, end);

  }

  static _findStartRoom(rooms) {

    const funcs = [
      (room) => { return room.x <= startRoom.x && room.y <= startRoom.y; },
      (room) => { return room.x >= startRoom.x && room.y <= startRoom.y; },
      (room) => { return room.x <= startRoom.x && room.y >= startRoom.y; },
      (room) => { return room.x >= startRoom.x && room.y >= startRoom.y; }
    ];

    const func = funcs[_.random(0, funcs.length - 1, false)];
    let startRoom = rooms[0];

    _.each(rooms, (room) => {
      if (func(room)) {
        startRoom = room;
      }
    });

    return startRoom;

  }

}
