import _ from 'lodash';


export function create(...objs) {

  if (objs.length === 0) { throw new Error('Must provide at least one object to create enum from.'); }

  return Object.freeze(_.assign(Object.create(null), ...objs));

}
