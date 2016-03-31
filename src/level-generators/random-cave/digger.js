import _ from 'lodash';
import * as Const from '../../const';


export default class Digger {

  constructor(ground, x = 0, y = 0) {

    this._ground = ground;
    this._x = x;
    this._y = y;
    this._isActive = true;

  }

  get x() { return this._x; }
  set x(value) { this._x = value; }

  get y() { return this._y; }
  set y(value) { this._y = value; }

  get isActive() { return this._isActive; }
  set isActive(value) { this._isActive = value; }

  dig() {
    this._ground.setAt(this._x, this._y, 0);
  }

  move(forceMove) {

    let mv = Const.Direction.None;
    const possibleMoves = [];

    if (!forceMove) {

      if (this._ground.canMove(Const.Direction.North, this._x, this._y)) {
        possibleMoves.push(Const.Direction.North);
      }

      if (this._ground.canMove(Const.Direction.South, this._x, this._y)) {
        possibleMoves.push(Const.Direction.South);
      }

      if (this._ground.canMove(Const.Direction.East, this._x, this._y)) {
        possibleMoves.push(Const.Direction.East);
      }

      if (this._ground.canMove(Const.Direction.West, this._x, this._y)) {
        possibleMoves.push(Const.Direction.West);
      }

      if (possibleMoves.length > 0) {
        mv = possibleMoves[_.random(0, possibleMoves.length - 1, false)];
      } else {
        this._isActive = false;
      }

    } else {

      if (this._ground.isInbounds(this._x, this._y - 1)) {
        possibleMoves.push(Const.Direction.North);
      }

      if (this._ground.isInbounds(this._x, this._y + 1)) {
        possibleMoves.push(Const.Direction.South);
      }

      if (this._ground.isInbounds(this._x - 1, this._y)) {
        possibleMoves.push(Const.Direction.West);
      }

      if (this._ground.isInbounds(this._x + 1, this._y)) {
        possibleMoves.push(Const.Direction.East);
      }

      mv = possibleMoves[_.random(0, possibleMoves.length, false)];

    }

    switch (mv) {

      case Const.Direction.North:
      {
        --this._y;
        break;
      }
      case Const.Direction.South:
      {
        ++this._y;
        break;
      }
      case Const.Direction.East:
      {
        ++this._x;
        break;
      }
      case Const.Direction.West:
      {
        --this._x;
        break;
      }

    }

  }

  spawnNew() {

    const child = new Digger(this._ground, this._x, this._y);
    child.move(false);

    return child;

  }

}
