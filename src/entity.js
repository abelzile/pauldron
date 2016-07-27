import _ from 'lodash';
import * as ArrayUtils from './utils/array-utils';
import * as ObjectUtils from './utils/object-utils';


export default class Entity {

  constructor(id = ObjectUtils.createUuidV4()) {

    this.id = id;
    this.components = [];
    this.deleted = false;

  }

  add(component) {

    if (!component) { return this; }

    this.components.push(component);

    return this;

  }

  addRange(components) {

    _.each(components, c => { this.add(c); });

    return this;

  }

  get(typeName, find) {

    if (!find) {
      return _.find(this.components, c => this._is(c, typeName));
    }

    const all = this.getAll(typeName);

    if (all.length === 0) { return null; }

    return _.find(all, find);

  }

  getAll(typeName, filter) {

    const typeMatches = _.filter(this.components, c => this._is(c, typeName));

    if (!filter) {
      return typeMatches;
    }

    return _.filter(typeMatches, filter);

  }

  getAllKeyed(typeName, key) {
    return _.keyBy(this.getAll(typeName), key);
  }

  getFirst(...typeNames) {

    for (const typeName of typeNames) {

      if (this.has(typeName)) {
        return this.get(typeName);
      }

    }

    return null;

  }

  has(typeName) {
    return !!this.get(typeName);
  }

  hasAny(...typeNames) {

    switch (typeNames.length) {

      case 0:
        return false;
      case 1:
        return this.has(typeNames[0]);
      default:
        return _.some(typeNames, s => this.has(s));

    }

  }

  remove(component) {

    ArrayUtils.remove(this.components, component);

  }

  removeByType(typeName) {

    const component = this.get(typeName);

    if (component) {
      ArrayUtils.remove(this.components, component);
    }

  }

  clone() {

    const newEntity = new Entity();
    newEntity.components.push(..._.map(this.components, (component) => component.clone()));

    return newEntity;

  }

  _is(obj, typeName) {

    if (obj.constructor.name === typeName) {
      return true;
    }

    let o = obj;

    do {

      if (o.constructor.name === typeName) {
        return true;
      }

    } while (o = Object.getPrototypeOf(o));

    return false;

  }

}
