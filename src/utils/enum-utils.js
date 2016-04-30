import _ from 'lodash';


export function create(...obj) {
  return _.reduce(obj, (done, o) => _.assign(done, o), Object.create(null));
}
