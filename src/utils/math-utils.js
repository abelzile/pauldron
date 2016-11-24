import * as Const from '../const';

export function normalizeAngle(a, center) {
  return a - Const.Radians2Pi * Math.floor((a + Math.PI - center) / Const.Radians2Pi);
}