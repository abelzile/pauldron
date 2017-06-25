'use strict';
import * as Const from '../const';

export function normalizeAngle(a, center) {
  return a - Const.Radians2Pi * Math.floor((a + Math.PI - center) / Const.Radians2Pi);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}