import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import System from '../system';

export default class MerchantShopInputSystem extends System {
  constructor() {
    super();
    this._gui = null;
    this._close = false;
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    this._gui = EntityFinders.findMerchantShopGui(entities);
    const header = this._gui.get('DialogHeaderComponent');
    header && header.closeButtonOn && header.closeButtonOn('mousedown', this._onButtonDown.bind(this));
  }

  unload(entities) {
    this._gui.get('DialogHeaderComponent').removeAllListeners();
  }

  processEntities(gameTime, entities, input) {
    if (input.isPressed(Const.Button.X) || input.isPressed(Const.Button.Esc)) {
      this._close = true;
    }

    if (this._close) {
      this.emit('close', entities);
    }
  }

  _onButtonDown() {
    this._close = true;
  }
}
