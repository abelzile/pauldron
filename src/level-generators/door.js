export default class Door {

  constructor(position, room, hall, lock = null) {

    this.position = position;
    this.room = room;
    this.hall = hall;
    this.lock = lock;

  }

  clone() {
    return new Door(
      this.position.clone(),
      this.room.clone(),
      this.hall.clone(),
      (this.lock) ? this.lock.clone() : null
    );
  }

}