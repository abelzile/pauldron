'use strict';
import * as _ from 'lodash';

export function buildFromString(str) {

  if (!str) {
    return _.noop;
  }

  let args = str.substring(str.indexOf('(') + 1, str.indexOf(')'));
  args = _.trim(args);

  let argsArray = [];
  if (args.length > 0) {
    argsArray = _.map(args.split(','), _.trim);
  }

  let body = str.substring(str.indexOf('{') + 1, str.lastIndexOf('}'));

  return argsArray.length === 0 ? new Function(body) : new Function(argsArray, body);

}
