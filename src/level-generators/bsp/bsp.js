import * as _ from 'lodash';
import Rectangle from '../../rectangle';
import Vector from '../../vector';

export default class Bsp {

  constructor(width = 200, height = 200) {

    this.ITERATIONS = 5;
    this.SPACE_BETWEEN_ROOMS = 10;
    this.MIN_ROOM_WIDTH = 8;
    this.MIN_ROOM_HEIGHT = 8;
    this.MAX_ROOM_TRYS = 20;

    this.width = width;
    this.height = height;
    this.rooms = [];
    this.hallways = [];
    this.doors = [];
    this.grid = [];
  
  }

  generate() {

    for (let y = 0; y < this.height; ++y) {

      const row = [];

      for (let x = 0; x < this.width; ++x) {

        row.push(1);

      }

      this.grid.push(row);

    }

    const r = {

      id: 'r_',
      w: this.width,
      h: this.height,
      x: 0,
      y: 0,
      childA: null,
      childB: null,
      parent: null,

    };

    this._buildAreas(r, 0);

    this._buildRooms(r, this.rooms);

    this._buildHallAndDoors(r, this.hallways, this.doors);

    this._drawRooms(this.grid, this.rooms);

    this._drawHallways(this.grid, this.hallways);

  }

  _buildAreas(room, i) {

    if (i > this.ITERATIONS) { return; }

    room.level = i;

    const divisor = _.random(1.9, 3.1, true);
    const newDims = {
      w1: room.w,
      w2: room.w,
      h1: room.h,
      h2: room.h,
      x1: room.x,
      x2: room.x,
      y1: room.y,
      y2: room.y,
    };
    let tryCount = 0;

    if (room.w >= room.h) {

      do {

        if (_.random(0, 1, false)) {
          newDims.w1 = Math.floor(room.w / divisor);
          newDims.w2 = room.w - newDims.w1;
        } else {
          newDims.w2 = Math.floor(room.w / divisor);
          newDims.w1 = room.w - newDims.w2;
        }

        newDims.x2 = room.x + newDims.w1;

      } while (++tryCount < this.MAX_ROOM_TRYS && ((newDims.w1 - this.SPACE_BETWEEN_ROOMS) < this.MIN_ROOM_WIDTH || (newDims.w2 - this.SPACE_BETWEEN_ROOMS) < this.MIN_ROOM_WIDTH));

    } else {

      do {

        if (_.random(0, 1, false)) {
          newDims.h1 = Math.floor(room.h / divisor);
          newDims.h2 = room.h - newDims.h1;
        } else {
          newDims.h2 = Math.floor(room.h / divisor);
          newDims.h1 = room.h - newDims.h2;
        }

        newDims.y2 = room.y + newDims.h1;

      } while (++tryCount < this.MAX_ROOM_TRYS && ((newDims.h1 - this.SPACE_BETWEEN_ROOMS) < this.MIN_ROOM_HEIGHT || (newDims.h2 - this.SPACE_BETWEEN_ROOMS) < this.MIN_ROOM_HEIGHT));

    }

    if (tryCount === this.MAX_ROOM_TRYS) {
      return;
    }

    room.childA = {

      id: room.id + 'A_',
      w: newDims.w1,
      h: newDims.h1,
      x: newDims.x1,
      y: newDims.y1,
      childA: null,
      childB: null,
      parent: room,

    };

    room.childB = {

      id: room.id + 'B_',
      w: newDims.w2,
      h: newDims.h2,
      x: newDims.x2,
      y: newDims.y2,
      childA: null,
      childB: null,
      parent: room,

    };

    let j = i + 1;

    this._buildAreas(room.childA, j);

    this._buildAreas(room.childB, j);

  }

  _buildRooms(room, rooms) {

    if (!room.childA && !room.childB) {

      room.adjX = (room.x + (this.SPACE_BETWEEN_ROOMS / 2));
      room.adjY = (room.y + (this.SPACE_BETWEEN_ROOMS / 2));
      room.adjW = (room.w - this.SPACE_BETWEEN_ROOMS);
      room.adjH = (room.h - this.SPACE_BETWEEN_ROOMS);

      rooms.push(new Rectangle(room.adjX, room.adjY, room.adjW, room.adjH));

    } else {

      this._buildRooms(room.childA, rooms);

      this._buildRooms(room.childB, rooms);

    }

  }
  
  _findRooms(room, possible, findVal, func) {

    if (!room.childA && !room.childB) {

      if (func(room) === findVal) {
        possible.push(room);
      }

    } else {

      this._findRooms(room.childA, possible, findVal, func);

      this._findRooms(room.childB, possible, findVal, func);

    }

  }

  _findVertRoomPairs(firstRoom, secondRoom, goodRoomPairs) {

    let diff = 999;
    let x, y, w, h;

    if (firstRoom.adjX <= secondRoom.adjX && firstRoom.adjX + firstRoom.adjW >= secondRoom.adjX + secondRoom.adjW) {

      x = Math.floor(secondRoom.adjX + (secondRoom.adjW / 2));
      y = firstRoom.adjY + firstRoom.adjH;
      w = 1;
      h = secondRoom.adjY - (firstRoom.adjY + firstRoom.adjH);

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           hall: new Rectangle(x, y, w, h),
                           doorToRoom1: new Vector(x, y),
                           doorToRoom2: new Vector(x + w - 1, y + h - 1)
                         });

    }

    if (secondRoom.adjX <= firstRoom.adjX && secondRoom.adjX + secondRoom.adjW >= firstRoom.adjX + firstRoom.adjW) {

      x = Math.floor(firstRoom.adjX + (firstRoom.adjW / 2));
      y = firstRoom.adjY + firstRoom.adjH;
      w = 1;
      h = secondRoom.adjY - (firstRoom.adjY + firstRoom.adjH);

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           hall: new Rectangle(x, y, w, h),
                           doorToRoom1: new Vector(x, y),
                           doorToRoom2: new Vector(x + w - 1, y + h - 1)
                         });

    }

    if (firstRoom.adjX < secondRoom.adjX && secondRoom.adjX < firstRoom.adjX + firstRoom.adjW) {

      diff = (firstRoom.adjX + firstRoom.adjW) - secondRoom.adjX;

      x = secondRoom.adjX + Math.ceil(diff / 2);
      y = firstRoom.adjY + firstRoom.adjH;
      w = 1;
      h = secondRoom.adjY - (firstRoom.adjY + firstRoom.adjH);

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           hall: new Rectangle(x, y, w, h),
                           doorToRoom1: new Vector(x, y),
                           doorToRoom2: new Vector(x + w - 1, y + h - 1)
                         });

    }

    if (firstRoom.adjX > secondRoom.adjX && firstRoom.adjX < secondRoom.adjX + secondRoom.adjW) {

      diff = (secondRoom.adjX + secondRoom.adjW) - firstRoom.adjX;

      x = firstRoom.adjX + Math.floor(diff / 2);
      y = firstRoom.adjY + firstRoom.adjH;
      w = 1;
      h = secondRoom.adjY - (firstRoom.adjY + firstRoom.adjH);

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           hall: new Rectangle(x, y, w, h),
                           doorToRoom1: new Vector(x, y),
                           doorToRoom2: new Vector(x + w - 1, y + h - 1)
                         });

    }

  }

  _findHorzRoomPairs(firstRoom, secondRoom, goodRoomPairs) {

    let diff = 999;
    let x, y, w, h;

    if (firstRoom.adjY <= secondRoom.adjY && firstRoom.adjY + firstRoom.adjH >= secondRoom.adjY + secondRoom.adjH) {

      x = firstRoom.adjX + firstRoom.adjW;
      y = Math.floor(secondRoom.adjY + (secondRoom.adjH / 2));
      w = (secondRoom.adjX - (firstRoom.adjX + firstRoom.adjW));
      h = 1;

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           hall: new Rectangle(x, y, w, h),
                           doorToRoom1: new Vector(x, y),
                           doorToRoom2: new Vector(x + w - 1, y + h - 1)
                         });

    }

    if (secondRoom.adjY <= firstRoom.adjY && secondRoom.adjY + secondRoom.adjH >= firstRoom.adjY + firstRoom.adjH) {

      x = firstRoom.adjX + firstRoom.adjW;
      y = Math.floor(firstRoom.adjY + (firstRoom.adjH / 2));
      w = (secondRoom.adjX - (firstRoom.adjX + firstRoom.adjW));
      h = 1;

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           hall: new Rectangle(x, y, w, h),
                           doorToRoom1: new Vector(x, y),
                           doorToRoom2: new Vector(x + w - 1, y + h - 1)
                         });

    }

    if (firstRoom.adjY < secondRoom.adjY && secondRoom.adjY < firstRoom.adjY + firstRoom.adjH) {

      diff = (firstRoom.adjY + firstRoom.adjH) - secondRoom.adjY;

      x = firstRoom.adjX + firstRoom.adjW;
      y = secondRoom.adjY + Math.ceil(diff / 2);
      w = (secondRoom.adjX - (firstRoom.adjX + firstRoom.adjW));
      h = 1;

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           hall: new Rectangle(x, y, w, h),
                           doorToRoom1: new Vector(x, y),
                           doorToRoom2: new Vector(x + w - 1, y + h - 1)
                         });

    }

    if (firstRoom.adjY > secondRoom.adjY && firstRoom.adjY < secondRoom.adjY + secondRoom.adjH) {

      diff = (secondRoom.adjY + secondRoom.adjH) - firstRoom.adjY;

      x = firstRoom.adjX + firstRoom.adjW;
      y = firstRoom.adjY + Math.floor(diff / 2);
      w = (secondRoom.adjX - (firstRoom.adjX + firstRoom.adjW));
      h = 1;

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           hall: new Rectangle(x, y, w, h),
                           doorToRoom1: new Vector(x, y),
                           doorToRoom2: new Vector(x + w - 1, y + h - 1)
                         });

    }

  }

  _buildHallAndDoors(room, halls, doors) {

    if (!room) { return; }

    if (!room.childA && !room.childB) { return; }

    let pairFunc;
    let f1, f2;
    let findVal1, findVal2;

    if (room.childA.x !== room.childB.x) {

      pairFunc = this._findHorzRoomPairs;

      f1 = function (r) { return r.x + r.w; };
      f2 = function (r) { return r.x; };

      findVal1 = room.childA.x + room.childA.w;
      findVal2 = room.childB.x;

    } else if (room.childA.y !== room.childB.y) {

      pairFunc = this._findVertRoomPairs;

      f1 = function (r) { return r.y + r.h; };
      f2 = function (r) { return r.y; };

      findVal1 = room.childA.y + room.childA.h;
      findVal2 = room.childB.y;

    } else {
      throw new Error('No adjacent rooms found.');
    }

    const possibleFirstRooms = [];
    const possibleSecondRooms = [];

    this._findRooms(room.childA, possibleFirstRooms, findVal1, f1);
    this._findRooms(room.childB, possibleSecondRooms, findVal2, f2);

    const goodRoomPairs = [];

    for (let i = 0; i < possibleFirstRooms.length; ++i) {

      const firstRoom = possibleFirstRooms[i];

      for (let j = 0; j < possibleSecondRooms.length; ++j) {

        const secondRoom = possibleSecondRooms[j];

        pairFunc(firstRoom, secondRoom, goodRoomPairs);

      }

    }

    if (goodRoomPairs.length === 0) {
      throw new Error('No room pairs found.');
    }

    const fulls = [];

    for (let i = 0; i < goodRoomPairs.length; ++i) {
      if (goodRoomPairs[i].diff === 999) {
        fulls.push(goodRoomPairs[i]);
      }
    }

    if (fulls.length === 0) {
      throw new Error('No good room joins found.');
    }

    const rand = _.random(0, fulls.length - 1, false);
    const goodRoomPair = fulls[rand];

    const hall = goodRoomPair.hall.clone();
    halls.push(hall);

    const room1Dims = goodRoomPair.room1;
    const door1 = new Door(
      goodRoomPair.doorToRoom1,
      new Rectangle(room1Dims.adjX, room1Dims.adjY, room1Dims.adjW, room1Dims.adjH),
      hall);
    doors.push(door1);

    const room2Dims = goodRoomPair.room2;
    const door2 = new Door(
      goodRoomPair.doorToRoom2,
      new Rectangle(room2Dims.adjX, room2Dims.adjY, room2Dims.adjW, room2Dims.adjH),
      hall);
    doors.push(door2);

    this._buildHallAndDoors(room.childA, halls, doors);

    this._buildHallAndDoors(room.childB, halls, doors);

  }

  _drawRooms(map, rooms) {

    for (let i = 0; i < rooms.length; ++i) {

      const room = rooms[i];

      for (let y = room.y; y < room.y + room.height; ++y) {

        for (let x = room.x; x < room.x + room.width; ++x) {

          map[y][x] = 0;

        }

      }

    }

  }

  _drawHallways(map, halls) {

    for (let i = 0; i < halls.length; ++i) {

      const hall = halls[i];

      for (let y = hall.y; y < hall.y + hall.height; ++y) {

        for (let x = hall.x; x < hall.x + hall.width; ++x) {

          map[y][x] = 0;

        }

      }

    }

  }

}

class Door {

  constructor(position, room, hall) {
    this.position = position;
    this.room = room;
    this.hall = hall;
  }

  clone() {
    return new Door(
      this.position.clone(),
      this.room.clone(),
      this.hall.clone());
  }

}
