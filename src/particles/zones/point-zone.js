import Zone from './zone';
import Vector from '../../vector';

export default class PointZone extends Zone {

  constructor(point = new Vector(0, 0)) {
    super();
    this._point = point;
  }

  getRandomPoint() {
    return this._point.clone();
  }

}