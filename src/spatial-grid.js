import * as ArrayUtils from './utils/array-utils';
import _ from 'lodash';


export default class SpatialGrid {

  constructor(width = 1, height = 1, cellSize = 1) {

    this._width = width;
    this._height = height;
    this._cellSize = cellSize;
    this._entities = [];

    const maxY = Math.ceil(this._height / this._cellSize);
    const maxX = Math.ceil(this._width / this._cellSize);
    this._grid = [];

    for (let yy = 0; yy < maxY; ++yy) {

      const row = [];

      for (let xx = 0; xx < maxX; ++xx) {
        row[xx] = [];
      }

      this._grid[yy] = row;

    }

  }

  add(entity) {
    this._entities.push(entity);
  }

  remove(entity) {
    ArrayUtils.remove(this._entities, entity);
  }

  update() {

    const maxY = this._grid.length;
    const maxX = this._grid[0].length;

    for (let yy = 0; yy < maxY; ++yy) {
      for (let xx = 0; xx < maxX; ++xx) {
        ArrayUtils.clear(this._grid[yy][xx]);
      }
    }

    for (let i = 0; i < this._entities.length; ++i) {

      const entity = this._entities[i];
      const positionComp = entity.get('PositionComponent');
      const x = Math.floor(positionComp.position.x / this._cellSize);
      const y = Math.floor(positionComp.position.y / this._cellSize);

      this._grid[y][x].push(entity);

    }

  }

  getAdjacentEntities(entity) {

    const adjacEnts = [];

    if (this._grid.length === 0) { return adjacEnts; }
    if (this._grid[0].length === 0) { return adjacEnts; }

    const position = entity.get('PositionComponent');
    const x = Math.floor(position.position.x / this._cellSize);
    const y = Math.floor(position.position.y / this._cellSize);

    const minY = _.clamp(y - 1, 0, this._grid.length - 1);
    const maxY = _.clamp(y + 1, 0, this._grid.length - 1);
    const minX = _.clamp(x - 1, 0, this._grid[0].length - 1);
    const maxX = _.clamp(x + 1, 0, this._grid[0].length - 1);

    for (let yy = minY; yy <= maxY; ++yy) {

      for (let xx = minX; xx <= maxX; ++xx) {

        const cell = this._grid[yy][xx];

        for (let i = 0; i < cell.length; ++i) {
          adjacEnts.push(cell[i]);
        }

      }

    }

    return adjacEnts;

  }

}
