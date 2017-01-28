import Lock from './lock';

export default class BossDoorLock extends Lock {

  constructor() {
    super();
  }

  canUnlock(entities) {
    return true;
  }

  clone() {
    return new BossDoorLock();
  }

}