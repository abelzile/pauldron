import * as Const from '../const';
import MerchantShopInputSystem from '../systems/merchant-shop-input-system';
import MerchantShopRenderSystem from '../systems/merchant-shop-render-system';
import MerchantShopUpdateSystem from '../systems/merchant-shop-update-system';
import Screen from '../screen';
import * as _ from 'lodash';

export default class MerchantShopScreen extends Screen {
  constructor(levelScreen, merchantId) {
    super(true);

    this._levelScreen = levelScreen;
    this.merchantId = merchantId;

    this._inputSystem = null;
    this._updateSystem = null;
    this._renderSystems = null;
  }

  activate(entities) {
    super.activate(entities);

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(Const.ScreenScale);

    this._renderSystem = new MerchantShopRenderSystem(this, renderer, entityManager);
    this._renderSystems = [this._renderSystem];

    for (let i = 0; i < this._renderSystems.length; ++i) {
      this._renderSystems[i].initialize(entities);
    }

    this._inputSystem = new MerchantShopInputSystem(entityManager);
    this._inputSystem.initialize(entities);
    this._inputSystem.on('close', () => {
      this.exitScreen();
    });

    this._updateSystem = new MerchantShopUpdateSystem(renderer, entityManager, this.merchantId);
    this._updateSystem.initialize(entities).on('start-drag', iconSprite => {
      // sprite drag end events don't work properly if sprite is not drawn above sprite it is overlapping, so move current sprite to draw last
      this.swapChildren(iconSprite, _.last(this.children));
    }).on('buy', () => {
      this._renderSystem.refreshBackpack(entities);
    });
  }

  unload(entities) {
    this._inputSystem.removeAllListeners();
    this._inputSystem.unload(entities);

    this._updateSystem.removeAllListeners();
    this._updateSystem.unload(entities, this._levelScreen);

    for (let i = 0; i < this._renderSystems.length; ++i) {
      const renderSystem = this._renderSystems[i];
      renderSystem.removeAllListeners();
      renderSystem.unload(entities, this._levelScreen);
    }
  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {
    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);

    if (!this.isActive) {
      return;
    }

    this._updateSystem.process(gameTime, entities);
  }

  handleInput(gameTime, entities, input) {
    super.handleInput(gameTime, entities, input);

    this._inputSystem.process(gameTime, entities, input);
  }

  draw(gameTime, entities) {
    super.draw(gameTime, entities);

    if (!this.isActive) {
      return;
    }

    for (let i = 0; i < this._renderSystems.length; ++i) {
      this._renderSystems[i].process(gameTime, entities);
    }
  }
}
