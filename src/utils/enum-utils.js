import _ from 'lodash';


export function create(obj) {
  return Object.freeze(_.extend(Object.create(null), obj));
}
