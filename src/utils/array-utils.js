'use strict';
import * as _ from 'lodash';

export function clear(arr) {
  /*while (arr.length > 0) {
    arr.pop();
  }*/
  arr.length = 0;
}

export function remove(arr, obj) {
  const i = arr.indexOf(obj);

  if (i !== -1) {
    arr.splice(i, 1);
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

export function forEach(arr, func) {
  if (!arr || !func) {
    return;
  }

  for (let i = 0; i < arr.length; ++i) {
    func(arr[i]);
  }
}

export function find(arr, func) {
  if (!arr || !func) {
    return null;
  }

  for (let i = 0; i < arr.length; ++i) {
    const val = arr[i];

    if (func(val)) {
      return val;
    }
  }

  return null;
}

export function filter(arr, func) {
  const result = [];

  if (!arr || !func) {
    return result;
  }

  for (let i = 0; i < arr.length; ++i) {
    const val = arr[i];

    if (func(val)) {
      result.push(val);
    }
  }

  return result;
}

export function includes(arr, val) {
  if (!arr) {
    return false;
  }

  for (let i = 0; i < arr.length; ++i) {
    if (arr[i] === val) {
      return true;
    }
  }

  return false;
}

export function map(arr, func, omitFalsey = true) {
  const results = [];

  if (!arr || !func) {
    return results;
  }

  for (let i = 0; i < arr.length; ++i) {
    const result = func(arr[i]);

    if (result) {
      results.push(result);
    } else {
      if (!omitFalsey) {
        results.push(result);
      }
    }
  }

  return results;
}

export function reduce(arr, func, accum) {
  if (!accum) {
    throw new Error('accumulator required.');
  }

  if (!arr || !func) {
    return accum;
  }

  for (let i = 0; i < arr.length; ++i) {
    accum = func(accum, arr[i]);
  }

  return accum;
}

export function sample(arr) {
  if (!arr || arr.length === 0) {
    return null;
  }
  return arr.length === 1 ? arr[0] : arr[Math.floor(Math.random() * arr.length)];
}
