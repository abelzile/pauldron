import * as _ from 'lodash';
import * as ArrayUtils from './utils/array-utils';
import * as ObjectUtils from './utils/object-utils';
import EventEmitter from 'eventemitter2';

export default class Entity extends EventEmitter {
  constructor(id = ObjectUtils.createUuidV4()) {
    super();
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
    return _.includes(this.tags, tag);
  }

  add(component) {
    component && this.components.push(component);
    this.emit('add', this, component);
    return this;
  }

  addRange(components) {
    if (components && components.length > 0) {
      for (const component of components) {
        this.add(component);
      }
    }
    return this;
  }

  get(typeName, find) {
    if (!find) {
      for (let i = 0; i < this.components.length; ++i) {
        let c = this.components[i];
        if (Entity.is(c, typeName)) {
          return c;
        }
      }
    } else {
      const all = this.getAll(typeName);

      if (all.length === 0) {
        return null;
      }

      const c = all.find(find);

      if (c) {
        return c;
      }
    }

    return null;
  }

  getOne(typeName) {
    return this.get(typeName, null);
  }

  getAll(typeName, filter) {
    const typeMatches = [];

    for (const component of this.components) {
      if (Entity.is(component, typeName)) {
        typeMatches.push(component);
      }
    }

    if (!filter) {
      return typeMatches;
    }

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

  getOfFirstMatchingType(...typeNames) {
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
    this.emit('remove', this, component);
    ArrayUtils.remove(this.components, component);
  }

  removeByType(typeName) {
    const component = this.get(typeName);

    if (component) {
      this.remove(component)
    }
  }

  clear() {
    _.forEachRight(this.components, c => this.remove(c));
    ArrayUtils.clear(this.components);
    ArrayUtils.clear(this.tags);
  }

  clone() {
    const newEntity = new Entity();
    newEntity.setTags(...this.tags);
    newEntity.components.push(...this.components.map(c => c.clone()));

    return newEntity;
  }

  static is(obj, typeName) {
    if (obj.constructor.name === typeName) {
      return true;
    }

    let o = obj;

    do {
      if (o.constructor.name === typeName) {
        return true;
      }
    } while ((o = Object.getPrototypeOf(o)));

    return false;
  }
}
