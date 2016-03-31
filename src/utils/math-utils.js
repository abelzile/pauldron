import _ from 'lodash';


export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function random(min, max, floating = false) {
  return _.random(min, max, floating);
}
