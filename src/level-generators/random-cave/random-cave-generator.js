import _ from 'lodash';
import Generator from './generator';
import Point from '../../point';


export default class RandomCaveGenerator {

  constructor({
      caveSize: caveSize = 200,
      maxDiggerCount: maxDiggerCount = 900,
      diggerSpawnChance: diggerSpawnChance = .08
    } = {}) {

    this._caveSize = caveSize;
    this._maxDiggerCount = maxDiggerCount;
    this._diggerSpawnChance = diggerSpawnChance;

    this._grid = undefined;
    this._entrancePos = undefined;

  }

  get grid() { return this._grid; }

  get entrancePos() { return this._entrancePos; }

  generate() {

    this._generateCave();
    this._trimBorders();
    this._addBorder();
    this._generateEntrance();

  }

  _generateCave() {

    const generator = new Generator();

    let cave = undefined;
    let success = false;

    while (!success) {

      cave = generator.generate(this._caveSize, this._maxDiggerCount, this._diggerSpawnChance);

      success = !_.some(cave[0], (tile) => tile === 0);

      if (!success) { continue; }

      success = !_.some(cave[cave.length - 1], (tile) => tile === 0);

      if (!success) { continue; }

      for (var yy = 0; yy < cave.length; ++yy) {

        var row = cave[yy];

        if (row[0] === 0) {
          success = false;
          break;
        }

        if (row[row.length - 1] === 0) {
          success = false;
          break;
        }

      }

    }

    this._grid = cave;

  }

  _trimBorders() {

    let keepTrimming = true;

    while (keepTrimming) {

      keepTrimming = _.every(_.first(this._grid), tile => tile === 1);

      if (keepTrimming) {
        this._grid.shift();
      }

    }

    keepTrimming = true;

    while (keepTrimming) {

      keepTrimming = _.every(_.last(this._grid), tile => tile === 1);

      if (keepTrimming) {
        this._grid.pop();
      }

    }

    keepTrimming = true;

    while (keepTrimming) {

      for (let y = 0; y < this._grid.length; ++y) {

        if (this._grid[y][0] === 0) {
          keepTrimming = false;
          break;
        }

      }

      if (keepTrimming) {
        for (let y = 0; y < this._grid.length; ++y) {
          this._grid[y].shift();
        }
      }

    }

    keepTrimming = true;

    while (keepTrimming) {

      for (let y = this._grid.length; y-- > 0; ) {

        const row = this._grid[y];

        if (row[row.length - 1] === 0) {
          keepTrimming = false;
          break;
        }

      }

      if (keepTrimming) {
        for (let y = 0; y < this._grid.length; ++y) {
          this._grid[y].pop();
        }
      }

    }

  }

  _addBorder() {

    for (let i = 0; i < this._grid.length; ++i) {
      this._grid[i].push(1);
      this._grid[i].unshift(1);
    }

    var padRow = [];
    for (let i = 0; i < this._grid[0].length; ++i) {
      padRow.push(1);
    }

    this._grid.unshift(padRow);
    this._grid.push(padRow);

  }

  _generateEntrance() {

    const potentialEntrance = [
      [ 0, 0, 0 ],
      [ 0, 0, 0 ],
      [ 0, 0, 0 ]
    ];

    let entranceFound = false;
    let searchX;
    let searchY;

    //TODO: randomly search from top down or bottom up.

    for (let y = 0; y < this._grid.length && !entranceFound; ++y) {

      const gridRow = this._grid[y];

      for (let x = 0; x < gridRow.length && !entranceFound; ++x) {

        let match = true;

        for (let yy = 0; yy < potentialEntrance.length && match; ++yy) {

          const potentialRow = potentialEntrance[yy];

          for (let xx = 0; xx < potentialRow.length && match; ++xx) {

            searchX = x + xx;
            searchY = y + yy;

            if (this._isInbounds(searchX, searchY) && this._grid[searchY][searchX] !== potentialEntrance[yy][xx]) {
              match = false;
              break;
            }

          }

        }

        if (match) {
          entranceFound = true;
        }

      }

    }

    this._entrancePos = new Point(searchX - 1, searchY - 1);

  }

  _isInbounds(x, y) {

    if (x < 0) return false;

    if (y < 0) return false;

    if (x > this._grid[0].length - 1) return false;

    if (y > this._grid.length - 1) return false;

    return true;

  }

}
