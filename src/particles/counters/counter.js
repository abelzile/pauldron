export default class Counter {

  constructor() {
  }

  startEmitter(emitter) {
    throw new Error('startEmitter() must be overridden.');
  }

  updateEmitter(emitter, time) {
    throw new Error('updateEmitter() must be overridden.');
  }

  stop() {
    throw new Error('stop() must be overridden.');
  }

  resume() {
    throw new Error('resume() must be overridden.');
  }

  isComplete() {
    throw new Error('complete() must be overridden.');
  }

  isRunning() {
    throw new Error('running() must be overridden.');
  }

}