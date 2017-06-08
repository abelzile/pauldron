import Poolable from './poolable';
import Vector from './vector';

export default class Circle extends Poolable {
  constructor(origin = new Vector(), radius = 1) {
    super();
    this.pinitialize(origin, radius);
  }

  pinitialize(origin = new Vector(), radius = 1) {
    this.origin = origin;
    this.radius = radius;
  }
}
