import Counter from './counter';
import * as _ from 'lodash';

export default class SteadyCounter extends Counter {
  constructor(rate = 0) {
    super();

    this._timeToNext = 0;
    this._rate = 0;
    this._rateInv = 0;
    this._running = false;

    this.rate = rate;
  }

  get rate() {
    return this._rate;
  }

  set rate(value) {
    if (!value || !_.isNumber(value) || value < 0) {
      value = 0;
    }

    if (this._rate === value) {
      return;
    }

    if (this._rate && value) {
      const timePassed = this._rateInv - this._timeToNext;
      this._rate = value;
      this._rateInv = value ? 1000 / value : Number.MAX_VALUE;
      this._timeToNext = Math.max(this._rateInv - timePassed, 0);
    } else {
      this._rate = value;
      this._rateInv = value ? 1000 / value : Number.MAX_VALUE;
      this._timeToNext = this._rateInv;
    }
  }

  startEmitter(emitter) {
    this._running = true;
    this._timeToNext = this._rateInv;
    return 0;
  }

  updateEmitter(emitter, time) {
    if (!this._running) {
      return 0;
    }

    let count = 0;
    this._timeToNext -= time;
    while (this._timeToNext <= 0) {
      ++count;
      this._timeToNext += this._rateInv;
    }
    return count;
  }

  stop() {
    this._running = false;
  }

  resume() {
    this._running = true;
  }

  isComplete() {
    return false;
  }

  isRunning() {
    return this._running;
  }
}
