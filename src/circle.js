import Poolable from './poolable';
import Vector from './vector';

export default class Circle extends Poolable {
  constructor(origin = new Vector(), radius = 1) {
    super();
    this.origin = origin;
    this.radius = radius;
  }
}
