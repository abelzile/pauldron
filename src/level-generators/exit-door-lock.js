import * as EntityFinders from '../entity-finders';
import Lock from './lock';

export default class ExitDoorLock extends Lock {

  constructor(entityId) {
    super();
    this.entityId = entityId;
  }

  canUnlock(entities) {
    return !EntityFinders.findById(entities, this.entityId);
  }

  clone() {
    return new ExitDoorLock(this.entityId);
  }

}