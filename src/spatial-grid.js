import * as ArrayUtils from './utils/array-utils';
import * as MathUtils from './utils/math-utils';


export default class SpatialGrid {

  constructor(width = 1, height = 1, cellSize = 1) {

    this._width = width;
    this._height = height;
    this._cellSize = cellSize;
    this._entities = [];
    this._grid = undefined;

  }

  add(entity) {
    this._entities.push(entity);
  }

  remove(entity) {
    ArrayUtils.remove(this._entities, entity);
  }

  update() {

    this._grid = ArrayUtils.create2d(Math.ceil(this._height / this._cellSize),
                                     Math.ceil(this._width / this._cellSize),
                                     () => { return []; });

    for (const entity of this._entities) {

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

    const positionComp = entity.get('PositionComponent');
    const x = Math.floor(positionComp.position.x / this._cellSize);
    const y = Math.floor(positionComp.position.y / this._cellSize);

    const minY = MathUtils.clamp(y - 1, 0, this._grid.length - 1);
    const maxY = MathUtils.clamp(y + 1, 0, this._grid.length - 1);
    const minX = MathUtils.clamp(x - 1, 0, this._grid[0].length - 1);
    const maxX = MathUtils.clamp(x + 1, 0, this._grid[0].length - 1);

    for (let yy = minY; yy <= maxY; ++yy) {

      for (let xx = minX; xx <= maxX; ++xx) {

        for (const adjacEntity of this._grid[yy][xx]) {
          adjacEnts.push(adjacEntity);
        }

      }

    }

    return adjacEnts;

  }

}
