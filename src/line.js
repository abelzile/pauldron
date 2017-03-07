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
    if ((a1.x === a2.x && a1.y === a2.y) || (b1.x === b2.x && b1.y === b2.y)) {
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
          (a1.x >= b1.x && a1.x <= b2.x) ||
          (a1.x <= b1.x && a1.x >= b2.x) ||
          (a2.x >= b1.x && a2.x <= b2.x) ||
          (a2.x <= b1.x && a2.x >= b2.x) ||
          (b1.x >= a1.x && b1.x <= a2.x) ||
          (b1.x <= a1.x && b1.x >= a2.x)
        ) {
          if (
            (a1.y >= b1.y && a1.y <= b2.y) ||
            (a1.y <= b1.y && a1.y >= b2.y) ||
            (a2.y >= b1.y && a2.y <= b2.y) ||
            (a2.y <= b1.y && a2.y >= b2.y) ||
            (b1.y >= a1.y && b1.y <= a2.y) ||
            (b1.y <= a1.y && b1.y >= a2.y)
          ) {
            return true;
          }
        }
      }

      return false;
    }

    return true;
  }

  /// <summary>
  /// Returns the intersection point of the given lines.
  /// Returns Empty if the lines do not intersect.
  /// Source: http://mathworld.wolfram.com/Line-LineIntersection.html
  /// </summary>
  static lineIntersection(v1, v2, v3, v4) {
    const tolerance = 0.000001;

    const a = Line.det2(v1.x - v2.x, v1.y - v2.y, v3.x - v4.x, v3.y - v4.y);
    if (Math.abs(a) < Number.EPSILON) {
      return null; // Lines are parallel
    }

    const d1 = Line.det2(v1.x, v1.y, v2.x, v2.y);
    const d2 = Line.det2(v3.x, v3.y, v4.x, v4.y);
    const x = Line.det2(d1, v1.x - v2.x, d2, v3.x - v4.x) / a;
    const y = Line.det2(d1, v1.y - v2.y, d2, v3.y - v4.y) / a;

    if (x < Math.min(v1.x, v2.x) - tolerance || x > Math.max(v1.x, v2.x) + tolerance) {
      return null;
    }
    if (y < Math.min(v1.y, v2.y) - tolerance || y > Math.max(v1.y, v2.y) + tolerance) {
      return null;
    }
    if (x < Math.min(v3.x, v4.x) - tolerance || x > Math.max(v3.x, v4.x) + tolerance) {
      return null;
    }
    if (y < Math.min(v3.y, v4.y) - tolerance || y > Math.max(v3.y, v4.y) + tolerance) {
      return null;
    }

    return new Vector(x, y);
  }

  /// <summary>
  /// Returns the determinant of the 2x2 matrix defined as
  /// <list>
  /// <item>| x1 x2 |</item>
  /// <item>| y1 y2 |</item>
  /// </list>
  /// </summary>
  static det2(x1, x2, y1, y2) {
    return x1 * y2 - y1 * x2;
  }
}
