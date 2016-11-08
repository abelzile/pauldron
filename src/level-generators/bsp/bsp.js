import Rectangle from '../../rectangle';


export default class Bsp {
  
  constructor(width = 200, height = 200) {

    this.ITERATIONS = 5;
    this.SPACE_BETWEEN_ROOMS = 10;
    this.MIN_ROOM_WIDTH = 8;
    this.MIN_ROOM_HEIGHT = 8;
    this.MAX_ROOM_TRYS = 20;

    this._width = width;
    this._height = height;
    this._rooms = [];
    this._halls = [];
    this._map = [];
  
  }

  get rooms() { return this._rooms; }

  get halls() { return this._halls; }

  get grid() { return this._map; }

  get width() { return this._width; }

  get height() { return this._height; }
  
  generate() {

    for (var y = 0; y < this._height; ++y) {

      var row = [];

      for (var x = 0; x < this._width; ++x) {

        row.push(1);

      }

      this._map.push(row);

    }

    var r = {

      id: 'r_',
      w: this._width,
      h: this._height,
      x: 0,
      y: 0,
      childA: null,
      childB: null,
      parent: null,

    };

    this._buildAreas(r, 0);

    this._buildRooms(r, this._rooms);

    this._buildHalls(r, this._halls);

    this._drawRooms(this._map, this._rooms);

    this._drawHalls(this._map, this._halls);

    /*for (var y = 0; y < HEIGHT; ++y) {

      for (var x = 0; x < WIDTH; ++x) {

        var el = document.createElement('span');

        const val = _map[y][x];
        el.innerHTML = val;

        if (val === 0) {
          el.className = 'room';
        }

        if (val === 1) {
          el.className = 'solid';
        }

        document.body.appendChild(el);

      }

      document.body.appendChild(document.createElement('br'));

    }*/

  }

  _buildAreas(room, i) {

    if (i > this.ITERATIONS) { return; }

    room.level = i;

    var divisor = _.random(1.9, 3.1, true);
    var tryCount = 0;

    var newDims = {
      w1: room.w,
      w2: room.w,
      h1: room.h,
      h2: room.h,
      x1: room.x,
      x2: room.x,
      y1: room.y,
      y2: room.y,
    };

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

    var j = i + 1;

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

    var diff = 999;

    if (firstRoom.adjX <= secondRoom.adjX && firstRoom.adjX + firstRoom.adjW >= secondRoom.adjX + secondRoom.adjW) {

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           l: Math.floor(secondRoom.adjX + (secondRoom.adjW / 2)),
                           t: firstRoom.adjY + firstRoom.adjH,
                           w: 1,
                           h: secondRoom.adjY - (firstRoom.adjY + firstRoom.adjH),
                         });

    }

    if (secondRoom.adjX <= firstRoom.adjX && secondRoom.adjX + secondRoom.adjW >= firstRoom.adjX + firstRoom.adjW) {

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           l: Math.floor(firstRoom.adjX + (firstRoom.adjW / 2)),
                           t: firstRoom.adjY + firstRoom.adjH,
                           w: 1,
                           h: secondRoom.adjY - (firstRoom.adjY + firstRoom.adjH),
                         });

    }

    if (firstRoom.adjX < secondRoom.adjX && secondRoom.adjX < firstRoom.adjX + firstRoom.adjW) {

      diff = (firstRoom.adjX + firstRoom.adjW) - secondRoom.adjX;

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           l: secondRoom.adjX + Math.ceil(diff / 2),
                           t: firstRoom.adjY + firstRoom.adjH,
                           w: 1,
                           h: secondRoom.adjY - (firstRoom.adjY + firstRoom.adjH),
                         });

    }

    if (firstRoom.adjX > secondRoom.adjX && firstRoom.adjX < secondRoom.adjX + secondRoom.adjW) {

      diff = (secondRoom.adjX + secondRoom.adjW) - firstRoom.adjX;

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           startX: firstRoom.adjX + Math.floor(diff / 2),
                           diff: diff,
                           l: firstRoom.adjX + Math.floor(diff / 2),
                           t: firstRoom.adjY + firstRoom.adjH,
                           w: 1,
                           h: secondRoom.adjY - (firstRoom.adjY + firstRoom.adjH),
                         });

    }

  }

  _findHorzRoomPairs(firstRoom, secondRoom, goodRoomPairs) {

    var diff = 999;

    if (firstRoom.adjY <= secondRoom.adjY && firstRoom.adjY + firstRoom.adjH >= secondRoom.adjY + secondRoom.adjH) {

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           l: firstRoom.adjX + firstRoom.adjW,
                           t: Math.floor(secondRoom.adjY + (secondRoom.adjH / 2)),
                           w: (secondRoom.adjX - (firstRoom.adjX + firstRoom.adjW)),
                           h: 1,
                         });

    }

    if (secondRoom.adjY <= firstRoom.adjY && secondRoom.adjY + secondRoom.adjH >= firstRoom.adjY + firstRoom.adjH) {

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           l: firstRoom.adjX + firstRoom.adjW,
                           t: Math.floor(firstRoom.adjY + (firstRoom.adjH / 2)),
                           w: (secondRoom.adjX - (firstRoom.adjX + firstRoom.adjW)),
                           h: 1,
                         });

    }

    if (firstRoom.adjY < secondRoom.adjY && secondRoom.adjY < firstRoom.adjY + firstRoom.adjH) {

      diff = (firstRoom.adjY + firstRoom.adjH) - secondRoom.adjY;

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           l: firstRoom.adjX + firstRoom.adjW,
                           t: secondRoom.adjY + Math.ceil(diff / 2),
                           w: (secondRoom.adjX - (firstRoom.adjX + firstRoom.adjW)),
                           h: 1,
                         });

    }

    if (firstRoom.adjY > secondRoom.adjY && firstRoom.adjY < secondRoom.adjY + secondRoom.adjH) {

      diff = (secondRoom.adjY + secondRoom.adjH) - firstRoom.adjY;

      goodRoomPairs.push({
                           room1: firstRoom,
                           room2: secondRoom,
                           diff: diff,
                           l: firstRoom.adjX + firstRoom.adjW,
                           t: firstRoom.adjY + Math.floor(diff / 2),
                           w: (secondRoom.adjX - (firstRoom.adjX + firstRoom.adjW)),
                           h: 1,
                         });

    }

  }

  _buildHalls(room, halls/*, el*/) {

    if (!room) { return; }

    if (!room.childA && !room.childB) { return; }

    var possibleFirstRooms = [];
    var possibleSecondRooms = [];
    var pairFunc;
    var firstRoom, secondRoom;
    var f1, f2;
    var findVal1, findVal2;

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

    this._findRooms(room.childA, possibleFirstRooms, findVal1, f1);
    this._findRooms(room.childB, possibleSecondRooms, findVal2, f2);

    var goodRoomPairs = [];

    for (var i = 0; i < possibleFirstRooms.length; ++i) {

      firstRoom = possibleFirstRooms[i];

      for (var j = 0; j < possibleSecondRooms.length; ++j) {

        secondRoom = possibleSecondRooms[j];

        pairFunc(firstRoom, secondRoom, goodRoomPairs);

      }

    }

    if (goodRoomPairs.length === 0) {
      throw new Error('No room pairs found.');
    }

    var fulls = [];

    for (var i = 0; i < goodRoomPairs.length; ++i) {
      if (goodRoomPairs[i].diff === 999) {
        fulls.push(goodRoomPairs[i]);
      }
    }

    if (fulls.length === 0) {
      throw new Error('No good room joins found.');
    }

    var rand = _.random(0, fulls.length - 1, false);
    var goodRoomPair = fulls[rand];

    halls.push(new Rectangle(goodRoomPair.l, goodRoomPair.t, goodRoomPair.w, goodRoomPair.h));

    this._buildHalls(room.childA, halls);

    this._buildHalls(room.childB, halls);

  }

  _drawRooms(map, rooms) {

    for (var i = 0; i < rooms.length; ++i) {

      var room = rooms[i];

      for (var y = room.y; y < room.y + room.height; ++y) {

        for (var x = room.x; x < room.x + room.width; ++x) {

          map[y][x] = 0;

        }

      }

    }

  }

  _drawHalls(map, halls) {

    for (var i = 0; i < halls.length; ++i) {

      var room = halls[i];

      for (var y = room.y; y < room.y + room.height; ++y) {

        for (var x = room.x; x < room.x + room.width; ++x) {

          map[y][x] = 0;

        }

      }

    }

  }

}
