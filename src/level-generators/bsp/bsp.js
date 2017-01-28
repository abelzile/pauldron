import * as _ from 'lodash';
import BossDoorLock from '../boss-door-lock';
import Door from '../door';
import ExitDoorLock from '../exit-door-lock';
import Hall from '../hall';
import Rectangle from '../../rectangle';
import Room from '../room';
import Vector from '../../vector';

export default class Bsp {

  constructor(width = 200, height = 200, generateBossRoom = true, generateExitRoom = true) {

    this.Iterations = 5;
    this.SpaceBetweenRooms = 10;
    this.MinRoomWidth = 8;
    this.MinRoomHeight = 8;
    this.MaxRoomTrys = 20;
    this.Corner = {
      TopRight: 0,
      BottomRight: 1,
      BottomLeft: 2,
      TopLeft: 3
    };

    this.width = width;
    this.height = height;
    this.generateBossRoom = generateBossRoom;
    this.generateExitRoom = generateExitRoom;
    this.rooms = [];
    this.halls = [];
    this.doors = [];
    this.grid = [];
    this.startRoom = null;
    this.bossRoom = null;
    this.exitRoom = null;
    this.toExitDoor = null;
    this.toBossDoor = null;

  }

  generate() {

    const area = {
      id: 'r_',
      rect: new Rectangle(0, 0, this.width, this.height),
      room: null,
      childAreaA: null,
      childAreaB: null,
      parentArea: null,
    };

    this._buildAreas(area, 0);
    this._buildRooms(area, this.rooms);
    this._buildHallAndDoors(area, this.halls, this.doors);

    const topRightRoom = this._getCornerRoom(this.Corner.TopRight);
    const bottomRightRoom = this._getCornerRoom(this.Corner.BottomRight);
    const bottomLeftRoom = this._getCornerRoom(this.Corner.BottomLeft);
    const topLeftRoom = this._getCornerRoom(this.Corner.TopLeft);

    this.startRoom = topRightRoom; //DEBUG //bottomLeftRoom;

    const bossRoomSize = 20;

    const bossRoom = new Room(
      this.width - bossRoomSize - (this.SpaceBetweenRooms / 2),
      0 - (this.SpaceBetweenRooms / 2) - bossRoomSize,
      bossRoomSize,
      bossRoomSize
    );

    let bossHall = null;

    if (bossRoom.width > topRightRoom.width) {

      bossHall = new Hall(
        topRightRoom.x + Math.floor(topRightRoom.width / 2),
        bossRoom.y + bossRoom.height,
        1,
        this.SpaceBetweenRooms
      );

    } else {

      bossHall = new Hall(
        bossRoom.x + Math.floor(bossRoom.width / 2),
        bossRoom.y + bossRoom.height,
        1,
        this.SpaceBetweenRooms
      );

    }

    const exitRoom = new Room(
      bossRoom.x,
      bossRoom.y - this.SpaceBetweenRooms - bossRoomSize,
      bossRoomSize,
      bossRoomSize);

    const exitHall = new Hall(
      bossRoom.x + Math.floor(bossRoom.width / 2),
      bossRoom.y - this.SpaceBetweenRooms,
      1,
      this.SpaceBetweenRooms
    );

    const exitDoor1 = new Door(new Vector(exitHall.x, exitHall.y), exitRoom, exitHall);
    const exitDoor2 = new Door(new Vector(exitHall.x, exitHall.y + exitHall.height - 1), bossRoom, exitHall);

    this.toExitDoor = exitDoor2;

    const bossDoor1 = new Door(new Vector(bossHall.x, bossHall.y), bossRoom, bossHall);
    const bossDoor2 = new Door(new Vector(bossHall.x, bossHall.y + bossHall.height - 1), topRightRoom, bossHall);

    this.toBossDoor = bossDoor2;

    if (this.generateBossRoom && this.generateExitRoom) {

      this.rooms.push(bossRoom);
      this.halls.push(bossHall);
      this.doors.push(bossDoor1);
      this.doors.push(bossDoor2);

      this.bossRoom = bossRoom;

      this.rooms.push(exitRoom);
      this.halls.push(exitHall);
      this.doors.push(exitDoor1);
      this.doors.push(exitDoor2);

      this.exitRoom = exitRoom;

    } else {

      if (this.generateBossRoom) {

        this.rooms.push(bossRoom);
        this.halls.push(bossHall);
        this.doors.push(bossDoor1);
        this.doors.push(bossDoor2);

        this.bossRoom = bossRoom;

      } else if (this.generateExitRoom) {

        this.rooms.push(bossRoom);
        this.halls.push(bossHall);
        this.doors.push(bossDoor1);
        this.doors.push(bossDoor2);

        this.exitRoom = bossRoom;

      }

    }

    if (this.generateBossRoom) {
      this.toExitDoor.lock = new ExitDoorLock();
      this.toBossDoor.lock = new BossDoorLock();
    }

    let yAdjust = 0;
    let xAdjust = 0;

    for (let i = 0; i < this.rooms.length; ++i) {

      const room = this.rooms[i];

      if (room.y < yAdjust) {
        yAdjust = room.y;
      }

      if (room.x < xAdjust) {
        xAdjust = room.x;
      }

    }

    yAdjust *= -1;
    if (yAdjust > 0) {
      yAdjust += this.SpaceBetweenRooms / 2;
    }
    xAdjust *= -1;
    if (xAdjust > 0) {
      xAdjust += this.SpaceBetweenRooms / 2;
    }

    for (let i = 0; i < this.rooms.length; ++i) {
      const room = this.rooms[i];
      room.x += xAdjust;
      room.y += yAdjust;
    }

    for (let i = 0; i < this.halls.length; ++i) {
      const hall = this.halls[i];
      hall.x += xAdjust;
      hall.y += yAdjust;
    }

    for (let i = 0; i < this.doors.length; ++i) {
      const door = this.doors[i];
      door.position.x += xAdjust;
      door.position.y += yAdjust;
    }

    this.width += xAdjust;
    this.height += yAdjust;

    for (let y = 0; y < this.height; ++y) {

      const row = [];

      for (let x = 0; x < this.width; ++x) {
        row.push(1);
      }

      this.grid.push(row);

    }

    this._drawRooms(this.grid, this.rooms);
    this._drawHalls(this.grid, this.halls);

    this.__debug();

  }

  _getCornerRoom(corner) {

    const targetV = new Vector();
    const possibleV = new Vector();
    let distance = Number.MAX_SAFE_INTEGER;
    let targetRoom = null;

    switch (corner) {

      case this.Corner.BottomRight: {

        targetV.set(this.width, this.height);

        for (let i = 0; i < this.rooms.length; ++i) {

          const room = this.rooms[i];
          possibleV.set(room.x + room.width, room.y + room.height);
          const dist = Vector.distanceSquared(targetV, possibleV);

          if (dist < distance) {
            distance = dist;
            targetRoom = room;
          }

        }

        break;

      }
      case this.Corner.TopLeft: {

        targetV.set(0, 0);

        for (let i = 0; i < this.rooms.length; ++i) {

          const room = this.rooms[i];
          possibleV.set(room.x, room.y);
          const dist = Vector.distanceSquared(targetV, possibleV);

          if (dist < distance) {
            distance = dist;
            targetRoom = room;
          }

        }

        break;

      }
      case this.Corner.BottomLeft: {

        targetV.set(0, this.height);

        for (let i = 0; i < this.rooms.length; ++i) {

          const room = this.rooms[i];
          possibleV.set(room.x, room.y + room.height);
          const dist = Vector.distanceSquared(targetV, possibleV);

          if (dist < distance) {
            distance = dist;
            targetRoom = room;
          }

        }

        break;

      }
      case this.Corner.TopRight: {

        targetV.set(this.width, 0);

        for (let i = 0; i < this.rooms.length; ++i) {

          const room = this.rooms[i];
          possibleV.set(room.x + room.width, room.y);
          const dist = Vector.distanceSquared(targetV, possibleV);

          if (dist < distance) {
            distance = dist;
            targetRoom = room;
          }

        }

        break;

      }

    }

    if (!targetRoom) {
      throw new Error('Corner room not found.');
    }

    return targetRoom;

  }

  _buildAreas(area, i) {

    if (i > this.Iterations) { return; }

    const divisor = _.random(1.9, 3.1, true);
    let newX1 = area.rect.x;
    let newY1 = area.rect.y;
    let newW1 = area.rect.width;
    let newH1 = area.rect.height;
    let newX2 = area.rect.x;
    let newY2 = area.rect.y;
    let newW2 = area.rect.width;
    let newH2 = area.rect.height;
    let tryCount = 0;

    if (area.rect.width >= area.rect.height) {

      do {

        if (_.random(0, 1, false)) {
          newW1 = Math.floor(area.rect.width / divisor);
          newW2 = area.rect.width - newW1;
        } else {
          newW2 = Math.floor(area.rect.width / divisor);
          newW1 = area.rect.width - newW2;
        }

        newX2 = area.rect.x + newW1;

      } while (++tryCount < this.MaxRoomTrys &&
      ((newW1 - this.SpaceBetweenRooms) < this.MinRoomWidth ||
      (newW2 - this.SpaceBetweenRooms) < this.MinRoomWidth));

    } else {

      do {

        if (_.random(0, 1, false)) {
          newH1 = Math.floor(area.rect.height / divisor);
          newH2 = area.rect.height - newH1;
        } else {
          newH2 = Math.floor(area.rect.height / divisor);
          newH1 = area.rect.height - newH2;
        }

        newY2 = area.rect.y + newH1;

      } while (++tryCount < this.MaxRoomTrys &&
      ((newH1 - this.SpaceBetweenRooms) < this.MinRoomHeight ||
      (newH2 - this.SpaceBetweenRooms) < this.MinRoomHeight));

    }

    if (tryCount === this.MaxRoomTrys) {
      return;
    }

    area.childAreaA = {
      id: area.id + 'A_',
      rect: new Rectangle(newX1, newY1, newW1, newH1),
      room: null,
      childAreaA: null,
      childAreaB: null,
      parentArea: area,
    };

    area.childAreaB = {
      id: area.id + 'B_',
      rect: new Rectangle(newX2, newY2, newW2, newH2),
      room: null,
      childAreaA: null,
      childAreaB: null,
      parentArea: area,
    };

    let j = i + 1;

    this._buildAreas(area.childAreaA, j);
    this._buildAreas(area.childAreaB, j);

  }

  _buildRooms(area, rooms) {

    if (!area.childAreaA && !area.childAreaB) {

      area.room = new Room(
        area.rect.x + this.SpaceBetweenRooms / 2,
        area.rect.y + this.SpaceBetweenRooms / 2,
        area.rect.width - this.SpaceBetweenRooms,
        area.rect.height - this.SpaceBetweenRooms
      );

      rooms.push(area.room);

    } else {

      this._buildRooms(area.childAreaA, rooms);
      this._buildRooms(area.childAreaB, rooms);

    }

  }

  _findRooms(area, possible, findVal, func) {

    if (!area.childAreaA && !area.childAreaB) {

      if (func(area.rect) === findVal) {
        possible.push(area);
      }

    } else {

      this._findRooms(area.childAreaA, possible, findVal, func);
      this._findRooms(area.childAreaB, possible, findVal, func);

    }

  }

  _findVertRoomPairs(firstRoom, secondRoom, goodRoomPairs) {

    let diff = 999;
    let x, y, w, h;

    if (
      firstRoom.room.x <= secondRoom.room.x &&
      firstRoom.room.x + firstRoom.room.width >= secondRoom.room.x + secondRoom.room.width
    ) {

      x = Math.floor(secondRoom.room.x + (secondRoom.room.width / 2));
      y = firstRoom.room.y + firstRoom.room.height;
      w = 1;
      h = secondRoom.room.y - (firstRoom.room.y + firstRoom.room.height);

      goodRoomPairs.push(
        {
          room1: firstRoom,
          room2: secondRoom,
          diff: diff,
          hall: new Hall(x, y, w, h),
          doorToRoom1: new Vector(x, y),
          doorToRoom2: new Vector(x + w - 1, y + h - 1)
        }
      );

    }

    if (
      secondRoom.room.x <= firstRoom.room.x &&
      secondRoom.room.x + secondRoom.room.width >= firstRoom.room.x + firstRoom.room.width
    ) {

      x = Math.floor(firstRoom.room.x + (firstRoom.room.width / 2));
      y = firstRoom.room.y + firstRoom.room.height;
      w = 1;
      h = secondRoom.room.y - (firstRoom.room.y + firstRoom.room.height);

      goodRoomPairs.push(
        {
          room1: firstRoom,
          room2: secondRoom,
          diff: diff,
          hall: new Hall(x, y, w, h),
          doorToRoom1: new Vector(x, y),
          doorToRoom2: new Vector(x + w - 1, y + h - 1)
        }
      );

    }

    if (
      firstRoom.room.x < secondRoom.room.x &&
      secondRoom.room.x < firstRoom.room.x + firstRoom.room.width
    ) {

      diff = (firstRoom.room.x + firstRoom.room.width) - secondRoom.room.x;

      x = secondRoom.room.x + Math.ceil(diff / 2);
      y = firstRoom.room.y + firstRoom.room.height;
      w = 1;
      h = secondRoom.room.y - (firstRoom.room.y + firstRoom.room.height);

      goodRoomPairs.push(
        {
          room1: firstRoom,
          room2: secondRoom,
          diff: diff,
          hall: new Hall(x, y, w, h),
          doorToRoom1: new Vector(x, y),
          doorToRoom2: new Vector(x + w - 1, y + h - 1)
        }
      );

    }

    if (
      firstRoom.room.x > secondRoom.room.x &&
      firstRoom.room.x < secondRoom.room.x + secondRoom.room.width
    ) {

      diff = (secondRoom.room.x + secondRoom.room.width) - firstRoom.room.x;

      x = firstRoom.room.x + Math.floor(diff / 2);
      y = firstRoom.room.y + firstRoom.room.height;
      w = 1;
      h = secondRoom.room.y - (firstRoom.room.y + firstRoom.room.height);

      goodRoomPairs.push(
        {
          room1: firstRoom,
          room2: secondRoom,
          diff: diff,
          hall: new Hall(x, y, w, h),
          doorToRoom1: new Vector(x, y),
          doorToRoom2: new Vector(x + w - 1, y + h - 1)
        }
      );

    }

  }

  _findHorzRoomPairs(firstArea, secondArea, goodAreaPairs) {

    let diff = 999;
    let x, y, w, h;

    if (
      firstArea.room.y <= secondArea.room.y &&
      firstArea.room.y + firstArea.room.height >= secondArea.room.y + secondArea.room.height
    ) {

      x = firstArea.room.x + firstArea.room.width;
      y = Math.floor(secondArea.room.y + (secondArea.room.height / 2));
      w = secondArea.room.x - (firstArea.room.x + firstArea.room.width);
      h = 1;

      goodAreaPairs.push(
        {
          room1: firstArea,
          room2: secondArea,
          diff: diff,
          hall: new Hall(x, y, w, h),
          doorToRoom1: new Vector(x, y),
          doorToRoom2: new Vector(x + w - 1, y + h - 1)
        }
      );

    }

    if (
      secondArea.room.y <= firstArea.room.y &&
      secondArea.room.y + secondArea.room.height >= firstArea.room.y + firstArea.room.height
    ) {

      x = firstArea.room.x + firstArea.room.width;
      y = Math.floor(firstArea.room.y + (firstArea.room.height / 2));
      w = secondArea.room.x - (firstArea.room.x + firstArea.room.width);
      h = 1;

      goodAreaPairs.push(
        {
          room1: firstArea,
          room2: secondArea,
          diff: diff,
          hall: new Hall(x, y, w, h),
          doorToRoom1: new Vector(x, y),
          doorToRoom2: new Vector(x + w - 1, y + h - 1)
        }
      );

    }

    if (
      firstArea.room.y < secondArea.room.y &&
      secondArea.room.y < firstArea.room.y + firstArea.room.height
    ) {

      diff = (firstArea.room.y + firstArea.room.height) - secondArea.room.y;

      x = firstArea.room.x + firstArea.room.width;
      y = secondArea.room.y + Math.ceil(diff / 2);
      w = secondArea.room.x - (firstArea.room.x + firstArea.room.width);
      h = 1;

      goodAreaPairs.push(
        {
          room1: firstArea,
          room2: secondArea,
          diff: diff,
          hall: new Hall(x, y, w, h),
          doorToRoom1: new Vector(x, y),
          doorToRoom2: new Vector(x + w - 1, y + h - 1)
        }
      );

    }

    if (
      firstArea.room.y > secondArea.room.y &&
      firstArea.room.y < secondArea.room.y + secondArea.room.height
    ) {

      diff = (secondArea.room.y + secondArea.room.height) - firstArea.room.y;

      x = firstArea.room.x + firstArea.room.width;
      y = firstArea.room.y + Math.floor(diff / 2);
      w = secondArea.room.x - (firstArea.room.x + firstArea.room.width);
      h = 1;

      goodAreaPairs.push(
        {
          room1: firstArea,
          room2: secondArea,
          diff: diff,
          hall: new Hall(x, y, w, h),
          doorToRoom1: new Vector(x, y),
          doorToRoom2: new Vector(x + w - 1, y + h - 1)
        }
      );

    }

  }

  _buildHallAndDoors(area, halls, doors) {

    if (!area) { return; }

    if (!area.childAreaA && !area.childAreaB) { return; }

    let pairFunc;
    let f1, f2;
    let findVal1, findVal2;

    if (area.childAreaA.rect.x !== area.childAreaB.rect.x) {

      pairFunc = this._findHorzRoomPairs;

      f1 = function (r) { return r.x + r.width; };
      f2 = function (r) { return r.x; };

      findVal1 = area.childAreaA.rect.x + area.childAreaA.rect.width;
      findVal2 = area.childAreaB.rect.x;

    } else if (area.childAreaA.rect.y !== area.childAreaB.rect.y) {

      pairFunc = this._findVertRoomPairs;

      f1 = function (r) { return r.y + r.height; };
      f2 = function (r) { return r.y; };

      findVal1 = area.childAreaA.rect.y + area.childAreaA.rect.height;
      findVal2 = area.childAreaB.rect.y;

    } else {
      throw new Error('No adjacent rooms found.');
    }

    const possibleFirstRooms = [];
    const possibleSecondRooms = [];

    this._findRooms(area.childAreaA, possibleFirstRooms, findVal1, f1);
    this._findRooms(area.childAreaB, possibleSecondRooms, findVal2, f2);

    const goodRoomPairs = [];

    for (let i = 0; i < possibleFirstRooms.length; ++i) {

      const firstRoom = possibleFirstRooms[i];

      for (let j = 0; j < possibleSecondRooms.length; ++j) {

        const secondRoom = possibleSecondRooms[j];

        pairFunc(firstRoom, secondRoom, goodRoomPairs);

      }

    }

    if (goodRoomPairs.length === 0) {
      throw new Error('No area pairs found.');
    }

    const fulls = [];

    for (let i = 0; i < goodRoomPairs.length; ++i) {
      if (goodRoomPairs[i].diff === 999) {
        fulls.push(goodRoomPairs[i]);
      }
    }

    if (fulls.length === 0) {
      throw new Error('No good area joins found.');
    }

    const rand = _.random(0, fulls.length - 1, false);
    const goodRoomPair = fulls[rand];

    const hall = goodRoomPair.hall;
    halls.push(hall);

    const door1 = new Door(
      goodRoomPair.doorToRoom1,
      goodRoomPair.room1.room,
      hall
    );
    doors.push(door1);

    const door2 = new Door(
      goodRoomPair.doorToRoom2,
      goodRoomPair.room2.room,
      hall
    );
    doors.push(door2);

    this._buildHallAndDoors(area.childAreaA, halls, doors);
    this._buildHallAndDoors(area.childAreaB, halls, doors);

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

  _drawHalls(map, halls) {

    for (let i = 0; i < halls.length; ++i) {

      const hall = halls[i];

      for (let y = hall.y; y < hall.y + hall.height; ++y) {
        for (let x = hall.x; x < hall.x + hall.width; ++x) {
          map[y][x] = 0;
        }
      }

    }

  }

  __debug() {

    const elem = document.createElement('div');
    elem.style.fontSize = '3px';

    let str = '';
    for (let y = 0; y < this.grid.length; ++y) {
      for (let x = 0; x < this.grid[0].length; ++x) {
        str += this.grid[y][x];
      }
      const txt = document.createTextNode(str);
      elem.appendChild(txt);
      const br = document.createElement('br');
      elem.appendChild(br);
      str = '';
    }

    document.body.appendChild(elem);

  }

}
