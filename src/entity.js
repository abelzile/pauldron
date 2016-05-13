import _ from 'lodash';
import * as ArrayUtils from './utils/array-utils';
import * as ObjectUtils from './utils/object-utils';


export default class Entity {

  constructor() {

    this._id = ObjectUtils.createUuidV4();
    this._components = [];
    this._deleted = false;

  }

  get id() { return this._id; }

  get components() { return this._components; }

  get deleted() { return this._deleted; }
  set deleted(value) { this._deleted = value; }

  add(component) {

    this._components.push(component);

    return this;

  }

  addRange(components) {

    _.each(components, c => { this.add(c); })

    return this;

  }

  get(typeName, find) {

    if (!find) {
      return _.find(this._components, component => ObjectUtils.getTypeName(component) === typeName);
    }

    const all = this.getAll(typeName);

    if (all.length === 0) { return null; }

    return _.find(all, find);

  }

  getAll(typeName) {
    return _.filter(this._components, c => ObjectUtils.getTypeName(c) === typeName);
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

    ArrayUtils.remove(this._components, component);

  }

  removeByType(typeName) {

    const component = this.get(typeName);

    if (component !== undefined) {
      ArrayUtils.remove(this._components, component);
    }

  }

  clone() {

    const newEntity = new Entity();
    newEntity.components.push(..._.map(this._components, (component) => component.clone()));

    return newEntity;

  }

}
