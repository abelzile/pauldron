import * as EntityFinders from '../entity-finders';
import Lock from './lock';

export default class ExitDoorLock extends Lock {

  constructor(entityId) {
    super();
    this.entityId = entityId;
  }

  canUnlock(entities) {

    console.log('find ' + this.entityId);

    const ent = EntityFinders.findById(entities, this.entityId);

    console.log('found mob?: ' + !!ent);

    return !ent;

  }

  clone() {
    return new ExitDoorLock(this.entityId);
  }

}