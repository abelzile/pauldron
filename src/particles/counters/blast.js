import Counter from './counter';

export default class Blast extends Counter {

  constructor(startCount = 0) {
    super();
    this._startCount = startCount;
    this._done = false;
  }

  startEmitter(emitter) {
    this._done = true;
    return this._startCount;
  }

  updateEmitter(emitter, time) {
    return 0;
  }

  stop() {
  }

  resume() {
  }

  isComplete() {
    return this._done;
  }

  isRunning() {
    return false;
  }
}