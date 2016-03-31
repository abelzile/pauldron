import EventEmitter from 'eventemitter2';


export default class Game extends EventEmitter {

  constructor(screenManager, { fps: fps = 60.0 } = {}) {

    super();

    if (!screenManager) { throw new Error('screenManager cannot be null or undefined.'); }

    this._screenManager = screenManager;

    this._fps = fps;
    this._step = 1000.0 / this._fps;
    this._dt = 0.0;
    this._time = 0.0;
    this._accumulator = 0.0;

  }

  start() {

    this.emit('game.start');

    this._screenManager.initialize();
    this._screenManager.loadContent();

    this._dt = 0;
    this._time = 0;
    this._accumulator = 0.0;

    this.frame(window.performance.now());

  }

  frame(time) {

    this._dt = Math.min(1000.0, time - this._time);
    this._time = time;
    this._accumulator += this._dt;

    while (this._accumulator >= this._step) {
      this.update(this._step);
      this._accumulator -= this._step;
    }

    this.draw(this._dt);

    window.requestAnimationFrame(this.frame.bind(this, window.performance.now()));

  }

  update(dt) {
    this._screenManager.update(dt);
    this.emit('game.update', dt);
  }

  draw(dt) {
    this._screenManager.draw(dt);
    this.emit('game.draw', dt);
  }

}
