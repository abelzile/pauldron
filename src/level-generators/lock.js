export default class Lock {

  constructor() {
    this.isLocked = true;
  }

  canUnlock(entities) {
    throw new Error('Must override canUnlock.');
  }

  unlock() {
    this.isLocked = false;
  }

  clone() {
    throw new Error('Must override clone.');
  }

}