'use strict';

export function getNumberSign(num) {
  if (!num) {
    return '';
  }
  return num.value < 0 ? '-' : '+';
}

export function formatIdString(str) {
  if (!str) {
    return '';
  }
  return str.replace(/_/g, ' ');
}

export function formatNumber(num = '') {
  if (!num) {
    return '';
  }
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
}

export function randomString(len = 8) {
  // see http://stackoverflow.com/a/19964557/1004010
  return Array(len + 1).join((Math.random().toString(36) + '00000000000000000').slice(2, 18)).slice(0, len);
}
