export default class LevelGenerator {

  constructor() {
  }

  drawRooms(map, rooms) {

    for (let i = 0; i < rooms.length; ++i) {

      const room = rooms[i];

      for (let y = room.y; y < room.y + room.height; ++y) {
        for (let x = room.x; x < room.x + room.width; ++x) {
          map[y][x] = 0;
        }
      }

    }

  }

  drawHalls(map, halls) {

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