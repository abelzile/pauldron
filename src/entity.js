import * as _ from 'lodash';
import * as ArrayUtils from './utils/array-utils';
import * as ObjectUtils from './utils/object-utils';


export default class Entity {

  constructor(id = ObjectUtils.createUuidV4()) {

    this.id = id;
    this.tags = [];
    this.components = [];
    this.deleted = false;

  }

  setTags(...tags) {

    ArrayUtils.append(this.tags, tags);

    return this;

  }

  hasTag(tag) {

    for (let i = 0; i < this.tags.length; ++i) {

      if (this.tags[i] === tag) {
        return true;
      }

    }

    return false;

  }

  add(component) {

    component && this.components.push(component);

    return this;

  }

  addRange(components) {

    if (!components || components.length === 0) { return this; }

    /*for (let i = 0; i < components.length; ++i) {
      this.components.push(components[i]);
    }*/

    ArrayUtils.append(this.components, components);

    return this;

  }

  get(typeName, find) {

    if (!find) {

      for (let i = 0; i < this.components.length; ++i) {

        let c = this.components[i];

        if (this._is(c, typeName)) {
          return c;
        }

      }

    } else {

      const all = this.getAll(typeName);

      if (all.length === 0) { return null; }

      for (let i = 0; i < all.length; ++i) {

        const c = all[i];

        if (find(c)) {
          return c;
        }

      }

    }

    return null;

  }

  getAll(typeName, filter) {

    const typeMatches = [];

    for (let i = 0; i < this.components.length; ++i) {

      let c = this.components[i];

      if (this._is(c, typeName)) {
        typeMatches.push(c);
      }

    }

    if (!filter) { return typeMatches; }

    const filterMatches = [];

    for (let i = 0; i < typeMatches.length; ++i) {

      const possibleMatch = typeMatches[i];

      if (filter(possibleMatch)) {
        filterMatches.push(possibleMatch);
      }

    }

    return filterMatches;

  }

  getAllKeyed(typeName, key) {
    return _.keyBy(this.getAll(typeName), key);
  }

  getAllKeyValueMap(typeName, key, value, filter) {

    const stats = this.getAll(typeName, filter);

    if (stats && stats.length > 0) {
      return _.zipObject(_.map(stats, key), _.map(stats, value));
    }

    return null;

  }

  getFirst(...typeNames) {

    for (let i = 0; i < typeNames.length; ++i) {

      const typeName = typeNames[i];

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

    component.onRemoveFromEntity && component.onRemoveFromEntity.call(this);

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
    newEntity.setTags(...this.tags);
    newEntity.components.push(..._.map(this.components, c => c.clone()));

    return newEntity;

  }

  _is(obj, typeName) {

    if (obj.constructor.name === typeName) { return true; }

    let o = obj;

    do {

      if (o.constructor.name === typeName) {
        return true;
      }

    } while (o = Object.getPrototypeOf(o));

    return false;

  }

}
