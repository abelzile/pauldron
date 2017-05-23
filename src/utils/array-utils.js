'use strict';
import * as _ from 'lodash';

export function clear(arr) {
  /*while (arr.length > 0) {
    arr.pop();
  }*/
  arr.length = 0;
}

export function remove(arr, obj) {
  return removeAt(arr, arr.indexOf(obj));
}

export function removeAt(arr, index) {
  if (index !== -1) {
    arr.splice(index, 1);
    return true;
  }
  return false;
}

export function create(length, defaultValue) {
  if (typeof defaultValue === 'function') {
    return _.range(length).map(defaultValue);
  } else {
    return _.range(length).map(() => defaultValue);
  }
}

export function create2d(dim1Length, dim2Length, defaultValue) {
  return _.range(dim1Length).map(() => create(dim2Length, defaultValue));
}

export function append(arr, ...arrs) {
  if (arrs.length === 0) {
    return arr;
  }

  for (let i = 0; i < arrs.length; ++i) {
    const a = arrs[i];
    for (let j = 0; j < a.length; ++j) {
      arr.push(a[j]);
    }
  }
}

export function selectWeighted(arr) {
  if (!arr) {
    return null;
  }

  if (arr.length === 0) {
    return null;
  }

  if (arr.length === 1) {
    return arr[0];
  }

  let completeWeight = 0;

  for (let i = 0; i < arr.length; ++i) {
    completeWeight += arr[i].weight;
  }

  const r = Math.random() * completeWeight;
  let countWeight = 0;

  for (let i = 0; i < arr.length; ++i) {
    const item = arr[i];

    countWeight += item.weight;

    if (countWeight >= r) {
      return item;
    }
  }

  return null;
}