// See https://gamealchemist.wordpress.com/2013/09/08/no-more-garbage-pooling-objects-built-with-constructor-functions-verbose-version/
export default class Poolable {
  constructor() {}

  static setupPool(newPoolSize) {
    if (newPoolSize < 0) {
      throw 'setupPool takes a size >= 0 as argument.';
    }

    this.pool = this.pool || [];
    this.poolSize = this.poolSize || 0;

    while (this.poolSize < newPoolSize) {
      new this().pdispose();
    }

    if (this.poolSize > newPoolSize) {
      this.poolSize = newPoolSize;
      this.pool.length = newPoolSize;
    }
  }

  static pnew() {
    let pnewObj = null;

    if (this.poolSize !== 0) {
      this.poolSize--;

      pnewObj = this.pool[this.poolSize];

      this.pool[this.poolSize] = null;
    } else {
      pnewObj = new this();
    }

    this.apply(pnewObj, arguments);

    return pnewObj;
  }

  pdispose() {
    const ctor = this.constructor;

    this.dispose && this.dispose();

    ctor.pool[ctor.poolSize++] = this;
  }
}
