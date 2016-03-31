import _ from 'lodash';
import * as ArrayUtils from '../../utils/array-utils';
import * as Const from '../../const';


export default class Ground {

  constructor(caveSize) {

    this._caveSize = caveSize;
    this._dirt = ArrayUtils.create2d(caveSize, caveSize, 1);
    this._badPatterns = [];
    this._badPatterns.push(
      [
        [ 0, 0, 0 ],
        [ 0, 1, 0 ],
        [ 0, 0, 0 ]
      ]);
    this._badPatterns.push(
      [
        [ 0, 0, 0 ],
        [ 0, 1, 0 ],
        [ 0, 1, 0 ],
        [ 0, 0, 0 ]
      ]);
    this._badPatterns.push(
      [
        [ 0, 0, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 0, 0 ]
      ]);
    this._badPatterns.push(
      [
        [ 0, 0, 0, 0 ],
        [ 0, 1, 0, 0 ],
        [ 0, 0, 1, 0 ],
        [ 0, 0, 0, 0 ]
      ]);
    this._badPatterns.push(
      [
        [ 0, 0, 0, 0 ],
        [ 0, 0, 1, 0 ],
        [ 0, 1, 0, 0 ],
        [ 0, 0, 0, 0 ]
      ]);
    this._badPatterns.push(
      [
        [ 0, 0, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 1, 0, 0 ],
        [ 0, 0, 0, 0 ]
      ]);
    this._badPatterns.push(
      [
        [ 0, 0, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 1, 0 ],
        [ 0, 0, 0, 0 ]
      ]);
    this._badPatterns.push(
      [
        [ 0, 0, 0, 0 ],
        [ 0, 0, 1, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 0, 0 ]
      ]);
    this._badPatterns.push(
      [
        [ 0, 0, 0, 0 ],
        [ 0, 1, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 0, 0 ]
      ]);
    this._badPatterns.push(
      [
        [ 0, 0, 0, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 1, 1, 0 ],
        [ 0, 0, 0, 0 ]
      ]);
    this._badPatterns.push(
      [
        [ 0, 0, 0 ],
        [ 0, 1, 0 ],
        [ 0, 1, 0 ],
        [ 0, 1, 0 ],
        [ 0, 0, 0 ]
      ]);
    this._badPatterns.push(
      [
        [ 0, 0, 0, 0, 0 ],
        [ 0, 1, 1, 1, 0 ],
        [ 0, 0, 0, 0, 0 ]
      ]);

  }

  get caveSize() { return this._caveSize; }

  get dirt() { return this._dirt; }

  getAt(x, y) { return this._dirt[y][x]; }
  setAt(x, y, value) { this._dirt[y][x] = value; }

  canMove(dir, x, y) {

    switch (dir) {
      case Const.Direction.North:
        return this.isInbounds(x, y - 1) && this._dirt[y - 1][x] !== 0;
      case Const.Direction.South:
        return this.isInbounds(x, y + 1) && this._dirt[y + 1][x] !== 0;
      case Const.Direction.East:
        return this.isInbounds(x + 1, y) && this._dirt[y][x + 1] !== 0;
      case Const.Direction.West:
        return this.isInbounds(x - 1, y) && this._dirt[y][x - 1] !== 0;
      default:
        return false;
    }

  }

  isInbounds(x, y) {

    if (x < 0) return false;

    if (y < 0) return false;

    if (x > this._dirt[0].length - 1) return false;

    if (y > this._dirt.length - 1) return false;

    return true;

  }

  clearBadPatterns() {

    for (const pattern of this._badPatterns) {

      for (let y = 0; y < this._dirt.length; ++y) {

        const row = this._dirt[y];

        for (let x = 0; x < row.length; ++x) {

          let match = true;

          for (let yy = 0; yy < pattern.length && match; ++yy) {

            const patternRow = pattern[yy];

            for (let xx = 0; xx < patternRow.length && match; ++xx) {

              const searchX = x + xx;
              const searchY = y + yy;

              if (this.isInbounds(searchX, searchY) && this._dirt[searchY][searchX] !== pattern[yy][xx]) {
                match = false;
                break;
              }

            }

          }

          if (match) {
            this._clearPattern(pattern, x, y);
          }

        }

      }

    }

  }

  _clearPattern(pattern, startX, startY) {

    for (let y = 0; y < pattern.length; ++y) {

      const row = pattern[y];

      for (let x = 0; x < row.length; ++x) {

        const searchX = startX + x;
        const searchY = startY + y;

        if (this.isInbounds(searchX, searchY)) {
          this._dirt[searchY][searchX] = 0;
        }

      }

    }

  }

}
