import _ from 'lodash';
import * as ObjectUtils from './object-utils';

export function create(...objs) {
  if (_.isEmpty(objs)) {
    throw new Error('Must provide at least one object to create enum from.');
  }
  return ObjectUtils.createImmutable(...objs);
}
