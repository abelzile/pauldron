import Poolable from './poolable';
import Vector from './vector';

export default class Line extends Poolable {

  constructor(x1, y1, x2, y2) {

    super();

    this.point1 = new Vector(x1, y1);
    this.point2 = new Vector(x2, y2);

  }

  get angle() {
    return Math.atan2(this.point2.y - this.point1.y, this.point2.x - this.point1.x);
  }

  get lineLength() {
    return Math.sqrt(this.lineLengthSquared);
  }

  get lineLengthSquared() {
    const dx = this.point1.x - this.point2.x;
    const dy = this.point1.y - this.point2.y;
    return dx * dx + dy * dy;
  }

  zero() {
    this.point1.zero();
    this.point2.zero();
  }

  intersectsWith(line) {
    return this._checkLineLineIntersection(this.point1, this.point2, line.point1, line.point2);
  }

  calculateBresenham() {
    // See http://www.roguebasin.com/index.php?title=Breshenham%27s_Line_Algorithm

    let x0 = this.point1.x;
    let y0 = this.point1.y;
    let x1 = this.point2.x;
    let y1 = this.point2.y;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;

    let err = dx - dy;

    const points = [];

    while (true) {

      points.push(new Vector(x0, y0));

      if (x0 === x1 && y0 === y1) {
        break;
      }

      const e2 = err * 2;

      if (e2 > -dx) {
        err -= dy;
        x0 += sx;
      }

      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }

    return points;

  }


  clone() {
    return new Line(this.point1.x, this.point1.y, this.point2.x, this.point2.y);
  }

  _checkLineLineIntersection(a1, a2, b1, b2) {
    // See http://gigglingcorpse.com/2015/06/25/line-segment-intersection/

    // Return false if either of the lines have zero length
    if (a1.x === a2.x && a1.y === a2.y || b1.x === b2.x && b1.y === b2.y) {
      return false;
    }

    // Fastest method, based on Franklin Antonio's "Faster Line Segment Intersection" topic "in Graphics Gems III" book (http://www.graphicsgems.org/)
    const ax = a2.x - a1.x;
    const ay = a2.y - a1.y;
    const bx = b1.x - b2.x;
    const by = b1.y - b2.y;
    const cx = a1.x - b1.x;
    const cy = a1.y - b1.y;

    const alphaNumerator = by * cx - bx * cy;
    const commonDenominator = ay * bx - ax * by;

    if (commonDenominator > 0) {
      if (alphaNumerator < 0 || alphaNumerator > commonDenominator) {
        return false;
      }
    } else if (commonDenominator < 0) {
      if (alphaNumerator > 0 || alphaNumerator < commonDenominator) {
        return false;
      }
    }

    const betaNumerator = ax * cy - ay * cx;

    if (commonDenominator > 0) {
      if (betaNumerator < 0 || betaNumerator > commonDenominator) {
        return false;
      }
    } else if (commonDenominator < 0) {
      if (betaNumerator > 0 || betaNumerator < commonDenominator) {
        return false;
      }
    }

    if (commonDenominator === 0) {
      // This code wasn't in Franklin Antonio's method. It was added by Keith Woodward.
      // The lines are parallel, check if they're collinear.
      const y3LessY1 = b1.y - a1.y;
      const collinearityTestForP3 = a1.x * (a2.y - b1.y) + a2.x * y3LessY1 + b1.x * (a1.y - a2.y); // see http://mathworld.wolfram.com/Collinear.html

      // If p3 is collinear with p1 and p2 then p4 will also be collinear, since p1-p2 is parallel with p3-p4
      if (collinearityTestForP3 == 0) {
        // The lines are collinear. Now check if they overlap.
        if (
          a1.x >= b1.x && a1.x <= b2.x ||
            a1.x <= b1.x && a1.x >= b2.x ||
            a2.x >= b1.x && a2.x <= b2.x ||
            a2.x <= b1.x && a2.x >= b2.x ||
            b1.x >= a1.x && b1.x <= a2.x ||
            b1.x <= a1.x && b1.x >= a2.x
        ) {
          if (
            a1.y >= b1.y && a1.y <= b2.y ||
              a1.y <= b1.y && a1.y >= b2.y ||
              a2.y >= b1.y && a2.y <= b2.y ||
              a2.y <= b1.y && a2.y >= b2.y ||
              b1.y >= a1.y && b1.y <= a2.y ||
              b1.y <= a1.y && b1.y >= a2.y
          ) {
            return true;
          }
        }
      }

      return false;

    }

    return true;

  }

}
