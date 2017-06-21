import _ from 'lodash';

export default class Component {
  constructor(onRemoveFromEntity = _.noop) {
    this.onRemoveFromEntity = onRemoveFromEntity;
  }

  clone() {
    throw new Error('clone must be overridden.');
  }
}
