// See https://gamealchemist.wordpress.com/2013/09/08/no-more-garbage-pooling-objects-built-with-constructor-functions-verbose-version/
export default class Poolable {

  constructor() {
  }

  static setupPool(newPoolSize) {

    if (newPoolSize < 0) { throw('setupPool takes a size >= 0 as argument.'); }

    this.pool = this.pool || [];
    this.poolSize = this.poolSize || 0;

    // pre-fill the pool.
    while (this.poolSize < newPoolSize) {
      (new this()).pdispose();
    }

    // reduce the pool size if new size is smaller than previous size.
    if (this.poolSize > newPoolSize) {
      this.poolSize = newPoolSize;
      this.pool.length = newPoolSize; // allow for g.c.
    }

  }

  static pnew() {

    let pnewObj = null;

    if (this.poolSize !== 0) { // the pool contains objects : grab one

      this.poolSize--;

      pnewObj = this.pool[this.poolSize];

      this.pool[this.poolSize] = null;

    } else {

      pnewObj = new this(); // the pool is empty : create new object

    }

    this.apply(pnewObj, arguments); // initialize object

    return pnewObj;

  }

  pdispose() {

    const ctor = this.constructor;

    this.dispose && this.dispose();

    ctor.pool[ctor.poolSize++] = this;

  }

}

